import { useState } from 'react'
import { Box, Button, Link as ChakraLink, NativeSelect, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import type { Evento } from '../../types/database'
import { Banner } from '../../components/Banner'
import { Section } from '../../components/Section'
import { formatData } from '../../lib/format'

export function AperturaGiornata({
  eventi,
  isLoading,
  onApri,
}: {
  eventi: Evento[]
  isLoading: boolean
  onApri: (eventoId: string | null) => Promise<void>
}) {
  const [eventoId, setEventoId] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleApri = async () => {
    setError('')
    setIsSaving(true)
    try {
      await onApri(eventoId || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante apertura giornata.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Section title="Nessuna giornata aperta" subtitle="Apri una nuova giornata di lavoro per iniziare a registrare crepes e merce venduta.">
      <Stack gap={4} maxW="md">
        {eventi.length === 0 && !isLoading && (
          <Banner tone="info">
            Non hai ancora creato eventi. Puoi comunque aprire una giornata libera, oppure{' '}
            <ChakraLink asChild color="brand.600" fontWeight="semibold">
              <RouterLink to="/eventi">crea prima un evento</RouterLink>
            </ChakraLink>.
          </Banner>
        )}

        <Box>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={1}>Evento</Text>
          <NativeSelect.Root disabled={isLoading || isSaving}>
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

        {error && <Banner tone="error">{error}</Banner>}

        <Button colorPalette="brand" size="lg" onClick={handleApri} loading={isSaving}>
          Apri giornata
        </Button>
      </Stack>
    </Section>
  )
}
