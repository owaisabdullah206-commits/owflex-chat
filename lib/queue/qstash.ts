import { Client, Receiver } from '@upstash/qstash'

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
