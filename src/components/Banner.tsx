import type { ReactNode } from 'react'
import { Box, Text } from '@chakra-ui/react'

const TONES = {
  error: { bg: 'red.50', border: 'red.200', color: 'red.700' },
  success: { bg: 'green.50', border: 'green.200', color: 'green.700' },
  info: { bg: 'blue.50', border: 'blue.200', color: 'blue.700' },
  warning: { bg: 'orange.50', border: 'orange.200', color: 'orange.700' },
} as const

export function Banner({ tone = 'info', children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  const t = TONES[tone]
  return (
    <Box bg={t.bg} borderWidth="1px" borderColor={t.border} borderRadius="lg" px={3} py={2.5}>
      <Text fontSize="sm" color={t.color}>{children}</Text>
    </Box>
  )
}
