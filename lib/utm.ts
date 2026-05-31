const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
type UTMKey = (typeof UTM_KEYS)[number]
export type UTMData = Partial<Record<UTMKey, string>>

const STORAGE_KEY = 'oct_utm'

export function captureUTM(): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const data: UTMData = {}
  let found = false
  for (const key of UTM_KEYS) {
    const val = params.get(key)
    if (val) { data[key] = val; found = true }
  }
  if (found) localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getUTM(): UTMData {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as UTMData
  } catch {
    return {}
  }
}
