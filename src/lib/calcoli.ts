import type { CrepeConteggio, GiornataStock } from '../types/database'

export function calcolaStockRiga(row: GiornataStock) {
  const pezziIniziali = (row.scatole_caricate ?? 0) * (row.pezzi_per_scatola ?? 0) + (row.pezzi_sfusi_caricati ?? 0)
  const pezziRimasti =
    row.stato === 'chiusa'
      ? (row.scatole_rimaste ?? 0) * (row.pezzi_per_scatola ?? 0) + (row.pezzi_sfusi_rimasti ?? 0)
      : null
  const pezziVenduti = pezziRimasti !== null ? Math.max(0, pezziIniziali - pezziRimasti) : null
  const guadagno = pezziVenduti !== null ? pezziVenduti * (row.prezzo_vendita ?? 0) : null
  return { pezziIniziali, pezziRimasti, pezziVenduti, guadagno }
}

export function calcolaCrepe(conteggio: Pick<CrepeConteggio, 'totale_biglietti' | 'prezzo_crepe' | 'perc_organizzatori'>) {
  const ricavoLordo = (conteggio.totale_biglietti ?? 0) * (conteggio.prezzo_crepe ?? 0)
  const quotaOrganizzatori = (ricavoLordo * (conteggio.perc_organizzatori ?? 0)) / 100
  const quotaNetta = ricavoLordo - quotaOrganizzatori
  return { ricavoLordo, quotaOrganizzatori, quotaNetta }
}
