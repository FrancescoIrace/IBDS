import { useState } from 'react'
import { Badge, Box, Button, Flex, NativeSelect, Stack, Text } from '@chakra-ui/react'
import { FiClock, FiTrash2 } from 'react-icons/fi'
import type { Profile, Turno } from '../../types/database'
import { formatDuration, formatOrario } from '../../lib/format'

type TurnoConProfilo = Turno & { profile: Profile | null }

export function TurniPanel({
  turni,
  profiles,
  isAdmin,
  isBusy,
  onAggiungi,
  onTermina,
  onRimuovi,
}: {
  turni: TurnoConProfilo[]
  profiles: Profile[]
  isAdmin: boolean
  isBusy?: boolean
  onAggiungi: (userId: string) => void
  onTermina: (turnoId: string) => void
  onRimuovi: (turnoId: string) => void
}) {
  const [selectedUserId, setSelectedUserId] = useState('')

  const disponibili = profiles.filter((p) => !turni.some((t) => t.user_id === p.id))

  const handleAggiungi = () => {
    if (!selectedUserId) return
    onAggiungi(selectedUserId)
    setSelectedUserId('')
  }

  return (
    <Box>
      {turni.length === 0 ? (
        <Text fontSize="sm" color="gray.400" mb={isAdmin ? 3 : 0}>
          Nessun operatore ancora aggiunto a questa giornata.
        </Text>
      ) : (
        <Stack gap={2} mb={isAdmin ? 4 : 0}>
          {turni.map((t) => {
            const inCorso = !!t.ora_inizio && !t.ora_fine
            return (
              <Flex
                key={t.id}
                align="center"
                justify="space-between"
                gap={3}
                wrap="wrap"
                borderWidth="1px"
                borderColor={inCorso ? 'brand.emphasized' : 'gray.200'}
                bg={inCorso ? 'brand.subtle' : 'gray.50'}
                borderRadius="lg"
                px={3}
                py={2}
              >
                <Flex align="center" gap={2}>
                  <FiClock />
                  <Text fontSize="sm" color="gray.700">
                    <b>{t.profile?.full_name ?? 'Utente'}</b>{' '}
                    {inCorso
                      ? `dalle ${formatOrario(t.ora_inizio)} (${formatDuration(t.ora_inizio, null)})`
                      : t.ora_fine
                        ? `${formatOrario(t.ora_inizio)} - ${formatOrario(t.ora_fine)} (${formatDuration(t.ora_inizio, t.ora_fine)})`
                        : '-'}
                  </Text>
                  {inCorso && <Badge colorPalette="brand">in corso</Badge>}
                </Flex>

                {isAdmin && (
                  <Flex gap={2}>
                    {inCorso && (
                      <Button size="xs" variant="outline" onClick={() => onTermina(t.id)} disabled={isBusy}>
                        Termina
                      </Button>
                    )}
                    <Button size="xs" variant="ghost" colorPalette="red" onClick={() => onRimuovi(t.id)} disabled={isBusy}>
                      <FiTrash2 />
                    </Button>
                  </Flex>
                )}
              </Flex>
            )
          })}
        </Stack>
      )}

      {isAdmin && (
        <Flex gap={2} wrap="wrap">
          <NativeSelect.Root flex="1" minW="200px" disabled={isBusy}>
            <NativeSelect.Field value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              <option value="">Seleziona un operatore da aggiungere</option>
              {disponibili.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Button colorPalette="brand" onClick={handleAggiungi} disabled={!selectedUserId || isBusy} loading={isBusy}>
            Aggiungi operatore
          </Button>
        </Flex>
      )}
    </Box>
  )
}
