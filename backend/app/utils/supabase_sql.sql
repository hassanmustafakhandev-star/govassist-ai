-- Enable pgvector extension
create extension if not exists vector;

-- Requests Table
create table if not exists requests (
  id uuid primary key,
  citizen_id text,
  type text,
  status text check (status in ('open', 'resolved', 'escalated')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Conversations Table
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade,
  role text check (role in ('citizen', 'agent')),
  message text not null,
  agent_name text,
  confidence float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Agent Logs Table
create table if not exists agent_logs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade,
  agent_name text not null,
  confidence float,
  latency_ms integer,
  input jsonb,
  output jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Documents Table
create table if not exists documents (
  id uuid primary key,
  request_id uuid references requests(id) on delete cascade,
  file_url text not null,
  verification_status text check (verification_status in ('pending', 'verified', 'rejected')),
  ocr_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Policy Documents Table
create table if not exists policy_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  source_url text,
  language text not null check (language in ('en', 'ar')),
  embedding vector(1024), -- bge-m3 generates 1024-dimensional embeddings
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for efficient querying
create index if not exists requests_created_at_idx on requests(created_at desc);
create index if not exists conversations_request_id_idx on conversations(request_id);
create index if not exists agent_logs_request_id_idx on agent_logs(request_id);
create index if not exists agent_logs_created_at_idx on agent_logs(created_at desc);

-- pgvector index for HNSW fast search
create index on policy_documents using hnsw (embedding vector_cosine_ops);

-- Similarity Search RPC Function
CREATE OR REPLACE FUNCTION match_policy_documents(
  query_embedding vector(1024),
  match_count int,
  filter_language text
)
RETURNS TABLE (
  id uuid, title text, content text,
  source_url text, language text,
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT id, title, content, source_url, language,
    1 - (embedding <=> query_embedding) AS similarity
  FROM policy_documents
  WHERE language = filter_language
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- RLS Policies
-- Enable Row Level Security
alter table requests enable row level security;
alter table conversations enable row level security;
alter table agent_logs enable row level security;
alter table documents enable row level security;
alter table policy_documents enable row level security;

-- Drop all policies if they exist (to allow re-running this script)
drop policy if exists "Allow anonymous read access" on policy_documents;
drop policy if exists "Allow anonymous insert access" on requests;
drop policy if exists "Allow anonymous read access" on requests;
drop policy if exists "Allow anonymous insert access" on conversations;
drop policy if exists "Allow anonymous read access" on conversations;
drop policy if exists "Allow anonymous read access" on documents;
drop policy if exists "Allow anonymous insert access" on documents;

-- Citizen (anon) read-only access to policy_documents
create policy "Allow anonymous read access" on policy_documents for select to anon using (true);

-- Citizen (anon) insert and select access to own requests/conversations/documents based on ID
-- (Note: In a real prod app, use authenticated users and match user_id. Here we allow anon access)
create policy "Allow anonymous insert access" on requests for insert to anon with check (true);
create policy "Allow anonymous read access" on requests for select to anon using (true);

create policy "Allow anonymous insert access" on conversations for insert to anon with check (true);
create policy "Allow anonymous read access" on conversations for select to anon using (true);

create policy "Allow anonymous read access" on documents for select to anon using (true);
create policy "Allow anonymous insert access" on documents for insert to anon with check (true);

-- Admin (service_role) gets full access implicitly, no policies needed.
