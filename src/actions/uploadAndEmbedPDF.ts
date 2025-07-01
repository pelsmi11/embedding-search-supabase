"use server";

import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";
import pdf from "pdf-parse";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Función auxiliar para extraer texto con pdf-parse
async function extractPDFTextWithPdfParse(buffer: Buffer): Promise<string> {
  try {
    // pdf() procesa el buffer DIRECTAMENTE AQUÍ, EN EL SERVIDOR.
    // No hace ningún 'fetch' a un servicio externo.
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("Error al extraer texto con pdf-parse:", error);
    throw new Error("No se pudo extraer el texto del PDF con pdf-parse.");
  }
}

export async function uploadAndEmbedPDF(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file || file.type !== "application/pdf") {
    return { error: "Archivo inválido." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `files.embedding/${fileName}`;

  // 1. Subir a Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("files.embedding")
    .upload(filePath, buffer, { contentType: "application/pdf" });

  if (uploadError) return { error: "No se pudo subir el archivo." };

  const {
    data: { publicUrl },
  } = supabase.storage.from("files.embedding").getPublicUrl(filePath);

  // 2. Extraer texto con pdfjs-dist
  const text = await extractPDFTextWithPdfParse(buffer);
  const textToEmbed = text.slice(0, 8000); // límite de tokens

  // 3. Embedding
  const { data: embedData } = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: textToEmbed,
    dimensions: 1536,
  });

  const [{ embedding }] = embedData;

  // 4. Título y descripción con GPT-4o-mini
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    messages: [
      {
        role: "system",
        content:
          "Resume el siguiente texto. Da un título y una breve descripción.",
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

  // 5. Guardar en Supabase
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
