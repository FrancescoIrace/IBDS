import { useMemo, useState } from 'react'
import { Badge, Box, Button, Center, Flex, Input, NativeSelect, Spinner, Stack, Table, Text } from '@chakra-ui/react'
import { useProfiles } from '../../hooks/useProfiles'
import { useUpdateProfile } from '../../hooks/useUpdateProfile'
import { useTurniAdmin, useUpdateTurno } from '../../hooks/useTurni'
import type { Profile } from '../../types/database'
import { Section } from '../../components/Section'
import { Banner } from '../../components/Banner'
import { formatData, formatDuration, formatEuro, formatOrario } from '../../lib/format'
import { ProfileEditDialog } from './ProfileEditDialog'

export default function UtentiPage() {
  const { data: profiles = [], isLoading: loadingProfiles, error: profilesError } = useProfiles()
  const updateProfile = useUpdateProfile()
  const { data: turni = [], isLoading: loadingTurni, error: turniError } = useTurniAdmin()
  const updateTurno = useUpdateTurno()

  const [editing, setEditing] = useState<Profile | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filtroUtente, setFiltroUtente] = useState('')
  const [soloNonPagati, setSoloNonPagati] = useState(false)

  const turniFiltrati = useMemo(
    () =>
      turni.filter((t) => {
        if (filtroUtente && t.user_id !== filtroUtente) return false
        if (soloNonPagati && t.pagato) return false
        return true
      }),
    [turni, filtroUtente, soloNonPagati],
  )

  const totaleDaPagare = turniFiltrati.filter((t) => !t.pagato).reduce((acc, t) => acc + Number(t.compenso), 0)

  return (
    <Stack gap={6}>
      <Section title="Utenti" subtitle="Gestisci ruoli e tariffa giornaliera predefinita di ciascun utente.">
        {loadingProfiles ? (
          <Center py={10}><Spinner color="brand.600" /></Center>
        ) : profilesError ? (
          <Banner tone="error">Errore nel caricamento utenti: {(profilesError as Error).message}</Banner>
        ) : (
          <Box overflowX="auto">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Nome</Table.ColumnHeader>
                  <Table.ColumnHeader>Ruolo</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Tariffa giornaliera</Table.ColumnHeader>
                  <Table.ColumnHeader></Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {profiles.map((p) => (
                  <Table.Row key={p.id}>
                    <Table.Cell fontWeight="medium">{p.full_name}</Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={p.role === 'admin' ? 'brand' : 'gray'}>
                        {p.role === 'admin' ? 'Amministratore' : 'Operatore'}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="right">{p.tariffa_giornaliera != null ? formatEuro(p.tariffa_giornaliera) : '-'}</Table.Cell>
                    <Table.Cell textAlign="right">
                      <Button size="xs" variant="outline" onClick={() => { setEditing(p); setDialogOpen(true) }}>
                        Modifica
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </Section>

      <Section title="Turni e pagamenti" subtitle="Presenze registrate per ogni giornata e stato dei pagamenti.">
        <Flex gap={3} mb={4} wrap="wrap" align="flex-end">
          <Box>
            <Text fontSize="xs" color="gray.500" mb={1}>Utente</Text>
            <NativeSelect.Root>
              <NativeSelect.Field value={filtroUtente} onChange={(e) => setFiltroUtente(e.target.value)}>
                <option value="">Tutti</option>
                {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>
          <Button
            size="sm"
            variant={soloNonPagati ? 'solid' : 'outline'}
            colorPalette="brand"
            onClick={() => setSoloNonPagati((v) => !v)}
          >
            Solo da pagare
          </Button>
          <Box ml="auto" textAlign="right">
            <Text fontSize="xs" color="gray.500">Totale da pagare (filtro attuale)</Text>
            <Text fontWeight="bold" color="brand.700" fontSize="lg">{formatEuro(totaleDaPagare)}</Text>
          </Box>
        </Flex>

        {loadingTurni ? (
          <Center py={10}><Spinner color="brand.600" /></Center>
        ) : turniError ? (
          <Banner tone="error">Errore nel caricamento turni: {(turniError as Error).message}</Banner>
        ) : turniFiltrati.length === 0 ? (
          <Text fontSize="sm" color="gray.400">Nessun turno trovato.</Text>
        ) : (
          <Box overflowX="auto">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Utente</Table.ColumnHeader>
                  <Table.ColumnHeader>Giornata</Table.ColumnHeader>
                  <Table.ColumnHeader>Orario</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Compenso</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="center">Pagato</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {turniFiltrati.map((t) => (
                  <Table.Row key={t.id}>
                    <Table.Cell>{t.profile?.full_name ?? '-'}</Table.Cell>
                    <Table.Cell>
                      {formatData(t.giornata?.data)}
                      {t.evento && <Text as="span" color="gray.500"> · {t.evento.nome}</Text>}
                    </Table.Cell>
                    <Table.Cell fontSize="xs" color="gray.600">
                      {formatOrario(t.ora_inizio)} - {formatOrario(t.ora_fine)} ({formatDuration(t.ora_inizio, t.ora_fine)})
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      <Input
                        size="xs"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={t.compenso}
                        w="90px"
                        textAlign="right"
                        onBlur={(e) => {
                          const val = Number(e.target.value) || 0
                          if (val !== t.compenso) updateTurno.mutate({ id: t.id, compenso: val })
                        }}
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button
                        size="2xs"
                        variant={t.pagato ? 'solid' : 'outline'}
                        colorPalette={t.pagato ? 'brand' : 'gray'}
                        onClick={() =>
                          updateTurno.mutate({
                            id: t.id,
                            pagato: !t.pagato,
                            pagato_at: !t.pagato ? new Date().toISOString() : null,
                          })
                        }
                      >
                        {t.pagato ? 'Pagato' : 'Da pagare'}
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </Section>

      <ProfileEditDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null) }}
        profile={editing}
        isSaving={updateProfile.isPending}
        onSubmit={async (input) => {
          if (!editing) return
          await updateProfile.mutateAsync({ id: editing.id, ...input })
          setDialogOpen(false)
        }}
      />
    </Stack>
  )
}
