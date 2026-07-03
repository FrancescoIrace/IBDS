import { useState } from 'react'
import { Badge, Box, Button, Center, Flex, Heading, Spinner, Stack, Text } from '@chakra-ui/react'
import { useAuth } from '../../auth/AuthContext'
import { useGiornataAttiva } from '../../hooks/useGiornataAttiva'
import { useEventi } from '../../hooks/useEventi'
import { useCreateProdotto, useProdotti } from '../../hooks/useProdotti'
import {
  useApriGiornata,
  useAddStockRow,
  useChiudiGiornata,
  useDeleteGiornata,
  useDeleteStockRow,
  useGestioneTurno,
  useUpdateCrepeConteggio,
  useUpdateGiornataInfo,
} from '../../hooks/useGiornataMutations'
import { AperturaGiornata } from './AperturaGiornata'
import { CrepeCounter } from './CrepeCounter'
import { StockPanel } from './StockPanel'
import { TurnoWidget } from './TurnoWidget'
import { ChiusuraDialog } from './ChiusuraDialog'
import { ModificaGiornataDialog } from './ModificaGiornataDialog'
import { Section } from '../../components/Section'
import { Banner } from '../../components/Banner'
import { ConfirmButton } from '../../components/ConfirmButton'
import { formatData, formatOrario } from '../../lib/format'

export default function GiornataPage() {
  const { profile } = useAuth()
  const { data, isLoading, error } = useGiornataAttiva()
  const { data: eventi = [] } = useEventi()
  const { data: prodotti = [] } = useProdotti()

  const apriGiornata = useApriGiornata()
  const updateCrepe = useUpdateCrepeConteggio()
  const addStockRow = useAddStockRow()
  const deleteStockRow = useDeleteStockRow()
  const chiudiGiornata = useChiudiGiornata()
  const createProdotto = useCreateProdotto()
  const { iniziaTurno, terminaTurno } = useGestioneTurno()
  const deleteGiornata = useDeleteGiornata()
  const updateGiornataInfo = useUpdateGiornataInfo()

  const [chiusuraOpen, setChiusuraOpen] = useState(false)
  const [modificaOpen, setModificaOpen] = useState(false)

  if (isLoading) {
    return (
      <Center minH="50vh">
        <Spinner size="xl" color="brand.600" />
      </Center>
    )
  }

  if (error) {
    return <Banner tone="error">Errore nel caricamento della giornata: {(error as Error).message}</Banner>
  }

  if (!data) {
    return (
      <AperturaGiornata
        eventi={eventi}
        isLoading={!profile}
        onApri={async (eventoId) => {
          if (!profile) return
          await apriGiornata.mutateAsync({ eventoId, userId: profile.id })
        }}
      />
    )
  }

  const { giornata, evento, crepeConteggio, stockRows, turni } = data
  const mieTurno = turni.find((t) => t.user_id === profile?.id)

  return (
    <Stack gap={6}>
      <Flex align="flex-start" justify="space-between" wrap="wrap" gap={3}>
        <Box>
          <Flex align="center" gap={3}>
            <Heading size="lg" color="gray.800">{evento?.nome ?? 'Giornata libera'}</Heading>
            <Badge colorPalette="brand">aperta</Badge>
          </Flex>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {formatData(giornata.data)} · aperta alle {formatOrario(giornata.aperta_at)}
          </Text>
        </Box>
        <Flex gap={2} wrap="wrap">
          <Button variant="outline" onClick={() => setModificaOpen(true)}>
            Modifica
          </Button>
          <ConfirmButton
            label="Elimina giornata"
            message="Eliminare questa giornata? Andranno persi tutti i conteggi e i turni registrati oggi."
            isLoading={deleteGiornata.isPending}
            onConfirm={() => deleteGiornata.mutate(giornata.id)}
          />
          <Button colorPalette="red" onClick={() => setChiusuraOpen(true)}>
            Chiudi giornata
          </Button>
        </Flex>
      </Flex>

      {profile && (
        <TurnoWidget
          turno={mieTurno}
          isBusy={iniziaTurno.isPending || terminaTurno.isPending}
          onInizia={() => iniziaTurno.mutate({ giornataId: giornata.id, userId: profile.id })}
          onTermina={(turnoId) => terminaTurno.mutate(turnoId)}
        />
      )}

      <Section title="Conteggio crepes" subtitle="Tocca + o − per aggiornare i conteggi in tempo reale.">
        <CrepeCounter
          conteggio={crepeConteggio}
          onChange={(field, value) => updateCrepe.mutate({ giornataId: giornata.id, patch: { [field]: value } })}
        />
      </Section>

      <Section title="Stock prodotti" subtitle="Carica la merce a inizio giornata. Le rimanenze si contano in chiusura.">
        <StockPanel
          stockRows={stockRows}
          prodotti={prodotti}
          isBusy={addStockRow.isPending || deleteStockRow.isPending}
          onAdd={async (input) => {
            await addStockRow.mutateAsync({ giornata_id: giornata.id, ...input })
          }}
          onDelete={async (id) => {
            await deleteStockRow.mutateAsync(id)
          }}
          onCreateProdotto={async (nome) => {
            return createProdotto.mutateAsync({ nome, categoria: 'merce', prezzo_vendita: 0, pezzi_per_scatola: null })
          }}
        />
      </Section>

      <ChiusuraDialog
        open={chiusuraOpen}
        onOpenChange={setChiusuraOpen}
        stockRows={stockRows}
        crepeConteggio={crepeConteggio}
        isSaving={chiudiGiornata.isPending}
        onConfirm={(input) => {
          if (!profile) return
          chiudiGiornata.mutate(
            { giornataId: giornata.id, userId: profile.id, ...input },
            { onSuccess: () => setChiusuraOpen(false) },
          )
        }}
      />

      <ModificaGiornataDialog
        open={modificaOpen}
        onOpenChange={setModificaOpen}
        giornata={giornata}
        eventi={eventi}
        isSaving={updateGiornataInfo.isPending}
        onSubmit={async (input) => {
          await updateGiornataInfo.mutateAsync({ giornataId: giornata.id, ...input })
          setModificaOpen(false)
        }}
      />
    </Stack>
  )
}
