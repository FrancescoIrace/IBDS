import { useState } from 'react'
import { Box, Center, Input, NativeSelect, SimpleGrid, Spinner, Stack, Text } from '@chakra-ui/react'
import { useEventi } from '../../hooks/useEventi'
import { useStoricoGiornate } from '../../hooks/useStorico'
import { Section } from '../../components/Section'
import { Banner } from '../../components/Banner'
import { GiornataStoricoCard } from './GiornataStoricoCard'

export default function StoricoPage() {
  const { data: eventi = [] } = useEventi()
  const [eventoId, setEventoId] = useState('')
  const [dal, setDal] = useState('')
  const [al, setAl] = useState('')

  const { data: giornate = [], isLoading, error } = useStoricoGiornate({
    eventoId: eventoId || undefined,
    dal: dal || undefined,
    al: al || undefined,
  })

  return (
    <Stack gap={6}>
      <Section title="Storico giornate" subtitle="Tutte le giornate chiuse, con dettaglio crepes, merce venduta e turni.">
        <SimpleGrid columns={{ base: 1, sm: 3 }} gap={3} mb={5}>
          <Box>
            <Text fontSize="xs" color="gray.500" mb={1}>Evento</Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={eventoId} onChange={(e) => setEventoId(e.target.value)}>
                <option value="">Tutti gli eventi</option>
                {eventi.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.nome}</option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" mb={1}>Dal giorno</Text>
            <Input type="date" value={dal} onChange={(e) => setDal(e.target.value)} />
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" mb={1}>Al giorno</Text>
            <Input type="date" value={al} onChange={(e) => setAl(e.target.value)} />
          </Box>
        </SimpleGrid>

        {isLoading ? (
          <Center py={10}><Spinner color="brand.600" /></Center>
        ) : error ? (
          <Banner tone="error">Errore nel caricamento storico: {(error as Error).message}</Banner>
        ) : giornate.length === 0 ? (
          <Text fontSize="sm" color="gray.400">Nessuna giornata chiusa trovata con questi filtri.</Text>
        ) : (
          <Stack gap={3}>
            {giornate.map((g) => (
              <GiornataStoricoCard key={g.giornata.id} storico={g} />
            ))}
          </Stack>
        )}
      </Section>
    </Stack>
  )
}
