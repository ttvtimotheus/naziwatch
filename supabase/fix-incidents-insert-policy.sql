-- NaziWatch: INSERT für incidents erlauben (anon key).
-- Im Supabase Dashboard: SQL Editor → dieses Skript ausführen.
-- Behebt: "new row violates row-level security policy for table incidents"

-- 1) Tabelle: anon braucht INSERT-Recht (RLS prüft nur Zeilen, nicht die Berechtigung).
grant usage on schema public to anon;
grant select, insert on public.incidents to anon;

-- 2) RLS aktiv, Policy explizit für Rolle anon
alter table public.incidents enable row level security;

drop policy if exists "Anyone can insert incidents (anonymous reports)" on public.incidents;

create policy "Anyone can insert incidents (anonymous reports)"
  on public.incidents for insert
  to anon
  with check (true);
