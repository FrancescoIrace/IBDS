-- IBDS - funzioni helper e trigger
-- Da eseguire dopo 001_schema.sql.

-- Helper usato dalle policy RLS: true se l'utente loggato è admin o boss
-- (i due ruoli hanno permessi identici, "boss" è solo un'etichetta diversa).
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

-- Crea automaticamente un profilo (ruolo 'operatore') alla registrazione di
-- un nuovo utente Supabase Auth. Il primo utente registrato in assoluto
-- diventa 'admin' automaticamente, così l'app ha subito un amministratore.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean;
begin
  select not exists (select 1 from public.profiles) into is_first;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case when is_first then 'admin' else 'operatore' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Impedisce a un operatore di auto-promuoversi ad admin o di modificare la
-- propria tariffa: solo un admin può cambiare role/tariffa_giornaliera di
-- un profilo (anche il proprio).
create or replace function public.enforce_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.tariffa_giornaliera := old.tariffa_giornaliera;
  end if;
  return new;
end;
$$;

drop trigger if exists before_profile_update on public.profiles;
create trigger before_profile_update
  before update on public.profiles
  for each row execute function public.enforce_profile_update();

-- Impedisce a un operatore di modificare compenso/pagato del proprio turno o
-- di quello altrui: solo un admin può farlo. Un operatore può comunque
-- aggiornare ora_inizio/ora_fine/note del proprio turno.
create or replace function public.enforce_turno_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.compenso := old.compenso;
    new.pagato := old.pagato;
    new.pagato_at := old.pagato_at;
  end if;
  return new;
end;
$$;

drop trigger if exists before_turno_update on public.turni;
create trigger before_turno_update
  before update on public.turni
  for each row execute function public.enforce_turno_update();
