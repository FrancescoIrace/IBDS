# IBDS — Gestionale eventi e stand

PWA multi-pagina per gestire uno stand (crepes + altri prodotti) a eventi e
fiere: conteggio crepes, carico/rimanenze merce, calendario eventi, storico
giornate, statistiche vendite, utenti multi-login con turni e pagamenti.

Nasce come evoluzione di `avuonacrepes` (single-page, un solo prodotto, senza
login), riorganizzata in un'app multi-pagina, multi-prodotto e multi-utente.

## Stack tecnologico

- **React 19 + TypeScript + Vite**
- **Chakra UI v3** per l'interfaccia (minimale, componenti accessibili)
- **React Router v7** per la navigazione multi-pagina
- **Supabase** (Postgres + Auth + Realtime) come backend
- **TanStack Query** per il caricamento/cache dei dati
- **react-big-calendar** per il calendario eventi
- **Recharts** per i grafici statistiche
- **vite-plugin-pwa** per l'installabilità come app (PWA)

## 1. Crea il progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un **nuovo progetto** (vuoto, non condiviso con avuonacrepes).
2. Apri **SQL Editor** e esegui, **in ordine**, i file nella cartella `sql/`:
   1. `sql/001_schema.sql` — tabelle
   2. `sql/002_functions_triggers.sql` — funzioni helper e trigger (creazione automatica profilo, protezione ruoli)
   3. `sql/003_policies.sql` — Row Level Security
3. In **Project Settings → API** copia:
   - `Project URL`
   - `anon public key`
4. In **Authentication → Providers**, l'accesso via Email/Password è attivo di default: va bene così. Se non vuoi l'invio di email di conferma in fase di test, disattiva "Confirm email" in **Authentication → Sign In / Providers**.

## 2. Configura l'app in locale

```bash
npm install
cp .env.example .env
```

Modifica `.env` con i valori copiati da Supabase:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=la-tua-anon-key
```

Avvia il dev server:

```bash
npm run dev
```

## 3. Primo accesso e utente amministratore

Non esiste un modo per creare utenti da pannello: ogni persona crea il proprio
account dalla pagina **Registrati**. Il **primo utente che si registra in
assoluto diventa automaticamente amministratore** (vedi trigger
`handle_new_user` in `sql/002_functions_triggers.sql`); tutti i successivi
diventano "operatore" di default.

Dopo la prima registrazione, l'amministratore può promuovere altri utenti ad
admin, assegnare una tariffa giornaliera predefinita e gestire i pagamenti dei
turni dalla pagina **Utenti**.

## Ruoli e permessi

| Azione | Operatore | Admin |
|---|---|---|
| Aprire/chiudere una giornata, conteggio crepes e stock | ✅ | ✅ |
| Vedere eventi, calendario, storico, statistiche | ✅ | ✅ |
| Creare/modificare/eliminare eventi e relativi costi | ❌ | ✅ |
| Registrare il proprio turno e vedere i propri pagamenti | ✅ | ✅ |
| Vedere/gestire turni e pagamenti di tutti | ❌ | ✅ |
| Cambiare ruolo o tariffa di un utente | ❌ | ✅ |

Le regole sono applicate sia in UI sia via Row Level Security su Postgres
(`sql/003_policies.sql`), quindi restano valide anche in caso di accesso
diretto alle API Supabase.

## Struttura del progetto

```
src/
  auth/        contesto autenticazione, route protette
  components/  componenti UI riutilizzabili (Section, Banner, StatTile...)
  hooks/       accesso dati Supabase via TanStack Query
  layout/      shell dell'app (sidebar desktop / tab bar mobile)
  lib/         client Supabase, formattazione, calcoli economici
  pages/
    giornata/     pagina operativa: apertura/chiusura giornata, conteggio crepes, stock
    eventi/       anagrafica eventi + costi aggiuntivi
    calendario/   vista calendario eventi
    storico/      storico giornate chiuse con dettaglio
    statistiche/  statistiche vendite con filtri e grafici
    utenti/       gestione utenti, turni e pagamenti (admin)
  theme/       tema Chakra UI (palette colori)
sql/           script SQL da eseguire su Supabase, in ordine numerico
scripts/       script di utilità (rigenerazione icone PWA)
```

## Comandi

```bash
npm run dev       # sviluppo
npm run build     # build di produzione (in dist/)
npm run preview   # anteprima della build
npm run lint      # oxlint
```

## PWA e icone

L'app è installabile da browser (Chrome/Edge: icona "Installa app" nella
barra indirizzi; iOS Safari: Condividi → "Aggiungi a Home"). Le icone sono
generate da `public/icon-source.svg` (icona normale) e
`public/icon-maskable-source.svg` (icona a tutto campo per Android). Per
cambiare il logo, sostituisci questi due SVG e rilancia:

```bash
node scripts/generate-icons.mjs
```

## Note

- La palette (rosso "Boss" + oro + neutri caldi, ispirata ai colori reali
  dello stand) è definita in `src/theme/system.ts` tramite i token `brand`,
  `gold` e `gray`: cambiare quel file aggiorna automaticamente tutta l'app.
- Non esiste ancora una pagina di dettaglio dedicata per singolo evento: la
  gestione costi/partecipazione avviene espandendo la card evento nella
  pagina Eventi.
