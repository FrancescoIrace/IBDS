import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { CategoriaProdotto, Prodotto } from '../types/database'

export function useProdotti(options?: { soloAttivi?: boolean }) {
  const soloAttivi = options?.soloAttivi ?? false
  return useQuery({
    queryKey: ['prodotti', soloAttivi],
    queryFn: async () => {
      let query = supabase.from('prodotti').select('*').order('nome', { ascending: true })
      if (soloAttivi) query = query.eq('attivo', true)
      const { data, error } = await query
      if (error) throw error
      return data as Prodotto[]
    },
  })
}

export type ProdottoInput = {
  nome: string
  categoria: CategoriaProdotto
  prezzo_vendita: number
  pezzi_per_scatola: number | null
}

export function useCreateProdotto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ProdottoInput) => {
      const { data, error } = await supabase.from('prodotti').insert(input).select().single()
      if (error) throw error
      return data as Prodotto
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prodotti'] }),
  })
}

export function useUpdateProdotto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ProdottoInput> & { id: string; attivo?: boolean }) => {
      const { data, error } = await supabase.from('prodotti').update(input).eq('id', id).select().single()
      if (error) throw error
      return data as Prodotto
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prodotti'] }),
  })
}
