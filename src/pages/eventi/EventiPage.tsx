import { useState } from 'react'
import { Button, Center, Spinner, Stack, Text } from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'
import { useAuth } from '../../auth/AuthContext'
import { useCreateEvento, useDeleteEvento, useEventi, useUpdateEvento, type EventoInput } from '../../hooks/useEventi'
import type { Evento } from '../../types/database'
import { Section } from '../../components/Section'
import { Banner } from '../../components/Banner'
import { EventoCard } from './EventoCard'
import { EventoFormDialog } from './EventoFormDialog'

export default function EventiPage() {
  const { profile, isAdmin } = useAuth()
  const { data: eventi = [], isLoading, error } = useEventi()
  const createEvento = useCreateEvento()
  const updateEvento = useUpdateEvento()
  const deleteEvento = useDeleteEvento()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Evento | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleSubmit = async (input: EventoInput) => {
    if (editing) {
      await updateEvento.mutateAsync({ id: editing.id, ...input })
    } else {
      await createEvento.mutateAsync({ ...input, created_by: profile?.id ?? null })
    }
    setDialogOpen(false)
    setEditing(null)
  }

  return (
    <Stack gap={6}>
      <Section
        title="Eventi"
        subtitle="Fiere, sagre e feste dove viene allestito lo stand."
        actions={
          isAdmin && (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setDialogOpen(true) }}>
              <FiPlus /> Nuovo evento
            </Button>
          )
        }
      >
        {isLoading ? (
          <Center py={10}><Spinner color="brand.600" /></Center>
        ) : error ? (
          <Banner tone="error">Errore nel caricamento eventi: {(error as Error).message}</Banner>
        ) : eventi.length === 0 ? (
          <Text fontSize="sm" color="gray.400">Nessun evento creato.</Text>
        ) : (
          <Stack gap={3}>
            {eventi.map((evento) => (
              <EventoCard
                key={evento.id}
                evento={evento}
                isAdmin={isAdmin}
                isDeleting={deletingId === evento.id && deleteEvento.isPending}
                onEdit={() => { setEditing(evento); setDialogOpen(true) }}
                onDelete={() => {
                  setDeletingId(evento.id)
                  deleteEvento.mutate(evento.id, { onSettled: () => setDeletingId(null) })
                }}
              />
            ))}
          </Stack>
        )}
      </Section>

      <EventoFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null) }}
        evento={editing}
        isSaving={createEvento.isPending || updateEvento.isPending}
        onSubmit={handleSubmit}
      />
    </Stack>
  )
}
