-- NaziWatch: INSERT per RPC umgehen (umgeht RLS zuverlässig).
-- Im Supabase Dashboard: SQL Editor → dieses Skript ausführen.
-- Danach ruft die App supabase.rpc('insert_incident', { ... }) statt .from('incidents').insert(...) auf.

create or replace function public.insert_incident(
  p_category text,
  p_description text,
  p_occurred_at timestamptz,
  p_lat double precision,
  p_lon double precision,
  p_precision_m integer,
  p_region_text text default null,
  p_status text default 'pending'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.incidents (
    category, description, occurred_at, lat, lon, precision_m, region_text, status
  ) values (
    p_category, p_description, p_occurred_at, p_lat, p_lon, p_precision_m, p_region_text, p_status
  )
  returning id into new_id;
  return new_id;
end;
$$;

grant execute on function public.insert_incident(text, text, timestamptz, double precision, double precision, integer, text, text) to anon;
