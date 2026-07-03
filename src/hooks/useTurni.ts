import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Evento, Giornata, Profile, Turno } from '../types/database'

export interface TurnoCompleto extends Turno {
  profile: Profile | null
  giornata: Giornata | null
  evento: Evento | null
}

export function useTurniAdmin() {
  return useQuery({
    queryKey: ['turni-admin'],
    queryFn: async (): Promise<TurnoCompleto[]> => {
      const { data: turni, error } = await supabase
        .from('turni')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      if (!turni || turni.length === 0) return []

      const giornataIds = [...new Set(turni.map((t) => t.giornata_id))]
      const [{ data: giornate }, { data: profiles }] = await Promise.all([
        supabase.from('giornate').select('*').in('id', giornataIds),
        supabase.from('profiles').select('*'),
      ])

      const eventoIds = [...new Set((giornate ?? []).map((g) => g.evento_id).filter(Boolean))] as string[]
      const { data: eventi } = eventoIds.length
        ? await supabase.from('eventi').select('*').in('id', eventoIds)
        : { data: [] as Evento[] }

      const giornateById = new Map((giornate ?? []).map((g) => [g.id, g as Giornata]))
      const profilesById = new Map((profiles ?? []).map((p) => [p.id, p as Profile]))
      const eventiById = new Map((eventi ?? []).map((e) => [e.id, e as Evento]))

      return (turni as Turno[]).map((t) => {
        const giornata = giornateById.get(t.giornata_id) ?? null
        return {
          ...t,
          profile: profilesById.get(t.user_id) ?? null,
          giornata,
          evento: giornata?.evento_id ? eventiById.get(giornata.evento_id) ?? null : null,
        }
      })
    },
  })
}

export function useUpdateTurno() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Pick<Turno, 'compenso' | 'pagato' | 'pagato_at' | 'note'>> & { id: string }) => {
      const { error } = await supabase.from('turni').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['turni-admin'] }),
  })
}
