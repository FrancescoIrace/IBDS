import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { CrepeConteggio, Evento, Giornata, GiornataStock, Prodotto, Profile, Turno } from '../types/database'

export interface GiornataStorico {
  giornata: Giornata
  evento: Evento | null
  crepeConteggio: CrepeConteggio | null
  stockRows: (GiornataStock & { prodotto: Prodotto | null })[]
  turni: (Turno & { profile: Profile | null })[]
}

export interface StoricoFiltri {
  eventoId?: string
  dal?: string
  al?: string
}

export function useStoricoGiornate(filtri: StoricoFiltri = {}) {
  return useQuery({
    queryKey: ['storico', filtri],
    queryFn: async (): Promise<GiornataStorico[]> => {
      let query = supabase
        .from('giornate')
        .select('*')
        .eq('stato', 'chiusa')
        .order('data', { ascending: false })

      if (filtri.eventoId) query = query.eq('evento_id', filtri.eventoId)
      if (filtri.dal) query = query.gte('data', filtri.dal)
      if (filtri.al) query = query.lte('data', filtri.al)

      const { data: giornate, error } = await query
      if (error) throw error
      if (!giornate || giornate.length === 0) return []

      const ids = giornate.map((g) => g.id)
      const eventoIds = [...new Set(giornate.map((g) => g.evento_id).filter(Boolean))] as string[]

      const [{ data: eventi }, { data: crepeConteggi }, { data: stockRows }, { data: turni }, { data: profiles }] = await Promise.all([
        eventoIds.length
          ? supabase.from('eventi').select('*').in('id', eventoIds)
          : Promise.resolve({ data: [] as Evento[] }),
        supabase.from('crepe_conteggi').select('*').in('giornata_id', ids),
        supabase.from('giornata_stock').select('*, prodotto:prodotti(*)').in('giornata_id', ids),
        supabase.from('turni').select('*').in('giornata_id', ids),
        supabase.from('profiles').select('*'),
      ])

      const eventiById = new Map((eventi ?? []).map((e) => [e.id, e as Evento]))
      const profilesById = new Map((profiles ?? []).map((p) => [p.id, p as Profile]))

      return (giornate as Giornata[]).map((giornata) => ({
        giornata,
        evento: giornata.evento_id ? eventiById.get(giornata.evento_id) ?? null : null,
        crepeConteggio: (crepeConteggi ?? []).find((c) => c.giornata_id === giornata.id) as CrepeConteggio | null,
        stockRows: (stockRows ?? []).filter((r) => r.giornata_id === giornata.id) as (GiornataStock & { prodotto: Prodotto | null })[],
        turni: (turni ?? [])
          .filter((t) => t.giornata_id === giornata.id)
          .map((t) => ({ ...t, profile: profilesById.get(t.user_id) ?? null })) as (Turno & { profile: Profile | null })[],
      }))
    },
  })
}
