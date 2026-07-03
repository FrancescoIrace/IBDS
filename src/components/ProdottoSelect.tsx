import { useEffect, useRef, useState } from 'react'
import { Button, Flex, Input, NativeSelect } from '@chakra-ui/react'
import type { Prodotto } from '../types/database'

export function ProdottoSelect({
  prodotti,
  value,
  onChange,
  onCreated,
  disabled,
}: {
  prodotti: Prodotto[]
  value: string
  onChange: (prodottoId: string) => void
  onCreated: (nome: string) => Promise<Prodotto>
  disabled?: boolean
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [nome, setNome] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAdding) inputRef.current?.focus()
  }, [isAdding])

  const handleConfirm = async () => {
    const trimmed = nome.trim()
    if (!trimmed) return
    setIsSaving(true)
    setError('')
    try {
      const created = await onCreated(trimmed)
      onChange(created.id)
      setIsAdding(false)
      setNome('')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'aggiunta.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isAdding) {
    return (
      <Flex direction="column" gap={1}>
        <Flex gap={2}>
          <Input
            ref={inputRef}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome nuovo prodotto"
            disabled={isSaving}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleConfirm()
              }
              if (e.key === 'Escape') setIsAdding(false)
            }}
          />
          <Button onClick={handleConfirm} loading={isSaving} colorPalette="brand" flexShrink={0}>
            OK
          </Button>
          <Button variant="outline" onClick={() => setIsAdding(false)} flexShrink={0} disabled={isSaving}>
            ✕
          </Button>
        </Flex>
        {error && <Flex color="red.600" fontSize="xs">{error}</Flex>}
      </Flex>
    )
  }

  return (
    <NativeSelect.Root disabled={disabled}>
      <NativeSelect.Field
        value={value}
        onChange={(e) => {
          if (e.target.value === '__new__') {
            setIsAdding(true)
            setNome('')
          } else {
            onChange(e.target.value)
          }
        }}
      >
        <option value="">Seleziona un prodotto</option>
        {prodotti.map((p) => (
          <option key={p.id} value={p.id}>{p.nome}</option>
        ))}
        <option value="__new__">+ Nuovo prodotto...</option>
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  )
}
