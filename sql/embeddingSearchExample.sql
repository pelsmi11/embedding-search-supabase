
create table public.pdf_embeddings (id uuid default gen_random_uuid() not null primary key,
                                                                               file_name text, file_url text, title text, description text, embedding vector(1536),
                                                                                                                                                      created_at timestamp default now());


alter table public.pdf_embeddings owner to postgres;


create policy "public can read pdfs" on public.pdf_embeddings as permissive
for
select to anon using true;

grant
delete,
insert, references,
select, trigger,
truncate,
update on public.pdf_embeddings to anon;

grant
delete,
insert, references,
select, trigger,
truncate,
update on public.pdf_embeddings to authenticated;

grant
delete,
insert, references,
select, trigger,
truncate,
update on public.pdf_embeddings to service_role;


select *
from public.pdf_embeddings
drop function if exists match_pdf_embeddings(vector, double precision, integer);

-- Function to match PDF embeddings based on a query embedding, threshold, and count

create or replace function match_pdf_embeddings(query_embedding vector(1536), match_threshold float, match_count int) returns table (id uuid,
                                                                                                                                        file_name text, file_url text, title text, description text, similarity float) language sql as $$
  select
    id,
    file_name,
    file_url,
    title,
    description,
    1 - (embedding <=> query_embedding) as similarity
  from pdf_embeddings
  where embedding <=> query_embedding < match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;