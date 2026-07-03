import { useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { it } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Dialog, Portal, Stack, Text } from '@chakra-ui/react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'
import { useEventi } from '../../hooks/useEventi'
import { Section } from '../../components/Section'
import type { Evento } from '../../types/database'
import { formatData, formatEuro } from '../../lib/format'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: it }),
  getDay,
  locales: { it },
})

const MESSAGES = {
  next: 'Avanti',
  previous: 'Indietro',
  today: 'Oggi',
  month: 'Mese',
  week: 'Settimana',
  day: 'Giorno',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Ora',
  event: 'Evento',
  noEventsInRange: 'Nessun evento in questo periodo.',
  showMore: (total: number) => `+${total} altri`,
}

interface CalEvent {
  title: string
  start: Date
  end: Date
  allDay: boolean
  resource: Evento
}

function parseIsoDate(value: string): [number, number, number] {
  return value.split('-').map(Number) as [number, number, number]
}

export default function CalendarioPage() {
  const { data: eventi = [] } = useEventi()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<Evento | null>(null)

  const events: CalEvent[] = useMemo(
    () =>
      eventi.map((ev) => {
        const [y1, m1, d1] = parseIsoDate(ev.data_inizio)
        const start = new Date(y1, m1 - 1, d1)
        const [y2, m2, d2] = parseIsoDate(ev.data_fine ?? ev.data_inizio)
        const end = new Date(y2, m2 - 1, d2 + 1)
        return { title: ev.nome, start, end, allDay: true, resource: ev }
      }),
    [eventi],
  )

  return (
    <Stack gap={6}>
      <Section title="Calendario eventi" subtitle="Vista mensile di tutte le date degli eventi in programma.">
        <Box className="ibds-calendar" h={{ base: '65dvh', md: '72dvh' }}>
          <Calendar
            localizer={localizer}
            events={events}
            defaultView={Views.MONTH}
            views={[Views.MONTH, Views.AGENDA]}
            messages={MESSAGES}
            culture="it"
            popup
            onSelectEvent={(e: CalEvent) => setSelected(e.resource)}
          />
        </Box>
      </Section>

      <Dialog.Root open={!!selected} onOpenChange={(e) => !e.open && setSelected(null)} placement="center">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              {selected && (
                <>
                  <Dialog.Header>
                    <Dialog.Title>{selected.nome}</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Stack gap={2} fontSize="sm" color="gray.700">
                      <Text>
                        <b>Date:</b> {formatData(selected.data_inizio)}
                        {selected.data_fine && selected.data_fine !== selected.data_inizio
                          ? ` – ${formatData(selected.data_fine)}`
                          : ''}
                      </Text>
                      {selected.luogo && <Text><b>Luogo:</b> {selected.luogo}</Text>}
                      <Text><b>Quota partecipazione:</b> {formatEuro(selected.costo_partecipazione)}</Text>
                      {selected.note && <Text><b>Note:</b> {selected.note}</Text>}
                    </Stack>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button variant="outline" onClick={() => setSelected(null)}>Chiudi</Button>
                    <Button colorPalette="brand" onClick={() => navigate('/eventi')}>Vai a Eventi</Button>
                  </Dialog.Footer>
                </>
              )}
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Stack>
  )
}
