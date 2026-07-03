import { useState } from 'react'
import { Button, Flex, Text } from '@chakra-ui/react'

export function ConfirmButton({
  label,
  confirmLabel = 'Sì, conferma',
  message = 'Sei sicuro? Questa azione non si può annullare.',
  isLoading,
  onConfirm,
  size = 'sm',
}: {
  label: string
  confirmLabel?: string
  message?: string
  isLoading?: boolean
  onConfirm: () => void
  size?: 'sm' | 'md'
}) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <Flex align="center" gap={2} bg="red.50" borderWidth="1px" borderColor="red.200" borderRadius="lg" px={3} py={2}>
        <Text fontSize="xs" color="red.700" flex="1">{message}</Text>
        <Button size="xs" colorPalette="red" loading={isLoading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button size="xs" variant="ghost" onClick={() => setConfirming(false)} disabled={isLoading}>
          Annulla
        </Button>
      </Flex>
    )
  }

  return (
    <Button size={size} variant="outline" colorPalette="red" onClick={() => setConfirming(true)}>
      {label}
    </Button>
  )
}
