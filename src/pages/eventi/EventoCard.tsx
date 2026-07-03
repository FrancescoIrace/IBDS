import { useState } from 'react'
import { Box, Button, Flex, Input, Stack, Text } from '@chakra-ui/react'
import { FiChevronDown, FiChevronUp, FiEdit2 } from 'react-icons/fi'
import type { Evento } from '../../types/database'
import { useAddEventoCosto, useDeleteEventoCosto, useEventoCosti } from '../../hooks/useEventi'
import { formatData, formatEuro } from '../../lib/format'
import { ConfirmButton } from '../../components/ConfirmButton'
import { Banner } from '../../components/Banner'

export function EventoCard({
  evento,
  isAdmin,
  onEdit,
  onDelete,
  isDeleting,
}: {
  evento: Evento
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const { data: costi = [] } = useEventoCosti(expanded ? evento.id : null)
  const addCosto = useAddEventoCosto()
  const deleteCosto = useDeleteEventoCosto()

  const [descrizione, setDescrizione] = useState('')
  const [importo, setImporto] = useState('')
  const [error, setError] = useState('')

  const totaleCosti = costi.reduce((acc, c) => acc + Number(c.importo), 0)

  const handleAddCosto = async () => {
    setError('')
    const val = Number(importo)
    if (!descrizione.trim()) { setError('Inserisci una descrizione (es. corrente, acqua, tasse).'); return }
    if (!Number.isFinite(val) || val < 0) { setError('Importo non valido.'); return }
    try {
      await addCosto.mutateAsync({ evento_id: evento.id, descrizione: descrizione.trim(), importo: val })
      setDescrizione('')
      setImporto('')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'aggiunta.")
    }
  }

  return (
    <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={4} bg="white">
      <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
        <Box>
          <Text fontWeight="bold" fontSize="lg" color="gray.800">{evento.nome}</Text>
          <Text fontSize="sm" color="gray.500">
            {formatData(evento.data_inizio)}
            {evento.data_fine && evento.data_fine !== evento.data_inizio ? ` – ${formatData(evento.data_fine)}` : ''}
            {evento.luogo ? ` · ${evento.luogo}` : ''}
          </Text>
          {evento.note && <Text fontSize="sm" color="gray.500" mt={1}>{evento.note}</Text>}
        </Box>
        <Stack gap={1} align="flex-end">
          <Text fontSize="sm" color="gray.600">Quota partecipazione</Text>
          <Text fontWeight="bold" color="brand.700">{formatEuro(evento.costo_partecipazione)}</Text>
        </Stack>
      </Flex>

      <Flex mt={3} gap={2} wrap="wrap">
        <Button size="xs" variant="ghost" onClick={() => setExpanded((v) => !v)}>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
          <Text ml={1}>Costi aggiuntivi</Text>
        </Button>
        {isAdmin && (
          <>
            <Button size="xs" variant="outline" onClick={onEdit}>
              <FiEdit2 /> <Text ml={1}>Modifica</Text>
            </Button>
            <ConfirmButton label="Elimina" isLoading={isDeleting} onConfirm={onDelete} size="sm" />
          </>
        )}
      </Flex>

      {expanded && (
        <Box mt={4} borderTopWidth="1px" borderColor="gray.100" pt={4}>
          {costi.length === 0 ? (
            <Text fontSize="sm" color="gray.400">Nessun costo aggiuntivo registrato (corrente, acqua, tasse...).</Text>
          ) : (
            <Stack gap={2} mb={3}>
              {costi.map((c) => (
                <Flex key={c.id} justify="space-between" align="center" fontSize="sm" bg="gray.50" borderRadius="md" px={3} py={2}>
                  <Text color="gray.700">{c.descrizione}</Text>
                  <Flex align="center" gap={3}>
                    <Text fontWeight="semibold" color="gray.800">{formatEuro(c.importo)}</Text>
                    {isAdmin && (
                      <Button
                        size="2xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => deleteCosto.mutate({ id: c.id, evento_id: evento.id })}
                      >
                        ✕
                      </Button>
                    )}
                  </Flex>
                </Flex>
              ))}
              <Flex justify="space-between" fontSize="sm" fontWeight="bold" px={3}>
                <Text>Totale costi aggiuntivi</Text>
                <Text>{formatEuro(totaleCosti)}</Text>
              </Flex>
              <Flex justify="space-between" fontSize="sm" fontWeight="bold" px={3} color="brand.700">
                <Text>Totale costo evento (quota + extra)</Text>
                <Text>{formatEuro(totaleCosti + Number(evento.costo_partecipazione))}</Text>
              </Flex>
            </Stack>
          )}

          {isAdmin && (
            <Flex gap={2} wrap="wrap">
              <Input
                placeholder="Descrizione (es. corrente)"
                size="sm"
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                flex="1"
                minW="160px"
              />
              <Input
                placeholder="Importo €"
                size="sm"
                type="number"
                min="0"
                step="0.01"
                value={importo}
                onChange={(e) => setImporto(e.target.value)}
                w="120px"
              />
              <Button size="sm" colorPalette="brand" onClick={handleAddCosto} loading={addCosto.isPending}>
                Aggiungi
              </Button>
            </Flex>
          )}
          {error && <Box mt={2}><Banner tone="error">{error}</Banner></Box>}
        </Box>
      )}
    </Box>
  )
}
