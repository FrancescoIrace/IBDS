export type Ruolo = 'admin' | 'operatore' | 'boss'
export type StatoGiornata = 'aperta' | 'chiusa'
export type StatoStockRiga = 'attiva' | 'chiusa'
export type CategoriaProdotto = 'crepes' | 'merce'

export interface Profile {
  id: string
  full_name: string
  role: Ruolo
  tariffa_giornaliera: number | null
  created_at: string
}

export interface Evento {
  id: string
  nome: string
  data_inizio: string
  data_fine: string | null
  luogo: string | null
  costo_partecipazione: number
  note: string | null
  created_by: string | null
  created_at: string
}

export interface EventoCosto {
  id: string
  evento_id: string
  descrizione: string
  importo: number
  created_at: string
}

export interface Prodotto {
  id: string
  nome: string
  categoria: CategoriaProdotto
  prezzo_vendita: number
  pezzi_per_scatola: number | null
  attivo: boolean
  created_at: string
}

export interface Giornata {
  id: string
  evento_id: string | null
  data: string
  stato: StatoGiornata
  aperta_da: string | null
  chiusa_da: string | null
  aperta_at: string
  chiusa_at: string | null
  note: string | null
  created_at: string
}

export interface CrepeConteggio {
  id: string
  giornata_id: string
  totale_biglietti: number
  totale_omaggi: number
  totale_nutella: number
  totale_nutella_vegana: number
  totale_impasto: number
  prezzo_crepe: number
  perc_organizzatori: number
  updated_at: string
}

export interface GiornataStock {
  id: string
  giornata_id: string
  prodotto_id: string
  prezzo_vendita: number
  pezzi_per_scatola: number | null
  scatole_caricate: number
  pezzi_sfusi_caricati: number
  scatole_rimaste: number | null
  pezzi_sfusi_rimasti: number | null
  stato: StatoStockRiga
  created_at: string
}

export interface Turno {
  id: string
  giornata_id: string
  user_id: string
  ora_inizio: string | null
  ora_fine: string | null
  compenso: number
  pagato: boolean
  pagato_at: string | null
  note: string | null
  created_at: string
}

// Tipi arricchiti (join) usati nelle pagine
export interface GiornataConEvento extends Giornata {
  evento: Evento | null
}

export interface GiornataStockConProdotto extends GiornataStock {
  prodotto: Prodotto | null
}

export interface TurnoConProfilo extends Turno {
  profile: Profile | null
}
