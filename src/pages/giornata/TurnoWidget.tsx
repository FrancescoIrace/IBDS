import { Badge, Button, Flex, Text } from '@chakra-ui/react'
import { FiClock } from 'react-icons/fi'
import type { Turno } from '../../types/database'
import { formatDuration, formatOrario } from '../../lib/format'

export function TurnoWidget({
  turno,
  isBusy,
  onInizia,
  onTermina,
}: {
  turno: Turno | undefined
  isBusy?: boolean
  onInizia: () => void
  onTermina: (turnoId: string) => void
}) {
  const inCorso = turno && turno.ora_inizio && !turno.ora_fine

  return (
    <Flex
      align="center"
      justify="space-between"
      gap={3}
      bg={inCorso ? 'brand.subtle' : 'gray.50'}
      borderWidth="1px"
      borderColor={inCorso ? 'brand.emphasized' : 'gray.200'}
      borderRadius="xl"
      px={4}
      py={3}
      wrap="wrap"
    >
      <Flex align="center" gap={2}>
        <FiClock />
        <Text fontSize="sm" color="gray.700">
          {!turno && 'Il tuo turno non è ancora iniziato'}
          {turno && inCorso && `Turno in corso dalle ${formatOrario(turno.ora_inizio)} (${formatDuration(turno.ora_inizio, null)})`}
          {turno && !inCorso && turno.ora_fine && `Turno concluso: ${formatOrario(turno.ora_inizio)} - ${formatOrario(turno.ora_fine)} (${formatDuration(turno.ora_inizio, turno.ora_fine)})`}
        </Text>
        {inCorso && <Badge colorPalette="brand">attivo</Badge>}
      </Flex>

      {!turno || !inCorso ? (
        <Button size="sm" colorPalette="brand" onClick={onInizia} loading={isBusy}>
          {turno ? 'Riprendi il mio turno' : 'Inizia il mio turno'}
        </Button>
      ) : (
        <Button size="sm" variant="outline" onClick={() => onTermina(turno.id)} loading={isBusy}>
          Termina il mio turno
        </Button>
      )}
    </Flex>
  )
}
