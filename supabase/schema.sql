-- NaziWatch Supabase schema: incidents, media, RLS, storage.
-- Run this in Supabase SQL Editor.

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null check (category in (
    'propaganda','threat','violence','online','event','other'
  )),
  description text not null,
  occurred_at timestamptz not null,
  lat double precision not null,
  lon double precision not null,
  precision_m integer not null,
  region_text text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  risk_flags jsonb,
  source_meta jsonb
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  type text not null check (type in ('image','video')),
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_incidents_status on public.incidents(status);
create index if not exists idx_incidents_occurred_at on public.incidents(occurred_at desc);
create index if not exists idx_incidents_category on public.incidents(category);
create index if not exists idx_media_incident_id on public.media(incident_id);

-- RLS: public can only read approved incidents; anyone can insert incidents (rate limit via app/edge later).
alter table public.incidents enable row level security;
alter table public.media enable row level security;

create policy "Public can read approved incidents only"
  on public.incidents for select
  using (status = 'approved');

create policy "Anyone can insert incidents (anonymous reports)"
  on public.incidents for insert
  with check (true);

-- Media: only readable if incident is approved. Insert only via service role or after incident insert.
create policy "Public can read media for approved incidents"
  on public.media for select
  using (
    exists (
      select 1 from public.incidents i
      where i.id = media.incident_id and i.status = 'approved'
    )
  );

create policy "Allow insert media for existing incidents"
  on public.media for insert
  with check (true);

-- Storage bucket for incident media (optional: use RLS to restrict reads to approved incidents)
insert into storage.buckets (id, name, public)
values ('incident-media', 'incident-media', false)
on conflict (id) do nothing;

-- Storage policy: allow anonymous upload to incident-media (app will upload after incident insert)
-- Read: only if incident is approved (would need a storage function). Simpler: keep bucket private, use signed URLs from app when incident approved.
create policy "Allow uploads to incident-media"
  on storage.objects for insert
  with check (bucket_id = 'incident-media');

create policy "Allow public read for incident-media (signed URLs or public read for approved only is app-level)"
  on storage.objects for select
  using (bucket_id = 'incident-media');
