import { Box, Text } from '@chakra-ui/react'

export function StatTile({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'brand' }) {
  return (
    <Box bg={tone === 'brand' ? 'brand.subtle' : 'gray.50'} borderRadius="xl" px={4} py={3}>
      <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">{label}</Text>
      <Text fontSize="xl" fontWeight="bold" color={tone === 'brand' ? 'brand.fg' : 'gray.800'} fontVariantNumeric="tabular-nums">
        {value}
      </Text>
    </Box>
  )
}
