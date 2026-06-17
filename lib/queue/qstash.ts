import { Client, Receiver } from '@upstash/qstash'

// INTERNAL_APP_URL is a server-side runtime var (not baked at build time like NEXT_PUBLIC_*).
// Set this in Dokploy env panel to https://admin.octively.com
export function getIngestUrl(): string {
  const base = process.env.INTERNAL_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL
  return `${base}/api/internal/qstash/ingest`
}

function getClient(): Client {
  return new Client({ token: process.env.QSTASH_TOKEN! })
}

function getReceiver(): Receiver {
  return new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  })
}

export async function publishJSON(destinationUrl: string, body: unknown): Promise<void> {
  const client = getClient()
  await client.publishJSON({ url: destinationUrl, body })
}

export async function verifyQStashSignature(
  signature: string,
  rawBody: string,
): Promise<void> {
  const receiver = getReceiver()
  await receiver.verify({ signature, body: rawBody })
}
