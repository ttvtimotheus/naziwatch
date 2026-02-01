-- NaziWatch: Moderation – Pending laden & Status ändern (umgeht RLS für Admin).
-- Im Supabase Dashboard: SQL Editor → dieses Skript ausführen.
-- Danach zeigt die App in Profil → Moderation die pending Incidents und Approve/Reject funktioniert.

-- Pending Incidents laden (SECURITY DEFINER = umgeht RLS)
create or replace function public.get_pending_incidents()
returns setof public.incidents
language sql
security definer
set search_path = public
stable
as $$
  select * from public.incidents
  where status = 'pending'
  order by created_at desc;
$$;

grant execute on function public.get_pending_incidents() to anon;

-- Status eines Incidents ändern (Approve/Reject)
create or replace function public.update_incident_status(p_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.incidents
  set status = p_status
  where id = p_id and status = 'pending';
end;
$$;

grant execute on function public.update_incident_status(uuid, text) to anon;
