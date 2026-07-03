import { useState } from 'react'
import { Box, Button, Flex, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { FiTrash2 } from 'react-icons/fi'
import type { GiornataStock, Prodotto } from '../../types/database'
import { ProdottoSelect } from '../../components/ProdottoSelect'
import { Banner } from '../../components/Banner'
import { formatEuro } from '../../lib/format'

type StockRowConProdotto = GiornataStock & { prodotto: Prodotto | null }

export function StockPanel({
  stockRows,
  prodotti,
  onAdd,
  onDelete,
  onCreateProdotto,
  isBusy,
}: {
  stockRows: StockRowConProdotto[]
  prodotti: Prodotto[]
  onAdd: (input: { prodotto_id: string; prezzo_vendita: number; pezzi_per_scatola: number | null; scatole_caricate: number; pezzi_sfusi_caricati: number }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCreateProdotto: (nome: string) => Promise<Prodotto>
  isBusy?: boolean
}) {
  const [prodottoId, setProdottoId] = useState('')
  const [prezzoVendita, setPrezzoVendita] = useState('')
  const [pezziPerScatola, setPezziPerScatola] = useState('')
  const [scatoleCaricate, setScatoleCaricate] = useState('')
  const [pezziSfusi, setPezziSfusi] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const prodottiDisponibili = prodotti.filter((p) => p.attivo && !stockRows.some((r) => r.prodotto_id === p.id))

  const handleSelectProdotto = (id: string) => {
    setProdottoId(id)
    const p = prodotti.find((x) => x.id === id)
    if (p) {
      setPrezzoVendita(String(p.prezzo_vendita))
      setPezziPerScatola(p.pezzi_per_scatola ? String(p.pezzi_per_scatola) : '')
    }
  }

  const handleAdd = async () => {
    setError('')
    const prezzo = Number(prezzoVendita)
    const pezziScatola = pezziPerScatola ? Math.trunc(Number(pezziPerScatola)) : null
    const scatole = Math.trunc(Number(scatoleCaricate)) || 0
    const sfusi = Math.trunc(Number(pezziSfusi)) || 0

    if (!prodottoId) { setError('Seleziona un prodotto.'); return }
    if (!Number.isFinite(prezzo) || prezzo < 0) { setError('Inserisci un prezzo di vendita valido.'); return }
    if (scatole === 0 && sfusi === 0) { setError('Inserisci almeno una scatola o un pezzo sfuso caricato.'); return }

    setIsSaving(true)
    try {
      await onAdd({
        prodotto_id: prodottoId,
        prezzo_vendita: prezzo,
        pezzi_per_scatola: pezziScatola,
        scatole_caricate: scatole,
        pezzi_sfusi_caricati: sfusi,
      })
      setProdottoId('')
      setPrezzoVendita('')
      setPezziPerScatola('')
      setScatoleCaricate('')
      setPezziSfusi('')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'aggiunta.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Stack gap={4}>
      {stockRows.length === 0 ? (
        <Text fontSize="sm" color="gray.400">Nessun prodotto caricato per questa giornata.</Text>
      ) : (
        <Stack gap={2}>
          {stockRows.map((row) => (
            <Flex
              key={row.id}
              align="center"
              justify="space-between"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="lg"
              px={4}
              py={3}
              gap={3}
              wrap="wrap"
            >
              <Box>
                <Text fontWeight="semibold" color="gray.800">{row.prodotto?.nome ?? 'Prodotto'}</Text>
                <Text fontSize="xs" color="gray.500">
                  {row.scatole_caricate} scatole
                  {row.pezzi_per_scatola ? ` × ${row.pezzi_per_scatola} pz` : ''}
                  {row.pezzi_sfusi_caricati > 0 ? ` + ${row.pezzi_sfusi_caricati} pz sfusi` : ''}
                  {' · '}{formatEuro(row.prezzo_vendita)} / pz
                </Text>
              </Box>
              <Button
                size="xs"
                variant="ghost"
                colorPalette="red"
                onClick={() => onDelete(row.id)}
                disabled={isBusy}
              >
                <FiTrash2 />
              </Button>
            </Flex>
          ))}
        </Stack>
      )}

      <Box borderWidth="1px" borderStyle="dashed" borderColor="gray.300" borderRadius="xl" p={4}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>Carica un nuovo prodotto</Text>
        <Stack gap={3}>
          <ProdottoSelect
            prodotti={prodottiDisponibili}
            value={prodottoId}
            onChange={handleSelectProdotto}
            onCreated={onCreateProdotto}
            disabled={isSaving}
          />
          <SimpleGrid columns={{ base: 2, sm: 4 }} gap={3}>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Prezzo (€)</Text>
              <Input type="number" min="0" step="0.1" value={prezzoVendita} onChange={(e) => setPrezzoVendita(e.target.value)} />
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Pezzi/scatola</Text>
              <Input type="number" min="1" step="1" value={pezziPerScatola} onChange={(e) => setPezziPerScatola(e.target.value)} placeholder="opz." />
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Scatole caricate</Text>
              <Input type="number" min="0" step="1" value={scatoleCaricate} onChange={(e) => setScatoleCaricate(e.target.value)} />
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Pezzi sfusi</Text>
              <Input type="number" min="0" step="1" value={pezziSfusi} onChange={(e) => setPezziSfusi(e.target.value)} />
            </Box>
          </SimpleGrid>
          {error && <Banner tone="error">{error}</Banner>}
          <Button colorPalette="brand" alignSelf="flex-start" onClick={handleAdd} loading={isSaving}>
            Aggiungi prodotto
          </Button>
        </Stack>
      </Box>
    </Stack>
  )
}
