export function formatEuro(value: number | null | undefined): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0)
}

export function formatData(value: string | null | undefined): string {
  if (!value) return '-'
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDataLunga(value: string | null | undefined): string {
  if (!value) return '-'
  const [year, month, day] = value.split('-').map(Number)
  const formatted = new Date(year, month - 1, day).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return formatted.replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-'
  return new Date(value).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatOrario(value: string | null | undefined): string {
  if (!value) return '-'
  return new Date(value).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

export function formatDuration(startIso: string | null, endIso: string | null): string {
  if (!startIso) return '-'
  const end = endIso ? new Date(endIso).getTime() : Date.now()
  const diffMs = end - new Date(startIso).getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  const hours = Math.floor(minutes / 60)
  const remMinutes = minutes % 60
  return `${hours}h ${String(remMinutes).padStart(2, '0')}m`
}

export function calcolaIngredientiImpasto(impasti: number) {
  const qty = Number(impasti) || 0
  return {
    farina: qty * 2,
    zucchero: qty,
    latte: qty,
    acqua: qty * 1.5,
    margarina: qty,
  }
}
