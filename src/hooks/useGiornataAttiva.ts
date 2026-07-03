import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { CrepeConteggio, Evento, Giornata, GiornataStock, Prodotto, Profile, Turno } from '../types/database'

export interface GiornataAttivaData {
  giornata: Giornata
  evento: Evento | null
  crepeConteggio: CrepeConteggio
  stockRows: (GiornataStock & { prodotto: Prodotto | null })[]
  turni: (Turno & { profile: Profile | null })[]
}

export function useGiornataAttiva() {
  return useQuery({
    queryKey: ['giornata-attiva'],
    queryFn: async (): Promise<GiornataAttivaData | null> => {
      const { data: giornate, error: giornataError } = await supabase
        .from('giornate')
        .select('*')
        .eq('stato', 'aperta')
        .order('aperta_at', { ascending: false })
        .limit(1)
      if (giornataError) throw giornataError
      const giornata = giornate?.[0] as Giornata | undefined
      if (!giornata) return null

      const [{ data: evento }, { data: crepeRows, error: crepeError }, { data: stockRows, error: stockError }, { data: turni, error: turniError }] =
        await Promise.all([
          giornata.evento_id
            ? supabase.from('eventi').select('*').eq('id', giornata.evento_id).single()
            : Promise.resolve({ data: null } as { data: Evento | null }),
          supabase.from('crepe_conteggi').select('*').eq('giornata_id', giornata.id).limit(1),
          supabase
            .from('giornata_stock')
            .select('*, prodotto:prodotti(*)')
            .eq('giornata_id', giornata.id)
            .order('created_at', { ascending: true }),
          supabase
            .from('turni')
            .select('*, profile:profiles(*)')
            .eq('giornata_id', giornata.id)
            .order('created_at', { ascending: true }),
        ])

      if (crepeError) throw crepeError
      if (stockError) throw stockError
      if (turniError) throw turniError

      let crepeConteggio = crepeRows?.[0] as CrepeConteggio | undefined
      if (!crepeConteggio) {
        const { data: created, error: createError } = await supabase
          .from('crepe_conteggi')
          .insert({ giornata_id: giornata.id })
          .select()
          .single()
        if (createError) throw createError
        crepeConteggio = created as CrepeConteggio
      }

      return {
        giornata,
        evento: (evento as Evento | null) ?? null,
        crepeConteggio,
        stockRows: (stockRows ?? []) as (GiornataStock & { prodotto: Prodotto | null })[],
        turni: (turni ?? []) as (Turno & { profile: Profile | null })[],
      }
    },
  })
}
