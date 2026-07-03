import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Evento, EventoCosto } from '../types/database'

export function useEventi() {
  return useQuery({
    queryKey: ['eventi'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventi')
        .select('*')
        .order('data_inizio', { ascending: false })
      if (error) throw error
      return data as Evento[]
    },
  })
}

export function useEventoCosti(eventoId: string | null) {
  return useQuery({
    queryKey: ['evento_costi', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evento_costi')
        .select('*')
        .eq('evento_id', eventoId as string)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as EventoCosto[]
    },
    enabled: !!eventoId,
  })
}

export type EventoInput = {
  nome: string
  data_inizio: string
  data_fine: string | null
  luogo: string | null
  costo_partecipazione: number
  note: string | null
}

export function useCreateEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: EventoInput & { created_by: string | null }) => {
      const { data, error } = await supabase.from('eventi').insert(input).select().single()
      if (error) throw error
      return data as Evento
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eventi'] }),
  })
}

export function useUpdateEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: EventoInput & { id: string }) => {
      const { data, error } = await supabase.from('eventi').update(input).eq('id', id).select().single()
      if (error) throw error
      return data as Evento
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eventi'] }),
  })
}

export function useDeleteEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('eventi').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eventi'] }),
  })
}

export function useAddEventoCosto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { evento_id: string; descrizione: string; importo: number }) => {
      const { data, error } = await supabase.from('evento_costi').insert(input).select().single()
      if (error) throw error
      return data as EventoCosto
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['evento_costi', variables.evento_id] }),
  })
}

export function useDeleteEventoCosto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; evento_id: string }) => {
      const { error } = await supabase.from('evento_costi').delete().eq('id', input.id)
      if (error) throw error
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['evento_costi', variables.evento_id] }),
  })
}
