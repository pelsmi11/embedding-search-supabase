"use server";

/**
 * Imports the PDFEmbedding interface for type safety.
 */
import { PDFEmbedding } from "@/feature/admin/interfaces/pdfData.interface";
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";

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
 * Searches PDFs by a given query using OpenAI embeddings and Supabase RPC.
 *
 * @param query - The search query string.
 * @returns An object containing either the search results or an error message.
 */
export async function searchPDFsByQuery(query: string) {
  // Generate an embedding for the query using OpenAI
  const { data: embedData } = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
    dimensions: 1536,
  });

  // Extract the embedding vector from the response
  const [{ embedding }] = embedData;

  // Call the Supabase RPC function to match PDF embeddings
  const { data, error } = await supabase.rpc("match_pdf_embeddings", {
    query_embedding: embedding,
    match_threshold: 0.8,
    match_count: 5,
  });

  if (error) return { error: "Error searching documents." };
  return { results: data };
}

/**
 * Retrieves all PDF embeddings from the database.
 *
 * @returns An object containing either the list of PDF embeddings or an error message.
 */
export async function getAllPDFs(): Promise<{
  results?: PDFEmbedding[];
  error?: string;
}> {
  const { data, error } = await supabase
    .from("pdf_embeddings")
    .select("id, file_name, file_url, title, description, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener documentos:", error);
    return { error: "Error al obtener documentos. " + error.message };
  }
  return { results: data as PDFEmbedding[] };
}
