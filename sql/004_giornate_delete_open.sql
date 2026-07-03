-- IBDS - migrazione incrementale
-- Esegui questo script UNA VOLTA nel SQL Editor del tuo progetto Supabase
-- (dopo aver già eseguito 001, 002, 003). Aggiunge la possibilità di
-- eliminare una giornata ancora APERTA a qualsiasi utente loggato, utile per
-- annullare un'apertura fatta per errore. Le giornate CHIUSE restano
-- eliminabili solo dall'admin (policy "giornate_delete_admin" già esistente).
--
-- NOTA: questa policy viene poi RIMOSSA da 006_giornate_solo_admin_boss.sql,
-- quando l'apertura giornata diventa riservata ad admin/boss. Esegui comunque
-- questo file in ordine per coerenza storica delle migrazioni, poi 006.

create policy "giornate_delete_open_any" on public.giornate
  for delete to authenticated using (stato = 'aperta');
