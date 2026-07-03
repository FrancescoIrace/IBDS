-- IBDS - migrazione incrementale
-- Esegui questo script UNA VOLTA nel SQL Editor del tuo progetto Supabase
-- (dopo aver già eseguito 001, 002, 003, 004). Aggiunge il ruolo "boss":
-- permessi identici ad "admin" (compresa gestione utenti/turni/pagamenti),
-- solo con un'etichetta diversa nell'interfaccia.

-- 1. Consenti il nuovo valore 'boss' nella colonna role.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'operatore', 'boss'));

-- 2. Aggiorna la funzione usata da tutte le policy RLS: admin e boss hanno
--    ora gli stessi permessi ovunque nel database.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('admin', 'boss')
  );
$$;
