import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Box, Flex, Stack, Text, IconButton, Separator } from '@chakra-ui/react'
import {
  FiClipboard,
  FiTag,
  FiCalendar,
  FiArchive,
  FiBarChart2,
  FiUsers,
  FiLogOut,
} from 'react-icons/fi'
import { useAuth } from '../auth/AuthContext'

interface NavItem {
  to: string
  label: string
  icon: typeof FiClipboard
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Oggi', icon: FiClipboard },
  { to: '/eventi', label: 'Eventi', icon: FiTag },
  { to: '/calendario', label: 'Calendario', icon: FiCalendar },
  { to: '/storico', label: 'Storico', icon: FiArchive },
  { to: '/statistiche', label: 'Statistiche', icon: FiBarChart2 },
  { to: '/utenti', label: 'Utenti', icon: FiUsers, adminOnly: true },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <Flex minH="100dvh" bg="gray.50">
      {/* Sidebar desktop */}
      <Flex
        as="nav"
        direction="column"
        display={{ base: 'none', md: 'flex' }}
        w="240px"
        flexShrink={0}
        bg="white"
        borderRightWidth="1px"
        borderColor="gray.200"
        py={6}
        px={4}
      >
        <Text fontSize="xl" fontWeight="bold" color="brand.700" px={2} mb={8}>
          IBDS
        </Text>

        <Stack gap={1} flex="1">
          {visibleItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              {({ isActive }) => (
                <Flex
                  align="center"
                  gap={3}
                  px={3}
                  py={2.5}
                  borderRadius="lg"
                  bg={isActive ? 'brand.subtle' : 'transparent'}
                  color={isActive ? 'brand.fg' : 'gray.600'}
                  fontWeight={isActive ? 'semibold' : 'medium'}
                  _hover={{ bg: 'brand.subtle', color: 'brand.fg' }}
                  transition="background 0.15s ease"
                >
                  <Box as={item.icon} boxSize={5} />
                  <Text fontSize="sm">{item.label}</Text>
                </Flex>
              )}
            </NavLink>
          ))}
        </Stack>

        <Separator my={4} />

        <Box px={2}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700" truncate>
            {profile?.full_name ?? '...'}
          </Text>
          <Text fontSize="xs" color="gray.400" mb={3}>
            {profile?.role === 'admin' ? 'Amministratore' : 'Operatore'}
          </Text>
          <Flex
            align="center"
            gap={2}
            px={3}
            py={2}
            borderRadius="lg"
            color="red.600"
            cursor="pointer"
            _hover={{ bg: 'red.50' }}
            onClick={handleLogout}
          >
            <Box as={FiLogOut} boxSize={4} />
            <Text fontSize="sm" fontWeight="medium">Esci</Text>
          </Flex>
        </Box>
      </Flex>

      {/* Colonna principale */}
      <Flex direction="column" flex="1" minW={0}>
        {/* Header mobile */}
        <Flex
          display={{ base: 'flex', md: 'none' }}
          align="center"
          justify="space-between"
          bg="white"
          borderBottomWidth="1px"
          borderColor="gray.200"
          px={4}
          py={3}
          position="sticky"
          top={0}
          zIndex={10}
        >
          <Text fontSize="lg" fontWeight="bold" color="brand.700">IBDS</Text>
          <IconButton aria-label="Esci" variant="ghost" size="sm" onClick={handleLogout}>
            <FiLogOut />
          </IconButton>
        </Flex>

        <Box flex="1" px={{ base: 4, md: 8 }} py={{ base: 4, md: 8 }} pb={{ base: '84px', md: 8 }}>
          {children}
        </Box>

        {/* Tab bar mobile */}
        <Flex
          as="nav"
          display={{ base: 'flex', md: 'none' }}
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg="white"
          borderTopWidth="1px"
          borderColor="gray.200"
          justify="space-around"
          py={1.5}
          zIndex={10}
        >
          {visibleItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              {({ isActive }) => (
                <Flex
                  direction="column"
                  align="center"
                  gap={0.5}
                  px={2}
                  py={1}
                  color={isActive ? 'brand.fg' : 'gray.500'}
                  minW="56px"
                >
                  <Box as={item.icon} boxSize={5} />
                  <Text fontSize="10px" fontWeight={isActive ? 'bold' : 'medium'}>
                    {item.label}
                  </Text>
                </Flex>
              )}
            </NavLink>
          ))}
        </Flex>
      </Flex>
    </Flex>
  )
}
