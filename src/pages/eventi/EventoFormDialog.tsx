import { useEffect, useState } from 'react'
import { Box, Button, Dialog, Input, Portal, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react'
import type { Evento } from '../../types/database'
import type { EventoInput } from '../../hooks/useEventi'
import { Banner } from '../../components/Banner'

const EMPTY: EventoInput = {
  nome: '',
  data_inizio: '',
  data_fine: '',
  luogo: '',
  costo_partecipazione: 0,
  note: '',
}

export function EventoFormDialog({
  open,
  onOpenChange,
  evento,
  isSaving,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  evento: Evento | null
  isSaving: boolean
  onSubmit: (input: EventoInput) => Promise<void>
}) {
  const [form, setForm] = useState<EventoInput>(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (evento) {
      setForm({
        nome: evento.nome,
        data_inizio: evento.data_inizio,
        data_fine: evento.data_fine ?? '',
        luogo: evento.luogo ?? '',
        costo_partecipazione: evento.costo_partecipazione,
        note: evento.note ?? '',
      })
    } else {
      setForm(EMPTY)
    }
    setError('')
  }, [evento, open])

  const set = <K extends keyof EventoInput>(key: K, value: EventoInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    setError('')
    if (!form.nome.trim()) { setError('Inserisci il nome evento.'); return }
    if (!form.data_inizio) { setError('Inserisci la data di inizio.'); return }
    if (form.data_fine && form.data_fine < form.data_inizio) { setError('La data fine non può essere precedente alla data inizio.'); return }

    try {
      await onSubmit({
        ...form,
        nome: form.nome.trim(),
        data_fine: form.data_fine || null,
        luogo: form.luogo?.trim() || null,
        note: form.note?.trim() || null,
        costo_partecipazione: Number(form.costo_partecipazione) || 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio.')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)} size="md" placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxH="calc(100dvh - 2rem)" overflowY="auto">
            <Dialog.Header>
              <Dialog.Title>{evento ? 'Modifica evento' : 'Nuovo evento'}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>Nome evento</Text>
                  <Input value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Es. Sagra del Paese" />
                </Box>

                <SimpleGrid columns={2} gap={3}>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={1}>Data inizio</Text>
                    <Input type="date" value={form.data_inizio} onChange={(e) => set('data_inizio', e.target.value)} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={1}>Data fine (opz.)</Text>
                    <Input type="date" value={form.data_fine ?? ''} onChange={(e) => set('data_fine', e.target.value)} />
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>Luogo</Text>
                  <Input value={form.luogo ?? ''} onChange={(e) => set('luogo', e.target.value)} placeholder="Opzionale" />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>Costo di partecipazione (€)</Text>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costo_partecipazione}
                    onChange={(e) => set('costo_partecipazione', Number(e.target.value))}
                  />
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>Note</Text>
                  <Textarea value={form.note ?? ''} onChange={(e) => set('note', e.target.value)} placeholder="Opzionale" rows={3} />
                </Box>

                {error && <Banner tone="error">{error}</Banner>}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Annulla</Button>
              <Button colorPalette="brand" onClick={handleSubmit} loading={isSaving}>Salva</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
