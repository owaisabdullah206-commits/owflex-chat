export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return '—'
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('92') && digits.length === 12)
    return `+92 ${digits.slice(2, 5)}-${digits.slice(5, 8)}-${digits.slice(8)}`
  if (digits.startsWith('0') && digits.length === 11)
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  return raw
}
