import { useEffect, useState } from 'react'
import { Box, Button, Dialog, Input, NativeSelect, Portal, Stack, Text } from '@chakra-ui/react'
import type { Evento, Giornata } from '../../types/database'
import { Banner } from '../../components/Banner'
import { formatData } from '../../lib/format'

export function ModificaGiornataDialog({
  open,
  onOpenChange,
  giornata,
  eventi,
  isSaving,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  giornata: Giornata
  eventi: Evento[]
  isSaving: boolean
  onSubmit: (input: { eventoId: string | null; data: string }) => Promise<void>
}) {
  const [eventoId, setEventoId] = useState(giornata.evento_id ?? '')
  const [data, setData] = useState(giornata.data)
  const [error, setError] = useState('')

  useEffect(() => {
    setEventoId(giornata.evento_id ?? '')
    setData(giornata.data)
    setError('')
  }, [giornata, open])

  const handleSubmit = async () => {
    setError('')
    if (!data) { setError('Inserisci una data valida.'); return }
    try {
      await onSubmit({ eventoId: eventoId || null, data })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio.')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)} size="sm" placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Modifica giornata</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>Evento</Text>
                  <NativeSelect.Root>
                    <NativeSelect.Field value={eventoId} onChange={(e) => setEventoId(e.target.value)}>
                      <option value="">Giornata libera (nessun evento)</option>
                      {eventi.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.nome} · {formatData(ev.data_inizio)}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>Data</Text>
                  <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
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
