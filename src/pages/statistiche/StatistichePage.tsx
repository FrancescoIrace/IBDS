import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Box, Button, Center, Input, NativeSelect, SimpleGrid, Spinner, Stack, Table, Text } from '@chakra-ui/react'
import { useEventi } from '../../hooks/useEventi'
import { useProdotti } from '../../hooks/useProdotti'
import { useStoricoGiornate } from '../../hooks/useStorico'
import { calcolaCrepe, calcolaStockRiga } from '../../lib/calcoli'
import { formatEuro } from '../../lib/format'
import { Section } from '../../components/Section'
import { Banner } from '../../components/Banner'
import { StatTile } from '../../components/StatTile'

const CHART_HUE = '#2a78d6'
const GRID_COLOR = '#e1e0d9'
const AXIS_COLOR = '#898781'

export default function StatistichePage() {
  const { data: eventi = [] } = useEventi()
  const { data: prodotti = [] } = useProdotti()

  const [eventoId, setEventoId] = useState('')
  const [prodottoId, setProdottoId] = useState('')
  const [dal, setDal] = useState('')
  const [al, setAl] = useState('')
  const [vistaTabella, setVistaTabella] = useState(false)

  const { data: giornate = [], isLoading, error } = useStoricoGiornate({
    eventoId: eventoId || undefined,
    dal: dal || undefined,
    al: al || undefined,
  })

  const aggregati = useMemo(() => {
    const perProdotto = new Map<string, { nome: string; pezziVenduti: number; guadagno: number }>()
    let totaleBiglietti = 0
    let totaleIncassoNettoCrepes = 0
    let totalePezziMerce = 0
    let totaleIncassoMerce = 0

    const trendPerData: { data: string; guadagno: number }[] = []

    for (const g of giornate) {
      let guadagnoGiorno = 0

      for (const row of g.stockRows) {
        if (prodottoId && row.prodotto_id !== prodottoId) continue
        const calc = calcolaStockRiga(row)
        if (calc.pezziVenduti === null || calc.guadagno === null) continue
        totalePezziMerce += calc.pezziVenduti
        totaleIncassoMerce += calc.guadagno
        guadagnoGiorno += calc.guadagno

        const nome = row.prodotto?.nome ?? 'Prodotto'
        const entry = perProdotto.get(nome) ?? { nome, pezziVenduti: 0, guadagno: 0 }
        entry.pezziVenduti += calc.pezziVenduti
        entry.guadagno += calc.guadagno
        perProdotto.set(nome, entry)
      }

      if (g.crepeConteggio) {
        totaleBiglietti += g.crepeConteggio.totale_biglietti
        totaleIncassoNettoCrepes += calcolaCrepe(g.crepeConteggio).quotaNetta
      }

      trendPerData.push({ data: g.giornata.data, guadagno: guadagnoGiorno })
    }

    const classificaProdotti = [...perProdotto.values()].sort((a, b) => b.guadagno - a.guadagno).slice(0, 10)
    const trend = trendPerData
      .sort((a, b) => a.data.localeCompare(b.data))
      .map((t) => ({ ...t, dataLabel: t.data.slice(5).split('-').reverse().join('/') }))

    return { classificaProdotti, trend, totaleBiglietti, totaleIncassoNettoCrepes, totalePezziMerce, totaleIncassoMerce }
  }, [giornate, prodottoId])

  return (
    <Stack gap={6}>
      <Section title="Statistiche vendite" subtitle="Filtra per evento, prodotto e periodo per analizzare l'andamento delle vendite.">
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={3} mb={5}>
          <Box>
            <Text fontSize="xs" color="gray.500" mb={1}>Evento</Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={eventoId} onChange={(e) => setEventoId(e.target.value)}>
                <option value="">Tutti gli eventi</option>
                {eventi.map((ev) => <option key={ev.id} value={ev.id}>{ev.nome}</option>)}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" mb={1}>Prodotto</Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={prodottoId} onChange={(e) => setProdottoId(e.target.value)}>
                <option value="">Tutti i prodotti</option>
                {prodotti.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
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
          <Banner tone="error">Errore nel caricamento statistiche: {(error as Error).message}</Banner>
        ) : giornate.length === 0 ? (
          <Text fontSize="sm" color="gray.400">Nessun dato disponibile per questi filtri.</Text>
        ) : (
          <Stack gap={6}>
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
              <StatTile label="Pezzi merce venduti" value={String(aggregati.totalePezziMerce)} />
              <StatTile label="Incasso merce" value={formatEuro(aggregati.totaleIncassoMerce)} tone="brand" />
              <StatTile label="Biglietti crepes" value={String(aggregati.totaleBiglietti)} />
              <StatTile label="Incasso netto crepes" value={formatEuro(aggregati.totaleIncassoNettoCrepes)} tone="brand" />
            </SimpleGrid>

            <Button size="sm" variant="outline" alignSelf="flex-start" onClick={() => setVistaTabella((v) => !v)}>
              {vistaTabella ? 'Vedi come grafico' : 'Vedi come tabella'}
            </Button>

            {vistaTabella ? (
              <Box overflowX="auto">
                <Table.Root size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Prodotto</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Pezzi venduti</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Incasso</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {aggregati.classificaProdotti.map((p) => (
                      <Table.Row key={p.nome}>
                        <Table.Cell>{p.nome}</Table.Cell>
                        <Table.Cell textAlign="right">{p.pezziVenduti}</Table.Cell>
                        <Table.Cell textAlign="right" fontWeight="semibold">{formatEuro(p.guadagno)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            ) : (
              <>
                {aggregati.classificaProdotti.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>Vendite per prodotto (incasso)</Text>
                    <Box h={Math.max(180, aggregati.classificaProdotti.length * 44)}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aggregati.classificaProdotti} layout="vertical" margin={{ left: 12, right: 24 }}>
                          <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
                          <XAxis type="number" tickFormatter={(v) => formatEuro(v)} stroke={AXIS_COLOR} fontSize={12} />
                          <YAxis type="category" dataKey="nome" width={110} stroke={AXIS_COLOR} fontSize={12} />
                          <Tooltip formatter={(v) => formatEuro(Number(v))} contentStyle={{ borderRadius: 8, borderColor: GRID_COLOR }} />
                          <Bar dataKey="guadagno" fill={CHART_HUE} radius={[0, 4, 4, 0]} maxBarSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                )}

                {aggregati.trend.length > 1 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>Andamento incasso merce per giornata</Text>
                    <Box h="220px">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={aggregati.trend} margin={{ left: 0, right: 12 }}>
                          <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                          <XAxis dataKey="dataLabel" stroke={AXIS_COLOR} fontSize={12} />
                          <YAxis tickFormatter={(v) => formatEuro(v)} stroke={AXIS_COLOR} fontSize={12} width={70} />
                          <Tooltip formatter={(v) => formatEuro(Number(v))} contentStyle={{ borderRadius: 8, borderColor: GRID_COLOR }} />
                          <Bar dataKey="guadagno" fill={CHART_HUE} radius={[4, 4, 0, 0]} maxBarSize={36} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Stack>
        )}
      </Section>
    </Stack>
  )
}
