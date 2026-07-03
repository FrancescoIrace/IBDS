-- IBDS - migrazione incrementale
-- Esegui questo script UNA VOLTA nel SQL Editor del tuo progetto Supabase
-- (dopo aver già eseguito 001-005). Da ora solo admin/boss possono aprire
-- (e quindi anche eliminare) una giornata; gli operatori vengono aggiunti
-- manualmente ai turni dopo l'apertura, ma continuano a poter contare
-- crepes/stock e chiudere la giornata come prima.

-- 1. Solo admin/boss possono creare una nuova giornata.
drop policy if exists "giornate_insert_all" on public.giornate;
create policy "giornate_insert_admin" on public.giornate
  for insert to authenticated with check (public.is_admin());

-- 2. Rimuovi il permesso (introdotto in 004) di eliminare una giornata
--    aperta a QUALSIASI utente: ora che solo admin/boss le aprono, anche
--    l'eliminazione resta riservata a loro tramite "giornate_delete_admin"
--    (già esistente, invariata).
drop policy if exists "giornate_delete_open_any" on public.giornate;
