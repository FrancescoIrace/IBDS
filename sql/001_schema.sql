-- IBDS - schema principale
-- Esegui questo script nel SQL Editor di un progetto Supabase NUOVO e vuoto.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profili utente (estende auth.users). Un profilo viene creato automaticamente
-- alla registrazione tramite il trigger definito in 003_triggers.sql.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'operatore' check (role in ('admin', 'operatore', 'boss')),
  tariffa_giornaliera numeric(10, 2),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Eventi (fiere, sagre, feste...) e relativi costi di partecipazione extra.
-- ---------------------------------------------------------------------------
create table if not exists public.eventi (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  data_inizio date not null,
  data_fine date,
  luogo text,
  costo_partecipazione numeric(10, 2) not null default 0 check (costo_partecipazione >= 0),
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.evento_costi (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventi (id) on delete cascade,
  descrizione text not null,
  importo numeric(10, 2) not null default 0 check (importo >= 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catalogo prodotti: sia gli ingredienti/prodotto "crepes" sia la merce varia
-- venduta a scatole (bibite, snack, gadget...).
-- ---------------------------------------------------------------------------
create table if not exists public.prodotti (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  categoria text not null default 'merce' check (categoria in ('crepes', 'merce')),
  prezzo_vendita numeric(10, 2) not null default 0 check (prezzo_vendita >= 0),
  pezzi_per_scatola integer check (pezzi_per_scatola is null or pezzi_per_scatola > 0),
  attivo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Giornate: una sessione di lavoro legata (facoltativamente) a un evento.
-- ---------------------------------------------------------------------------
create table if not exists public.giornate (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references public.eventi (id) on delete set null,
  data date not null default current_date,
  stato text not null default 'aperta' check (stato in ('aperta', 'chiusa')),
  aperta_da uuid references public.profiles (id) on delete set null,
  chiusa_da uuid references public.profiles (id) on delete set null,
  aperta_at timestamptz not null default now(),
  chiusa_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists giornate_stato_idx on public.giornate (stato);
create index if not exists giornate_data_idx on public.giornate (data desc);
create index if not exists giornate_evento_idx on public.giornate (evento_id);

-- Conteggio crepes della giornata (1 riga per giornata).
create table if not exists public.crepe_conteggi (
  id uuid primary key default gen_random_uuid(),
  giornata_id uuid not null unique references public.giornate (id) on delete cascade,
  totale_biglietti integer not null default 0 check (totale_biglietti >= 0),
  totale_omaggi integer not null default 0 check (totale_omaggi >= 0),
  totale_nutella integer not null default 0 check (totale_nutella >= 0),
  totale_nutella_vegana integer not null default 0 check (totale_nutella_vegana >= 0),
  totale_impasto integer not null default 0 check (totale_impasto >= 0),
  prezzo_crepe numeric(10, 2) not null default 5 check (prezzo_crepe >= 0),
  perc_organizzatori integer not null default 0 check (perc_organizzatori between 0 and 100),
  updated_at timestamptz not null default now()
);

-- Conteggio stock (carico iniziale + rimanenze finali) per prodotto/giornata.
create table if not exists public.giornata_stock (
  id uuid primary key default gen_random_uuid(),
  giornata_id uuid not null references public.giornate (id) on delete cascade,
  prodotto_id uuid not null references public.prodotti (id) on delete restrict,
  prezzo_vendita numeric(10, 2) not null default 0 check (prezzo_vendita >= 0),
  pezzi_per_scatola integer check (pezzi_per_scatola is null or pezzi_per_scatola > 0),
  scatole_caricate integer not null default 0 check (scatole_caricate >= 0),
  pezzi_sfusi_caricati integer not null default 0 check (pezzi_sfusi_caricati >= 0),
  scatole_rimaste integer check (scatole_rimaste is null or scatole_rimaste >= 0),
  pezzi_sfusi_rimasti integer check (pezzi_sfusi_rimasti is null or pezzi_sfusi_rimasti >= 0),
  stato text not null default 'attiva' check (stato in ('attiva', 'chiusa')),
  created_at timestamptz not null default now(),
  unique (giornata_id, prodotto_id)
);

create index if not exists giornata_stock_giornata_idx on public.giornata_stock (giornata_id);
create index if not exists giornata_stock_prodotto_idx on public.giornata_stock (prodotto_id);

-- ---------------------------------------------------------------------------
-- Turni di lavoro: presenza e compenso di ogni utente per ogni giornata.
-- ---------------------------------------------------------------------------
create table if not exists public.turni (
  id uuid primary key default gen_random_uuid(),
  giornata_id uuid not null references public.giornate (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  ora_inizio timestamptz,
  ora_fine timestamptz,
  compenso numeric(10, 2) not null default 0 check (compenso >= 0),
  pagato boolean not null default false,
  pagato_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  unique (giornata_id, user_id)
);

create index if not exists turni_user_idx on public.turni (user_id);
create index if not exists turni_giornata_idx on public.turni (giornata_id);

-- ---------------------------------------------------------------------------
-- Realtime (allineato allo stile del progetto avuonacrepes).
-- ---------------------------------------------------------------------------
alter table public.giornate replica identity full;
alter table public.crepe_conteggi replica identity full;
alter table public.giornata_stock replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'giornate'
  ) then
    alter publication supabase_realtime add table public.giornate;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'crepe_conteggi'
  ) then
    alter publication supabase_realtime add table public.crepe_conteggi;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'giornata_stock'
  ) then
    alter publication supabase_realtime add table public.giornata_stock;
  end if;
end $$;
