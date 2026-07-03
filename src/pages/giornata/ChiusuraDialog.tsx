import { useState } from 'react'
import { Box, Button, Dialog, Portal, SimpleGrid, Stack, Text, Input } from '@chakra-ui/react'
import type { CrepeConteggio, GiornataStock, Prodotto } from '../../types/database'
import { Banner } from '../../components/Banner'

type StockRowConProdotto = GiornataStock & { prodotto: Prodotto | null }

export function ChiusuraDialog({
  open,
  onOpenChange,
  stockRows,
  crepeConteggio,
  isSaving,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stockRows: StockRowConProdotto[]
  crepeConteggio: CrepeConteggio
  isSaving: boolean
  onConfirm: (input: {
    prezzo_crepe: number
    perc_organizzatori: number
    rimanenze: { id: string; scatole_rimaste: number; pezzi_sfusi_rimasti: number }[]
  }) => void
}) {
  const [values, setValues] = useState<Record<string, { scatole: string; sfusi: string }>>({})
  const [prezzoCrepe, setPrezzoCrepe] = useState(String(crepeConteggio.prezzo_crepe))
  const [percOrganizzatori, setPercOrganizzatori] = useState(String(crepeConteggio.perc_organizzatori))
  const [error, setError] = useState('')

  const handleConfirm = () => {
    setError('')
    const prezzo = Number(prezzoCrepe)
    const perc = Number(percOrganizzatori)
    if (!Number.isFinite(prezzo) || prezzo < 0) { setError('Prezzo crepe non valido.'); return }
    if (!Number.isFinite(perc) || perc < 0 || perc > 100) { setError('Percentuale organizzatori non valida (0-100).'); return }

    const rimanenze = stockRows.map((row) => {
      const v = values[row.id] ?? { scatole: '', sfusi: '' }
      return {
        id: row.id,
        scatole_rimaste: Math.max(0, Math.trunc(Number(v.scatole) || 0)),
        pezzi_sfusi_rimasti: Math.max(0, Math.trunc(Number(v.sfusi) || 0)),
      }
    })

    onConfirm({ prezzo_crepe: prezzo, perc_organizzatori: perc, rimanenze })
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)} size="lg" placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxH="calc(100dvh - 2rem)" overflowY="auto">
            <Dialog.Header>
              <Dialog.Title>Chiudi la giornata</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={5}>
                <Text fontSize="sm" color="gray.600">
                  Conta cosa è avanzato per ogni prodotto e conferma i parametri economici delle crepes. L'operazione non è reversibile.
                </Text>

                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>Parametri crepes</Text>
                  <SimpleGrid columns={2} gap={3}>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>Prezzo crepe (€)</Text>
                      <Input type="number" min="0" step="0.1" value={prezzoCrepe} onChange={(e) => setPrezzoCrepe(e.target.value)} />
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>% organizzatori</Text>
                      <Input type="number" min="0" max="100" value={percOrganizzatori} onChange={(e) => setPercOrganizzatori(e.target.value)} />
                    </Box>
                  </SimpleGrid>
                </Box>

                {stockRows.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>Rimanenze prodotti</Text>
                    <Stack gap={3}>
                      {stockRows.map((row) => {
                        const v = values[row.id] ?? { scatole: '', sfusi: '' }
                        return (
                          <Box key={row.id} borderWidth="1px" borderColor="gray.200" borderRadius="lg" p={3}>
                            <Text fontWeight="semibold" fontSize="sm" mb={2}>{row.prodotto?.nome ?? 'Prodotto'}</Text>
                            <SimpleGrid columns={2} gap={3}>
                              <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>Scatole intere avanzate</Text>
                                <Input
                                  type="number"
                                  min="0"
                                  inputMode="numeric"
                                  value={v.scatole}
                                  placeholder="0"
                                  onChange={(e) => setValues((prev) => ({ ...prev, [row.id]: { ...v, scatole: e.target.value } }))}
                                />
                              </Box>
                              <Box>
                                <Text fontSize="xs" color="gray.500" mb={1}>Pezzi sfusi avanzati</Text>
                                <Input
                                  type="number"
                                  min="0"
                                  inputMode="numeric"
                                  value={v.sfusi}
                                  placeholder="0"
                                  onChange={(e) => setValues((prev) => ({ ...prev, [row.id]: { ...v, sfusi: e.target.value } }))}
                                />
                              </Box>
                            </SimpleGrid>
                          </Box>
                        )
                      })}
                    </Stack>
                  </Box>
                )}

                {error && <Banner tone="error">{error}</Banner>}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Annulla</Button>
              <Button colorPalette="brand" onClick={handleConfirm} loading={isSaving}>Conferma chiusura</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
