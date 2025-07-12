SELECT pdf.id,
       pdf.title,
       pdf.description,
       pdf.file_name,
       pdf.file_url
FROM "public"."pdf_embeddings" as pdf
where pdf.title ILIKE '%proyecto%'
    OR pdf.description ILIKE '%proyecto%'
    OR pdf.file_name ILIKE '%proyecto%'
    OR pdf.file_url ILIKE '%proyecto%'
ORDER BY pdf.id DESC
LIMIT 10;