-- IBDS - importazione storica una tantum
-- Esegui UNA VOLTA nel SQL Editor del tuo progetto Supabase. Importa le
-- giornate crepes chiuse dal vecchio progetto "avuonacrepes"
-- (tabella crepe_sessions), creando anche i due eventi mancanti.
--
-- NOTE:
-- - Non esistevano utenti/login in avuonacrepes: aperta_da/chiusa_da restano
--   vuoti per queste giornate.
-- - Esclusa la sessione "Pianura" (stato aperta, dati quasi tutti a zero):
--   sembrava una sessione di test mai chiusa.
-- - La sessione PizzaPark ha ora_fine precedente a ora_inizio nei dati
--   originali (refuso storico): importata così com'è, correggibile dopo
--   dall'app (Storico -> Riapri per correggere).

begin;

insert into public.eventi (nome, data_inizio, data_fine, note)
values
  ('Mare In Fest', '2026-06-18', '2026-06-28', 'Importato da avuonacrepes'),
  ('PizzaPark', '2026-05-28', '2026-05-28', 'Importato da avuonacrepes');

-- Giornate (id invariati rispetto ad avuonacrepes, per tracciabilità)
insert into public.giornate (id, evento_id, data, stato, aperta_at, chiusa_at, created_at, note)
values
  ('16c1b837-5118-44e2-a196-65ab0cea7fdd', (select id from public.eventi where nome = 'Mare In Fest'), '2026-06-27', 'chiusa', '2026-06-27 16:35:00+00', '2026-06-27 23:57:00+00', '2026-06-27 16:35:32.06266+00', 'Importata da avuonacrepes'),
  ('23343f88-564e-433e-b23f-34834f0450a9', (select id from public.eventi where nome = 'Mare In Fest'), '2026-06-24', 'chiusa', '2026-06-24 16:11:00+00', '2026-06-24 21:53:00+00', '2026-06-24 16:11:56.363994+00', 'Importata da avuonacrepes'),
  ('3207c031-a5c1-4f9d-85cc-684ea76f923a', (select id from public.eventi where nome = 'Mare In Fest'), '2026-06-20', 'chiusa', '2026-06-20 16:00:00+00', '2026-06-20 22:00:00+00', '2026-06-24 08:02:59+00', 'Importata da avuonacrepes'),
  ('6fe61fbe-34b5-4ab2-868f-bd389b984e94', (select id from public.eventi where nome = 'Mare In Fest'), '2026-06-18', 'chiusa', '2026-06-18 16:00:00+00', '2026-06-19 22:00:00+00', '2026-06-24 08:00:16.479043+00', 'Importata da avuonacrepes'),
  ('9fedb0e5-5bb1-4c5f-b2f2-0261874b150a', (select id from public.eventi where nome = 'Mare In Fest'), '2026-06-22', 'chiusa', '2026-06-22 16:00:00+00', '2026-06-22 22:00:00+00', '2026-06-24 08:04:13+00', 'Importata da avuonacrepes'),
  ('a9349753-f093-4955-bf80-76d6359971a3', (select id from public.eventi where nome = 'PizzaPark'), '2026-05-28', 'chiusa', '2026-05-28 13:06:00+00', '2026-05-27 22:00:00+00', '2026-06-25 13:06:17.590342+00', 'Importata da avuonacrepes'),
  ('b30ba1dc-96ea-4b9d-9558-bc02584fa1b5', (select id from public.eventi where nome = 'Mare In Fest'), '2026-06-28', 'chiusa', '2026-06-28 16:27:00+00', '2026-06-28 22:11:00+00', '2026-06-28 16:27:32.12124+00', 'Importata da avuonacrepes'),
  ('be92904a-0bb4-4f16-8c50-deaa6b12c1fb', (select id from public.eventi where nome = 'Mare In Fest'), '2026-06-19', 'chiusa', '2026-06-19 16:00:00+00', '2026-06-19 22:00:00+00', '2026-06-24 08:01:06+00', 'Importata da avuonacrepes'),
  ('c5ec4b26-51a2-4b71-83c5-235d6b25138f', (select id from public.eventi where nome = 'Mare In Fest'), '2026-06-23', 'chiusa', '2026-06-23 16:00:00+00', '2026-06-23 22:05:00+00', '2026-06-24 01:10:20.868418+00', 'Importata da avuonacrepes'),
  ('d17336ff-f8c9-4e6b-8010-b233731c0c18', (select id from public.eventi where nome = 'Mare In Fest'), '2026-06-21', 'chiusa', '2026-06-21 16:00:00+00', '2026-06-21 22:00:00+00', '2026-06-24 08:03:32+00', 'Importata da avuonacrepes'),
  ('d485dc1e-cf4e-4382-b006-6671af682257', (select id from public.eventi where nome = 'Mare In Fest'), '2026-06-25', 'chiusa', '2026-06-25 16:20:20.024+00', '2026-06-25 22:56:38.348+00', '2026-06-25 16:20:20.120461+00', 'Importata da avuonacrepes'),
  ('d74cf323-5db8-490c-8633-f0d16d7ffa59', (select id from public.eventi where nome = 'Mare In Fest'), '2026-06-26', 'chiusa', '2026-06-26 16:00:00+00', '2026-06-26 22:00:00+00', '2026-06-26 18:51:15.836975+00', 'Importata da avuonacrepes');

-- Conteggi crepes corrispondenti (prezzo_crepe e perc_organizzatori non
-- erano salvati per-sessione in avuonacrepes: restano ai valori di default,
-- modificabili da Storico se vuoi ricalcolare i guadagni di queste giornate).
insert into public.crepe_conteggi (giornata_id, totale_biglietti, totale_omaggi, totale_nutella, totale_nutella_vegana, totale_impasto)
values
  ('16c1b837-5118-44e2-a196-65ab0cea7fdd', 162, 4, 5, 0, 5),
  ('23343f88-564e-433e-b23f-34834f0450a9', 117, 7, 4, 2, 5),
  ('3207c031-a5c1-4f9d-85cc-684ea76f923a', 197, 0, 0, 0, 0),
  ('6fe61fbe-34b5-4ab2-868f-bd389b984e94', 124, 0, 0, 0, 0),
  ('9fedb0e5-5bb1-4c5f-b2f2-0261874b150a', 123, 0, 0, 0, 0),
  ('a9349753-f093-4955-bf80-76d6359971a3', 86, 0, 3, 1, 5),
  ('b30ba1dc-96ea-4b9d-9558-bc02584fa1b5', 158, 1, 4, 1, 4),
  ('be92904a-0bb4-4f16-8c50-deaa6b12c1fb', 153, 0, 0, 0, 0),
  ('c5ec4b26-51a2-4b71-83c5-235d6b25138f', 119, 0, 6, 0, 4),
  ('d17336ff-f8c9-4e6b-8010-b233731c0c18', 207, 0, 0, 0, 0),
  ('d485dc1e-cf4e-4382-b006-6671af682257', 170, 3, 6, 2, 3),
  ('d74cf323-5db8-490c-8633-f0d16d7ffa59', 160, 1, 5, 2, 5);

commit;
