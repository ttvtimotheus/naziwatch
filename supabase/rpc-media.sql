-- NaziWatch: Media einfügen (nach Upload) + Media für Incidents laden (Admin).
-- Im Supabase Dashboard: SQL Editor → dieses Skript ausführen.

-- Media-Zeile einfügen (nach Storage-Upload)
create or replace function public.insert_media(
  p_incident_id uuid,
  p_type text,
  p_url text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.media (incident_id, type, url)
  values (p_incident_id, p_type, p_url)
  returning id into new_id;
  return new_id;
end;
$$;

grant execute on function public.insert_media(uuid, text, text) to anon;

-- Media für mehrere Incidents laden (z. B. für Moderation)
create or replace function public.get_media_for_incidents(p_incident_ids uuid[])
returns setof public.media
language sql
security definer
set search_path = public
stable
as $$
  select * from public.media
  where incident_id = any(p_incident_ids);
$$;

grant execute on function public.get_media_for_incidents(uuid[]) to anon;
