/**
 * seed-demo-usage.ts
 *
 * Simulates ~30% credit usage on the demo agency account so the Usage tab
 * looks realistic. Idempotent — safe to run multiple times.
 *
 * What it does:
 *   1. Finds the demo org (demo@octively.com)
 *   2. Inserts ~225 chat_debit transactions spread over the last 30 days
 *   3. Sets Redis balance to 525M (750M allocation - 225M used)
 *   4. Updates existing conversations with realistic message/token counts
 *
 * Usage:
 *   npx tsx scripts/seed-demo-usage.ts
 */

import 'dotenv/config'
import { Redis } from '@upstash/redis'
import { and, count, eq, gte, sql, inArray } from 'drizzle-orm'
import { db, schema } from '../lib/db'
import { PLAN_CREDIT_ALLOCATIONS } from '../lib/credits'

const DEMO_EMAIL = 'demo@octively.com'
const USAGE_PCT = 0.28 + Math.random() * 0.04 // 28%–32% random

function getRedis(): Redis {
  const url = (process.env.UPSTASH_REDIS_REST_URL ?? '').replace(/^"|"$/g, '')
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? '').replace(/^"|"$/g, '')
  return new Redis({ url, token })
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function daysAgoDate(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return d
}

async function main() {
  console.log('🔍 Finding demo org...')

  // Find the demo user
  const [user] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, DEMO_EMAIL))
    .limit(1)

  if (!user) {
    console.error(`❌ User ${DEMO_EMAIL} not found. Run seed-demo.ts first.`)
    process.exit(1)
  }

  // Find the org
  const [org] = await db
    .select({ id: schema.organizations.id, plan: schema.organizations.plan })
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, user.id))
    .limit(1)

  if (!org) {
    console.error(`❌ No organization found for ${DEMO_EMAIL}.`)
    process.exit(1)
  }

  const allocation = PLAN_CREDIT_ALLOCATIONS[org.plan] ?? PLAN_CREDIT_ALLOCATIONS.agency
  const totalUsage = Math.round(allocation * USAGE_PCT)
  const redis = getRedis()
  const key = `credits:${org.id}`

  // ── 1. Check existing transactions ──────────────────────────────────────
  const [existingCount] = await db
    .select({ count: count() })
    .from(schema.creditTransactions)
    .where(and(
      eq(schema.creditTransactions.orgId, org.id),
      eq(schema.creditTransactions.reason, 'chat_debit'),
    ))

  if ((existingCount.count ?? 0) > 100) {
    console.log(`⏭️  Already has ${existingCount.count} chat_debit transactions. Resetting...`)
    // Delete existing demo-seed transactions so we can recompute accurately
    await db
      .delete(schema.creditTransactions)
      .where(and(
        eq(schema.creditTransactions.orgId, org.id),
        eq(schema.creditTransactions.reason, 'chat_debit'),
      ))
  }

  // ── 2. Generate credit transactions ─────────────────────────────────────
  const TX_COUNT = randomInt(180, 260) // 180–260 transactions (varies each run)
  const targetUsage = Math.round(allocation * USAGE_PCT)
  const avgDebit = Math.round(targetUsage / TX_COUNT)
  console.log(`📝 Inserting ${TX_COUNT} chat_debit transactions (target ~${(USAGE_PCT * 100).toFixed(1)}% usage)...`)

  const txValues: {
    orgId: string
    delta: number
    reason: string
    refId: string
    createdAt: Date
  }[] = []

  let actualSum = 0
  for (let i = 0; i < TX_COUNT; i++) {
    const daysAgo = randomInt(0, 29)
    const hoursOffset = randomInt(6, 22)
    const minutesOffset = randomInt(0, 59)
    const txDate = daysAgoDate(daysAgo)
    txDate.setHours(hoursOffset, minutesOffset, 0, 0)

    // Vary the debit amount: 40%–160% of average
    const variance = avgDebit * (0.4 + Math.random() * 1.2)
    const delta = -Math.round(variance)
    actualSum += Math.abs(delta)

    txValues.push({
      orgId: org.id,
      delta,
      reason: 'chat_debit',
      refId: `demo-seed-${i}-${Date.now()}`,
      createdAt: txDate,
    })
  }

  // Sort by date ascending
  txValues.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

  // Batch insert (50 at a time to avoid parameter limits)
  for (let i = 0; i < txValues.length; i += 50) {
    const batch = txValues.slice(i, i + 50)
    await db.insert(schema.creditTransactions).values(batch).onConflictDoNothing()
  }

  console.log(`✅ Inserted ${txValues.length} transactions (total debited: ${actualSum.toLocaleString()})`)

  // ── 3. Set Redis balance ────────────────────────────────────────────────
  // Use the ACTUAL sum of inserted transactions, not the target
  const newBalance = Math.max(0, allocation - actualSum)
  const actualPct = ((actualSum / allocation) * 100).toFixed(1)
  await redis.set(key, newBalance)
  console.log(`✅ Redis balance set to ${newBalance.toLocaleString()} (${actualPct}% used)`)

  // ── 4. Update conversations with realistic token counts ─────────────────
  console.log('📊 Updating conversations with realistic token data...')

  const bots = await db
    .select({ id: schema.bots.id })
    .from(schema.bots)
    .where(eq(schema.bots.orgId, org.id))

  if (bots.length === 0) {
    console.log('⚠️  No bots found. Skipping conversation updates.')
    return
  }

  const botIds = bots.map((b) => b.id)

  // Find conversations with 0 or very low message counts
  const staleConvs = await db
    .select({
      id: schema.conversations.id,
      botId: schema.conversations.botId,
    })
    .from(schema.conversations)
    .where(and(
      inArray(schema.conversations.botId, botIds),
      sql`${schema.conversations.messageCount} <= 2`,
    ))
    .limit(300)

  if (staleConvs.length === 0) {
    console.log('⏭️  All conversations already have realistic data.')
    return
  }

  console.log(`  Updating ${staleConvs.length} conversations...`)

  let updated = 0
  for (const conv of staleConvs) {
    const msgCount = randomInt(3, 22)
    const tokensPerMsg = randomInt(120, 800)
    const totalTokens = msgCount * tokensPerMsg
    const inputTokens = Math.round(totalTokens * 0.4)
    const outputTokens = totalTokens - inputTokens
    const costUsd = (totalTokens / 1_000_000 * 0.15).toFixed(8) // ~$0.15/M tokens

    // Update conversation message count
    await db
      .update(schema.conversations)
      .set({ messageCount: msgCount })
      .where(eq(schema.conversations.id, conv.id))

    // Insert messages (alternating user/assistant)
    const messages: {
      conversationId: string
      role: string
      content: string
      tokensUsed: number
      inputTokens: number
      outputTokens: number
      costUsd: string
      modelUsed: string
      createdAt: Date
    }[] = []

    const baseDate = new Date()
    baseDate.setMinutes(baseDate.getMinutes() - randomInt(10, 5000))

    for (let i = 0; i < msgCount; i++) {
      const isUser = i % 2 === 0
      const msgTokens = randomInt(80, 600)
      const msgDate = new Date(baseDate.getTime() + i * randomInt(1000, 5000))

      messages.push({
        conversationId: conv.id,
        role: isUser ? 'user' : 'assistant',
        content: isUser ? 'What are your services?' : 'We offer a wide range of services...',
        tokensUsed: msgTokens,
        inputTokens: isUser ? msgTokens : Math.round(msgTokens * 0.3),
        outputTokens: isUser ? 0 : Math.round(msgTokens * 0.7),
        costUsd: (msgTokens / 1_000_000 * 0.15).toFixed(8),
        modelUsed: isUser ? '' : 'meta-llama/llama-3.3-70b-instruct',
        createdAt: msgDate,
      })
    }

    // Batch insert messages
    for (let i = 0; i < messages.length; i += 50) {
      const batch = messages.slice(i, i + 50)
      await db.insert(schema.messages).values(batch).onConflictDoNothing()
    }

    updated++
  }

  console.log(`✅ Updated ${updated} conversations with realistic token data`)

  // ── 5. Summary ──────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────')
  console.log(`Org:              ${org.id}`)
  console.log(`Plan:             ${org.plan}`)
  console.log(`Allocation:       ${allocation.toLocaleString()} credits`)
  console.log(`Used (~30%):      ${totalUsage.toLocaleString()} credits`)
  console.log(`Redis balance:    ${newBalance.toLocaleString()} credits`)
  console.log(`Transactions:     ${existingCount.count ?? 0} existing + seeded`)
  console.log(`Conversations:    ${updated} updated`)
  console.log('─────────────────────────────────────────\n')
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
