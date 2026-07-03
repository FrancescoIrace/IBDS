import type { ReactNode } from 'react'
import { Box, Flex, Heading, Text } from '@chakra-ui/react'

export function Section({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="2xl" p={{ base: 4, md: 6 }} boxShadow="sm">
      <Flex align="flex-start" justify="space-between" gap={4} mb={5} wrap="wrap">
        <Box>
          <Heading size="md" color="gray.800">{title}</Heading>
          {subtitle && <Text mt={1} fontSize="sm" color="gray.500">{subtitle}</Text>}
        </Box>
        {actions && <Box>{actions}</Box>}
      </Flex>
      {children}
    </Box>
  )
}
