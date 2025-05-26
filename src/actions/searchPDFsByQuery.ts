"use server";

import { PDFEmbedding } from "@/feature/admin/interfaces/pdfData.interface";
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function searchPDFsByQuery(query: string) {
  const { data: embedData } = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
    dimensions: 1536,
  });

  const [{ embedding }] = embedData;

  const { data, error } = await supabase.rpc("match_pdf_embeddings", {
    query_embedding: embedding,
    match_threshold: 0.8,
    match_count: 5,
  });

  if (error) return { error: "Error al buscar documentos." };
  return { results: data };
}

export async function getAllPDFs(): Promise<{
  results?: PDFEmbedding[];
  error?: string;
}> {
  const { data, error } = await supabase
    .from("pdf_embeddings")
    .select("id, file_name, file_url, title, description, created_at")
    .order("created_at", { ascending: false });

  if (error) return { error: "Error al obtener documentos." };
  return { results: data as PDFEmbedding[] };
}
