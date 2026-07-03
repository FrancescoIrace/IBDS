import { useState } from 'react'
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom'
import { Box, Button, Center, Heading, Input, Link as ChakraLink, Stack, Text } from '@chakra-ui/react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'
import { Banner } from '../components/Banner'

export default function SignupPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (session) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('La password deve avere almeno 6 caratteri.')
      return
    }
    setIsSubmitting(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    })
    setIsSubmitting(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (data.session) {
      navigate('/', { replace: true })
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <Center minH="100dvh" bg="gray.50" px={4}>
        <Box w="full" maxW="sm" bg="white" borderRadius="2xl" borderWidth="1px" borderColor="gray.200" boxShadow="lg" p={8} textAlign="center">
          <Heading size="md" color="brand.700" mb={3}>Controlla la tua email</Heading>
          <Text fontSize="sm" color="gray.600">
            Ti abbiamo inviato un'email di conferma. Dopo aver confermato potrai accedere.
          </Text>
          <ChakraLink asChild color="brand.600" fontWeight="semibold" mt={4} display="inline-block">
            <RouterLink to="/login">Torna al login</RouterLink>
          </ChakraLink>
        </Box>
      </Center>
    )
  }

  return (
    <Center minH="100dvh" bg="gray.50" px={4}>
      <Box w="full" maxW="sm" bg="white" borderRadius="2xl" borderWidth="1px" borderColor="gray.200" boxShadow="lg" p={8}>
        <Stack gap={1} mb={6} textAlign="center">
          <Heading size="lg" color="brand.700">Crea un account</Heading>
          <Text fontSize="sm" color="gray.500">Registrati per usare IBDS</Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="semibold" color="gray.700">Nome e cognome</Text>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Mario Rossi" required size="lg" />
            </Box>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="semibold" color="gray.700">Email</Text>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@esempio.it" required size="lg" />
            </Box>
            <Box>
              <Text mb={1} fontSize="sm" fontWeight="semibold" color="gray.700">Password</Text>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Almeno 6 caratteri" required size="lg" />
            </Box>

            {error && <Banner tone="error">{error}</Banner>}

            <Button type="submit" colorPalette="brand" size="lg" loading={isSubmitting} mt={2}>
              Crea account
            </Button>
          </Stack>
        </form>

        <Text mt={6} fontSize="sm" color="gray.500" textAlign="center">
          Hai già un account?{' '}
          <ChakraLink asChild color="brand.600" fontWeight="semibold">
            <RouterLink to="/login">Accedi</RouterLink>
          </ChakraLink>
        </Text>
      </Box>
    </Center>
  )
}
