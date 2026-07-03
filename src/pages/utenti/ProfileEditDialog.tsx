import { useEffect, useState } from 'react'
import { Box, Button, Dialog, Input, NativeSelect, Portal, Stack, Text } from '@chakra-ui/react'
import type { Profile, Ruolo } from '../../types/database'
import { Banner } from '../../components/Banner'

export function ProfileEditDialog({
  open,
  onOpenChange,
  profile,
  isSaving,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile | null
  isSaving: boolean
  onSubmit: (input: { full_name: string; role: Ruolo; tariffa_giornaliera: number | null }) => Promise<void>
}) {
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Ruolo>('operatore')
  const [tariffa, setTariffa] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name)
      setRole(profile.role)
      setTariffa(profile.tariffa_giornaliera != null ? String(profile.tariffa_giornaliera) : '')
    }
    setError('')
  }, [profile, open])

  const handleSubmit = async () => {
    setError('')
    if (!fullName.trim()) { setError('Inserisci un nome.'); return }
    try {
      await onSubmit({
        full_name: fullName.trim(),
        role,
        tariffa_giornaliera: tariffa.trim() ? Number(tariffa) : null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio.')
    }
  }

  if (!profile) return null

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)} size="sm" placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Modifica utente</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>Nome e cognome</Text>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>Ruolo</Text>
                  <NativeSelect.Root>
                    <NativeSelect.Field value={role} onChange={(e) => setRole(e.target.value as Ruolo)}>
                      <option value="operatore">Operatore</option>
                      <option value="admin">Amministratore</option>
                      <option value="boss">Boss</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={1}>Tariffa giornaliera predefinita (€)</Text>
                  <Input type="number" min="0" step="1" value={tariffa} onChange={(e) => setTariffa(e.target.value)} placeholder="Opzionale" />
                </Box>
                {error && <Banner tone="error">{error}</Banner>}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Annulla</Button>
              <Button colorPalette="brand" onClick={handleSubmit} loading={isSaving}>Salva</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
