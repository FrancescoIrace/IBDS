import { useEffect, useState } from 'react'
import { Box, Button, Flex, Input, SimpleGrid, Text } from '@chakra-ui/react'
import type { CrepeConteggio } from '../../types/database'
import { calcolaIngredientiImpasto } from '../../lib/format'

type FieldKey = 'totale_biglietti' | 'totale_omaggi' | 'totale_nutella' | 'totale_nutella_vegana' | 'totale_impasto'

const FIELDS: { key: FieldKey; title: string; unit: string; manual?: boolean }[] = [
  { key: 'totale_biglietti', title: 'Biglietti', unit: 'biglietti', manual: true },
  { key: 'totale_omaggi', title: 'Omaggi', unit: 'omaggi' },
  { key: 'totale_nutella', title: 'Nutella', unit: 'barattoli' },
  { key: 'totale_nutella_vegana', title: 'Nutella vegana', unit: 'barattoli' },
  { key: 'totale_impasto', title: 'Impasto', unit: 'dosi' },
]

export function CrepeCounter({
  conteggio,
  readOnly,
  onChange,
}: {
  conteggio: CrepeConteggio
  readOnly?: boolean
  onChange: (field: FieldKey, value: number) => void
}) {
  const ingredienti = calcolaIngredientiImpasto(conteggio.totale_impasto)

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
        {FIELDS.map((field) => (
          <CounterCard
            key={field.key}
            title={field.title}
            unit={field.unit}
            value={conteggio[field.key]}
            manual={field.manual}
            readOnly={readOnly}
            onChange={(v) => onChange(field.key, v)}
          />
        ))}
      </SimpleGrid>

      {conteggio.totale_impasto > 0 && (
        <Box mt={5} bg="gold.50" borderWidth="1px" borderColor="gold.200" borderRadius="xl" p={4}>
          <Text fontSize="sm" fontWeight="semibold" color="gold.800" mb={2}>
            Ingredienti stimati per {conteggio.totale_impasto} dosi di impasto
          </Text>
          <SimpleGrid columns={{ base: 2, sm: 5 }} gap={3}>
            <IngredientTile label="Farina" value={`${ingredienti.farina} kg`} />
            <IngredientTile label="Zucchero" value={`${ingredienti.zucchero} kg`} />
            <IngredientTile label="Latte" value={`${ingredienti.latte} L`} />
            <IngredientTile label="Acqua" value={`${ingredienti.acqua} L`} />
            <IngredientTile label="Margarina" value={`${ingredienti.margarina} kg`} />
          </SimpleGrid>
        </Box>
      )}
    </Box>
  )
}

function IngredientTile({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="white" borderRadius="lg" px={3} py={2} textAlign="center">
      <Text fontSize="xs" color="gold.700">{label}</Text>
      <Text fontSize="md" fontWeight="bold" color="gold.900">{value}</Text>
    </Box>
  )
}

function CounterCard({
  title,
  unit,
  value,
  manual,
  readOnly,
  onChange,
}: {
  title: string
  unit: string
  value: number
  manual?: boolean
  readOnly?: boolean
  onChange: (value: number) => void
}) {
  const [manualValue, setManualValue] = useState(String(value))

  useEffect(() => {
    setManualValue(String(value))
  }, [value])

  const commitManual = () => {
    const parsed = Math.max(0, Math.trunc(Number(manualValue) || 0))
    setManualValue(String(parsed))
    if (parsed !== value) onChange(parsed)
  }

  return (
    <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={4}>
      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>{title}</Text>
      <Flex align="center" justify="space-between" gap={3}>
        <Button
          size="lg"
          variant="outline"
          borderRadius="xl"
          disabled={readOnly || value === 0}
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </Button>

        <Box textAlign="center" minW="70px">
          {manual ? (
            <Input
              textAlign="center"
              fontSize="2xl"
              fontWeight="bold"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={commitManual}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitManual()
                }
              }}
              disabled={readOnly}
              inputMode="numeric"
            />
          ) : (
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">{value}</Text>
          )}
          <Text fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wide">{unit}</Text>
        </Box>

        <Button
          size="lg"
          colorPalette="brand"
          borderRadius="xl"
          disabled={readOnly}
          onClick={() => onChange(value + 1)}
        >
          +
        </Button>
      </Flex>
    </Box>
  )
}
