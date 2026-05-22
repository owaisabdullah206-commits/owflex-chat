const ENC_KEY_ENV = 'LLM_KEY_ENCRYPTION_SECRET'

function getKey(): Promise<CryptoKey> {
  const secret = process.env[ENC_KEY_ENV]
  if (!secret) throw new Error(`${ENC_KEY_ENV} not set`)
  const raw = Buffer.from(secret.padEnd(32, '0').slice(0, 32))
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptApiKey(plaintext: string): Promise<string> {
  const key = await getKey()
  const iv  = crypto.getRandomValues(new Uint8Array(12))
  const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext))
  const ivHex  = Buffer.from(iv).toString('hex')
  const ctHex  = Buffer.from(enc).toString('hex')
  return `${ivHex}:${ctHex}`
}

export async function decryptApiKey(stored: string): Promise<string> {
  const [ivHex, ctHex] = stored.split(':')
  if (!ivHex || !ctHex) throw new Error('Invalid stored key format')
  const key = await getKey()
  const iv  = Buffer.from(ivHex, 'hex')
  const ct  = Buffer.from(ctHex, 'hex')
  const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return new TextDecoder().decode(dec)
}
