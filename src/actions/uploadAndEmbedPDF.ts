"use server";

/**
 * Imports required dependencies for Supabase, OpenAI, and PDF parsing.
 */
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";
import pdf from "pdf-parse";

/**
 * Initializes the Supabase client using environment variables.
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Initializes the OpenAI client using the API key from environment variables.
 */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * Helper function to extract text from a PDF buffer using pdf-parse.
 *
 * @param buffer - The PDF file as a Buffer.
 * @returns The extracted text from the PDF.
 * @throws Error if text extraction fails.
 */
async function extractPDFTextWithPdfParse(buffer: Buffer): Promise<string> {
  try {
    // pdf() processes the buffer directly on the server.
    // No external fetch is performed.
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text with pdf-parse:", error);
    throw new Error("Failed to extract text from PDF with pdf-parse.");
  }
}

/**
 * Handles the upload of a PDF file, extracts its text, generates an embedding,
 * summarizes it with GPT, and stores all data in Supabase.
 *
 * @param formData - The FormData object containing the PDF file.
 * @returns An object indicating success or error, and metadata if successful.
 */
export async function uploadAndEmbedPDF(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file || file.type !== "application/pdf") {
    return { error: "Invalid file." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `files.embedding/${fileName}`;

  // 1. Upload the PDF to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("files.embedding")
    .upload(filePath, buffer, { contentType: "application/pdf" });

  if (uploadError) return { error: "Failed to upload file." };

  const {
    data: { publicUrl },
  } = supabase.storage.from("files.embedding").getPublicUrl(filePath);

  // 2. Extract text from the PDF using pdf-parse
  const text = await extractPDFTextWithPdfParse(buffer);
  const textToEmbed = text.slice(0, 8000); // token limit

  // 3. Generate embedding using OpenAI
  const { data: embedData } = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: textToEmbed,
    dimensions: 1536,
  });

  const [{ embedding }] = embedData;

  // 4. Generate title and description using GPT-4o-mini
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    messages: [
      {
        role: "system",
        content:
          "Summarize the following text. Provide a title and a brief description.",
      },
      {
        role: "user",
        content: textToEmbed,
      },
    ],
  });

  const gptText = completion.choices[0].message.content || "";
  const [titleLine, ...descLines] = gptText.trim().split("\n");
  const title = titleLine.replace(/^Title: */i, "").trim();
  const description = descLines
    .join(" ")
    .replace(/^Description: */i, "")
    .trim();

  // 5. Store metadata and embedding in Supabase
  const { error: dbError } = await supabase.from("pdf_embeddings").insert({
    file_name: fileName,
    file_url: publicUrl,
    title,
    description,
    embedding,
  });

  if (dbError) {
    console.error("Error al guardar en la base de datos:", dbError);
    return { error: "Error al guardar en la base de datos." + dbError.message };
  }

  return { success: true, title, description, url: publicUrl };
}
