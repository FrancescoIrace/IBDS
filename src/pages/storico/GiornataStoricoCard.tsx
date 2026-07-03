import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Box, Button, Flex, SimpleGrid, Stack, Table, Text } from '@chakra-ui/react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useAuth } from '../../auth/AuthContext'
import type { GiornataStorico } from '../../hooks/useStorico'
import { useDeleteGiornata, useReopenGiornata } from '../../hooks/useGiornataMutations'
import { calcolaCrepe, calcolaStockRiga } from '../../lib/calcoli'
import { formatData, formatDuration, formatEuro, formatOrario } from '../../lib/format'
import { ConfirmButton } from '../../components/ConfirmButton'
import { Banner } from '../../components/Banner'

export function GiornataStoricoCard({ storico }: { storico: GiornataStorico }) {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const { giornata, evento, crepeConteggio, stockRows, turni } = storico

  const reopenGiornata = useReopenGiornata()
  const deleteGiornata = useDeleteGiornata()

  const crepeCalc = crepeConteggio ? calcolaCrepe(crepeConteggio) : null
  const stockTotale = stockRows.reduce((acc, row) => acc + (calcolaStockRiga(row).guadagno ?? 0), 0)
  const totaleGiornata = (crepeCalc?.quotaNetta ?? 0) + stockTotale

  return (
    <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={4} bg="white">
      <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
        <Box>
          <Flex align="center" gap={2}>
            <Text fontWeight="bold" fontSize="lg" color="gray.800">{evento?.nome ?? 'Giornata libera'}</Text>
            <Badge colorPalette="gray">chiusa</Badge>
          </Flex>
          <Text fontSize="sm" color="gray.500">
            {formatData(giornata.data)} · {formatOrario(giornata.aperta_at)} - {formatOrario(giornata.chiusa_at)}
          </Text>
        </Box>
        <Stack gap={0} align="flex-end">
          <Text fontSize="xs" color="gray.500">Incasso netto stimato</Text>
          <Text fontWeight="bold" fontSize="lg" color="brand.700">{formatEuro(totaleGiornata)}</Text>
        </Stack>
      </Flex>

      <Flex mt={3} gap={2} wrap="wrap" align="center">
        <Button size="xs" variant="ghost" onClick={() => setExpanded((v) => !v)}>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
          <Text ml={1}>Dettagli</Text>
        </Button>

        {isAdmin && (
          <>
            <Button
              size="xs"
              variant="outline"
              loading={reopenGiornata.isPending}
              onClick={() =>
                reopenGiornata.mutate(giornata.id, {
                  onSuccess: () => navigate('/'),
                })
              }
            >
              Riapri per correggere
            </Button>
            <ConfirmButton
              label="Elimina definitivamente"
              message="Eliminare definitivamente questa giornata e tutti i suoi dati? L'azione non è reversibile."
              isLoading={deleteGiornata.isPending}
              onConfirm={() => deleteGiornata.mutate(giornata.id)}
            />
          </>
        )}
      </Flex>

      {reopenGiornata.isError && (
        <Box mt={2}><Banner tone="error">{(reopenGiornata.error as Error).message}</Banner></Box>
      )}

      {expanded && (
        <Stack mt={4} gap={5} borderTopWidth="1px" borderColor="gray.100" pt={4}>
          {crepeConteggio && (
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>Crepes</Text>
              <SimpleGrid columns={{ base: 2, sm: 5 }} gap={3} mb={3}>
                <Stat label="Biglietti" value={crepeConteggio.totale_biglietti} />
                <Stat label="Omaggi" value={crepeConteggio.totale_omaggi} />
                <Stat label="Nutella" value={crepeConteggio.totale_nutella} />
                <Stat label="Nutella vegana" value={crepeConteggio.totale_nutella_vegana} />
                <Stat label="Impasto" value={crepeConteggio.totale_impasto} />
              </SimpleGrid>
              {crepeCalc && (
                <Flex gap={4} wrap="wrap" fontSize="sm" color="gray.600">
                  <Text>Ricavo lordo: <b>{formatEuro(crepeCalc.ricavoLordo)}</b></Text>
                  <Text>Quota organizzatori ({crepeConteggio.perc_organizzatori}%): <b>{formatEuro(crepeCalc.quotaOrganizzatori)}</b></Text>
                  <Text color="brand.700">Netto: <b>{formatEuro(crepeCalc.quotaNetta)}</b></Text>
                </Flex>
              )}
            </Box>
          )}

          {stockRows.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>Merce venduta</Text>
              <Box overflowX="auto">
                <Table.Root size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Prodotto</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Iniziali</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Rimasti</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Venduti</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Guadagno</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {stockRows.map((row) => {
                      const calc = calcolaStockRiga(row)
                      return (
                        <Table.Row key={row.id}>
                          <Table.Cell>{row.prodotto?.nome ?? 'Prodotto'}</Table.Cell>
                          <Table.Cell textAlign="right">{calc.pezziIniziali}</Table.Cell>
                          <Table.Cell textAlign="right">{calc.pezziRimasti ?? '-'}</Table.Cell>
                          <Table.Cell textAlign="right">{calc.pezziVenduti ?? '-'}</Table.Cell>
                          <Table.Cell textAlign="right" fontWeight="semibold">{formatEuro(calc.guadagno)}</Table.Cell>
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Box>
          )}

          {turni.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>Turni di lavoro</Text>
              <Stack gap={1}>
                {turni.map((t) => (
                  <Flex key={t.id} justify="space-between" fontSize="sm" color="gray.600" bg="gray.50" borderRadius="md" px={3} py={1.5}>
                    <Text>{t.profile?.full_name ?? 'Utente'}</Text>
                    <Text>{formatOrario(t.ora_inizio)} - {formatOrario(t.ora_fine)} ({formatDuration(t.ora_inizio, t.ora_fine)})</Text>
                  </Flex>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Box bg="gray.50" borderRadius="lg" px={2} py={2} textAlign="center">
      <Text fontSize="lg" fontWeight="bold" color="gray.800">{value}</Text>
      <Text fontSize="10px" color="gray.500" textTransform="uppercase">{label}</Text>
    </Box>
  )
}
