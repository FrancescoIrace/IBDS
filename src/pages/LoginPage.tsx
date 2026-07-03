import { useState } from 'react'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import { Box, Button, Center, Heading, Input, Link as ChakraLink, Stack, Text } from '@chakra-ui/react'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const { session, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (session) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    const { error: signInError } = await signIn(email.trim(), password)
    if (signInError) {
      setError('Email o password non corretti.')
    }
    setIsSubmitting(false)
  }

  return (
    <Center minH="100dvh" bg="gray.50" px={4}>
      <Box
        w="full"
        maxW="sm"
        bg="white"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="gray.200"
        boxShadow="lg"
        p={8}
      >
        <Stack gap={1} mb={6} textAlign="center">
          <Heading size="lg" color="brand.700">IBDS</Heading>
          <Text fontSize="sm" color="gray.500">Gestionale eventi e stand</Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="semibold" color="gray.700">Email</Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@esempio.it"
                required
                autoFocus
                size="lg"
              />
            </Box>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="semibold" color="gray.700">Password</Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                size="lg"
              />
            </Box>

            {error && (
              <Box bg="red.50" borderWidth="1px" borderColor="red.200" borderRadius="lg" px={3} py={2}>
                <Text fontSize="sm" color="red.700">{error}</Text>
              </Box>
            )}

            <Button type="submit" colorPalette="brand" size="lg" loading={isSubmitting} mt={2}>
              Accedi
            </Button>
          </Stack>
        </form>

        <Text mt={6} fontSize="sm" color="gray.500" textAlign="center">
          Non hai un account?{' '}
          <ChakraLink asChild color="brand.600" fontWeight="semibold">
            <RouterLink to="/registrati">Registrati</RouterLink>
          </ChakraLink>
        </Text>
      </Box>
    </Center>
  )
}
