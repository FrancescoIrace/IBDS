import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { CrepeConteggio, GiornataStock } from '../types/database'

function invalidateGiornata(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['giornata-attiva'] })
}

export function useApriGiornata() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { eventoId: string | null; userId: string }) => {
      const { data: giornata, error: giornataError } = await supabase
        .from('giornate')
        .insert({ evento_id: input.eventoId, aperta_da: input.userId })
        .select()
        .single()
      if (giornataError) throw giornataError

      const { error: crepeError } = await supabase
        .from('crepe_conteggi')
        .insert({ giornata_id: giornata.id })
      if (crepeError) throw crepeError

      return giornata
    },
    onSuccess: () => invalidateGiornata(queryClient),
  })
}

export function useUpdateCrepeConteggio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { giornataId: string; patch: Partial<CrepeConteggio> }) => {
      const { error } = await supabase
        .from('crepe_conteggi')
        .update({ ...input.patch, updated_at: new Date().toISOString() })
        .eq('giornata_id', input.giornataId)
      if (error) throw error
    },
    onSuccess: () => invalidateGiornata(queryClient),
  })
}

export function useAddStockRow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      giornata_id: string
      prodotto_id: string
      prezzo_vendita: number
      pezzi_per_scatola: number | null
      scatole_caricate: number
      pezzi_sfusi_caricati: number
    }) => {
      const { error } = await supabase.from('giornata_stock').insert(input)
      if (error) throw error
    },
    onSuccess: () => invalidateGiornata(queryClient),
  })
}

export function useUpdateStockRow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<GiornataStock> & { id: string }) => {
      const { error } = await supabase.from('giornata_stock').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateGiornata(queryClient),
  })
}

export function useDeleteStockRow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('giornata_stock').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateGiornata(queryClient),
  })
}

export interface ChiusuraInput {
  giornataId: string
  userId: string
  prezzo_crepe: number
  perc_organizzatori: number
  rimanenze: { id: string; scatole_rimaste: number; pezzi_sfusi_rimasti: number }[]
}

export function useChiudiGiornata() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ChiusuraInput) => {
      const { error: crepeError } = await supabase
        .from('crepe_conteggi')
        .update({ prezzo_crepe: input.prezzo_crepe, perc_organizzatori: input.perc_organizzatori })
        .eq('giornata_id', input.giornataId)
      if (crepeError) throw crepeError

      await Promise.all(
        input.rimanenze.map((riga) =>
          supabase
            .from('giornata_stock')
            .update({
              scatole_rimaste: riga.scatole_rimaste,
              pezzi_sfusi_rimasti: riga.pezzi_sfusi_rimasti,
              stato: 'chiusa',
            })
            .eq('id', riga.id),
        ),
      )

      const { error: turniError } = await supabase
        .from('turni')
        .update({ ora_fine: new Date().toISOString() })
        .eq('giornata_id', input.giornataId)
        .is('ora_fine', null)
      if (turniError) throw turniError

      const { error: giornataError } = await supabase
        .from('giornate')
        .update({ stato: 'chiusa', chiusa_at: new Date().toISOString(), chiusa_da: input.userId })
        .eq('id', input.giornataId)
      if (giornataError) throw giornataError
    },
    onSuccess: () => {
      invalidateGiornata(queryClient)
      queryClient.invalidateQueries({ queryKey: ['storico'] })
      queryClient.invalidateQueries({ queryKey: ['statistiche'] })
    },
  })
}

function invalidateOvunque(queryClient: ReturnType<typeof useQueryClient>) {
  invalidateGiornata(queryClient)
  queryClient.invalidateQueries({ queryKey: ['storico'] })
  queryClient.invalidateQueries({ queryKey: ['statistiche'] })
}

export function useDeleteGiornata() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (giornataId: string) => {
      const { error } = await supabase.from('giornate').delete().eq('id', giornataId)
      if (error) throw error
    },
    onSuccess: () => invalidateOvunque(queryClient),
  })
}

export function useUpdateGiornataInfo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { giornataId: string; eventoId: string | null; data: string }) => {
      const { error } = await supabase
        .from('giornate')
        .update({ evento_id: input.eventoId, data: input.data })
        .eq('id', input.giornataId)
      if (error) throw error
    },
    onSuccess: () => invalidateOvunque(queryClient),
  })
}

export function useReopenGiornata() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (giornataId: string) => {
      const { data: giaAperte, error: checkError } = await supabase
        .from('giornate')
        .select('id')
        .eq('stato', 'aperta')
      if (checkError) throw checkError
      if ((giaAperte ?? []).some((g) => g.id !== giornataId)) {
        throw new Error('C\'è già un\'altra giornata aperta. Chiudila prima di riaprire questa.')
      }

      const { error: stockError } = await supabase
        .from('giornata_stock')
        .update({ stato: 'attiva' })
        .eq('giornata_id', giornataId)
      if (stockError) throw stockError

      const { error: giornataError } = await supabase
        .from('giornate')
        .update({ stato: 'aperta', chiusa_at: null, chiusa_da: null })
        .eq('id', giornataId)
      if (giornataError) throw giornataError
    },
    onSuccess: () => invalidateOvunque(queryClient),
  })
}

export function useGestioneTurno() {
  const queryClient = useQueryClient()

  const iniziaTurno = useMutation({
    mutationFn: async (input: { giornataId: string; userId: string }) => {
      const { error } = await supabase
        .from('turni')
        .upsert(
          { giornata_id: input.giornataId, user_id: input.userId, ora_inizio: new Date().toISOString(), ora_fine: null },
          { onConflict: 'giornata_id,user_id' },
        )
      if (error) throw error
    },
    onSuccess: () => invalidateGiornata(queryClient),
  })

  const terminaTurno = useMutation({
    mutationFn: async (turnoId: string) => {
      const { error } = await supabase.from('turni').update({ ora_fine: new Date().toISOString() }).eq('id', turnoId)
      if (error) throw error
    },
    onSuccess: () => invalidateGiornata(queryClient),
  })

  const rimuoviTurno = useMutation({
    mutationFn: async (turnoId: string) => {
      const { error } = await supabase.from('turni').delete().eq('id', turnoId)
      if (error) throw error
    },
    onSuccess: () => invalidateGiornata(queryClient),
  })

  return { iniziaTurno, terminaTurno, rimuoviTurno }
}
