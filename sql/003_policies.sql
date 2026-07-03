-- IBDS - Row Level Security
-- Da eseguire dopo 001_schema.sql e 002_functions_triggers.sql.
-- Tutte le tabelle sono leggibili/scrivibili solo da utenti autenticati
-- (nessun accesso anonimo, a differenza di avuonacrepes).

alter table public.profiles enable row level security;
alter table public.eventi enable row level security;
alter table public.evento_costi enable row level security;
alter table public.prodotti enable row level security;
alter table public.giornate enable row level security;
alter table public.crepe_conteggi enable row level security;
alter table public.giornata_stock enable row level security;
alter table public.turni enable row level security;

-- ---------------------------------------------------------------------------
-- profiles: tutti leggono (servono per select utente/turni), ognuno aggiorna
-- solo il proprio nome; role/tariffa sono bloccati dal trigger per i non-admin.
-- ---------------------------------------------------------------------------
create policy "profiles_select_all" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_self_or_admin" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_delete_admin" on public.profiles
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- eventi / evento_costi: lettura per tutti, scrittura riservata all'admin.
-- ---------------------------------------------------------------------------
create policy "eventi_select_all" on public.eventi
  for select to authenticated using (true);

create policy "eventi_write_admin" on public.eventi
  for insert to authenticated with check (public.is_admin());

create policy "eventi_update_admin" on public.eventi
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "eventi_delete_admin" on public.eventi
  for delete to authenticated using (public.is_admin());

create policy "evento_costi_select_all" on public.evento_costi
  for select to authenticated using (true);

create policy "evento_costi_write_admin" on public.evento_costi
  for insert to authenticated with check (public.is_admin());

create policy "evento_costi_update_admin" on public.evento_costi
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "evento_costi_delete_admin" on public.evento_costi
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- prodotti: catalogo condiviso. Chiunque loggato può leggere/aggiungere o
-- disattivare un prodotto (serve sul campo, es. nuovo prodotto sullo stand);
-- solo l'admin può eliminarlo definitivamente.
-- ---------------------------------------------------------------------------
create policy "prodotti_select_all" on public.prodotti
  for select to authenticated using (true);

create policy "prodotti_insert_all" on public.prodotti
  for insert to authenticated with check (true);

create policy "prodotti_update_all" on public.prodotti
  for update to authenticated using (true) with check (true);

create policy "prodotti_delete_admin" on public.prodotti
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- giornate: qualunque utente loggato apre/chiude/corregge una giornata.
-- L'eliminazione è riservata all'admin per evitare perdite accidentali di
-- storico.
-- ---------------------------------------------------------------------------
create policy "giornate_select_all" on public.giornate
  for select to authenticated using (true);

create policy "giornate_insert_all" on public.giornate
  for insert to authenticated with check (true);

create policy "giornate_update_all" on public.giornate
  for update to authenticated using (true) with check (true);

create policy "giornate_delete_admin" on public.giornate
  for delete to authenticated using (public.is_admin());

-- Chiunque loggato può eliminare una giornata ANCORA APERTA (per annullare
-- un'apertura per errore, es. evento sbagliato). Le giornate chiuse restano
-- eliminabili solo dall'admin tramite la policy sopra.
create policy "giornate_delete_open_any" on public.giornate
  for delete to authenticated using (stato = 'aperta');

-- ---------------------------------------------------------------------------
-- crepe_conteggi / giornata_stock: conteggi operativi in tempo reale,
-- leggibili e scrivibili da chiunque sia loggato. Eliminazione riservata
-- all'admin.
-- ---------------------------------------------------------------------------
create policy "crepe_conteggi_select_all" on public.crepe_conteggi
  for select to authenticated using (true);

create policy "crepe_conteggi_insert_all" on public.crepe_conteggi
  for insert to authenticated with check (true);

create policy "crepe_conteggi_update_all" on public.crepe_conteggi
  for update to authenticated using (true) with check (true);

create policy "crepe_conteggi_delete_admin" on public.crepe_conteggi
  for delete to authenticated using (public.is_admin());

create policy "giornata_stock_select_all" on public.giornata_stock
  for select to authenticated using (true);

create policy "giornata_stock_insert_all" on public.giornata_stock
  for insert to authenticated with check (true);

create policy "giornata_stock_update_all" on public.giornata_stock
  for update to authenticated using (true) with check (true);

create policy "giornata_stock_delete_admin" on public.giornata_stock
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- turni: ognuno vede/gestisce il proprio turno (orari/note), l'admin vede e
-- gestisce tutto (compreso compenso/pagato, bloccati per i non-admin dal
-- trigger enforce_turno_update).
-- ---------------------------------------------------------------------------
create policy "turni_select_own_or_admin" on public.turni
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "turni_insert_own_or_admin" on public.turni
  for insert to authenticated with check (user_id = auth.uid() or public.is_admin());

create policy "turni_update_own_or_admin" on public.turni
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "turni_delete_admin" on public.turni
  for delete to authenticated using (public.is_admin());
