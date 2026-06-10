/**
 * Seed the dedicated DEMO-VIDEO account into the live Neon database.
 *
 * Creates TWO logins (BetterAuth-compatible, verified, ready to use):
 *   1. Developer / Agency  →  admin.octively.com   (owns the org + 5 client bots)
 *   2. Client              →  app.octively.com      (sees the featured bot's portal)
 *
 * The featured bot ("Auraline Cosmetics") is seeded so the portal reads ~589 customers /
 * ~47 leads / ~12 this week (matches docs/demo-video-storyboard.md Scene 3).
 * The other 4 bots get lighter data so the admin dashboard looks like a real agency.
 *
 * Usage (from project root):
 *   npx tsx scripts/seed-demo.ts
 *
 * Safe to re-run: it RESETS (deletes) the two demo accounts first, then recreates.
 * It only touches rows owned by the demo emails below — your real data is untouched.
 *
 * Requires DATABASE_URL (read automatically from .env.local).
 */

import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { hashPassword } from 'better-auth/crypto'
import * as schema from '../lib/db/schema'

// ── tiny .env.local loader (no dotenv dependency) ────────────────────────────
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (!m) continue
    const key = m[1]
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = val
  }
} catch {
  /* .env.local optional if DATABASE_URL already in env */
}

if (!process.env.DATABASE_URL) {
  console.error('✖ DATABASE_URL is not set (checked .env.local). Aborting.')
  process.exit(1)
}

const db = drizzle(neon(process.env.DATABASE_URL), { schema })

// ── CONFIG — tweak demo identity / volumes here ──────────────────────────────
const DEV = { email: 'demo@octively.com', password: 'OctivelyDemo!2026', name: 'Octively Demo' }
const CLIENT = { email: 'client.demo@octively.com', password: 'OctivelyClient!2026', name: 'Nasir Khan' }
const ORG_NAME = 'Octively Demo Agency'
const PLAN = 'agency'

// Featured bot (the one the client portal shows). Volumes target the storyboard.
const FEATURED = {
  name: 'Auraline Cosmetics',
  monthConvs: 589,     // conversations this calendar month
  weekConvs: 12,       // of the above, within the last 7 days
  prevMonthConvs: 472, // last month → drives the +% delta on the portal
  monthLeads: 47,
  prevMonthLeads: 38,
}

// The other client bots — lighter data so the agency dashboard looks active.
const OTHER_BOTS = [
  { name: 'Noor Dental Clinic' },
  { name: 'Mehfil Caterers' },
  { name: 'Bizpro Builders' },
  { name: 'ChaiWala Express' },
]

// Add real message rows only to the most-recent N conversations per bot
// (older ones just carry a plausible messageCount). Keeps row count sane.
const MESSAGES_FOR_RECENT = 50

// ── content pools (realistic, PK-flavoured) ──────────────────────────────────
const PK_FIRST = ['Ahmed', 'Ayesha', 'Bilal', 'Fatima', 'Hassan', 'Hira', 'Imran', 'Sana', 'Usman', 'Zara', 'Ali', 'Mariam', 'Saad', 'Noor', 'Faisal', 'Iqra', 'Hamza', 'Sadia', 'Umar', 'Komal']
const PK_LAST = ['Khan', 'Malik', 'Sheikh', 'Butt', 'Raza', 'Qureshi', 'Aslam', 'Hussain', 'Iqbal', 'Farooq', 'Javed', 'Siddiqui', 'Chaudhry', 'Nawaz', 'Bhatti']
const USER_MSGS = [
  'Do you deliver to Johar Town?', 'What are your timings today?', 'Is cash on delivery available?',
  'How much does it cost?', 'Do you have this in stock?', 'Can I get a discount on bulk order?',
  'Which shades are available?', 'How long does delivery take?', 'Do you have a physical store?',
  'Can I exchange if it doesn’t suit me?', 'Is there any sale going on?', 'What is your return policy?',
  'Can someone call me back?', 'Do you accept easypaisa?', 'Is this available in Lahore?',
]
const BOT_MSGS = [
  'Yes! We deliver across the city, usually within 2–3 working days.', 'We are open 11am–9pm, every day.',
  'Absolutely, cash on delivery is available nationwide.', 'Sure — could you share your phone number so our team can assist you?',
  'Yes, that item is currently in stock.', 'We do offer discounts on bulk orders — let me connect you with the team.',
  'Yes, that shade is available right now.', 'Delivery typically takes 2–3 working days.',
  'Yes, exchanges are accepted within 7 days with the receipt.', 'Our current sale is up to 30% off selected items!',
]

// Knowledge-base documents for the featured bot — seeded as fully "ready" so the
// Knowledge Base tab looks populated on camera (no real chunks needed for the visual list).
const FEATURED_DOCS = [
  { sourceType: 'file', displayName: 'Auraline Product Catalogue 2026.pdf', mimeType: 'application/pdf', byteSize: 2_412_544, pageCount: 18, chunkCount: 64, sourceUrl: null as string | null },
  { sourceType: 'file', displayName: 'Shipping & Returns Policy.pdf',        mimeType: 'application/pdf', byteSize: 184_320,   pageCount: 3,  chunkCount: 11, sourceUrl: null as string | null },
  { sourceType: 'file', displayName: 'Auraline FAQ.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', byteSize: 41_984, pageCount: 1, chunkCount: 8, sourceUrl: null as string | null },
  { sourceType: 'url',  displayName: 'Auraline Cosmetics — About', mimeType: 'text/html', byteSize: 18_022, pageCount: 1, chunkCount: 5, sourceUrl: 'https://auralinecosmetics.pk/about' },
]

// Unanswered = the bot's "I don't know"-style REPLY is what gets flagged (flagIfUnanswered
// tests the assistant message). The Unanswered tab shows that reply; "View conversation"
// reveals the question. So we seed a question + a matching uncertainty reply, flag the reply.
// Each reply MUST match lib/ai/uncertainty.ts UNCERTAINTY_RE.
const UNANSWERED_PAIRS: { q: string; a: string }[] = [
  { q: 'Do you ship internationally to Dubai?',                          a: "I'm not sure about international shipping — I don't have that information right now. Let me connect you with our team." },
  { q: 'Is this foundation halal certified?',                            a: "I don't know the certification details for that product. I can pass your question to the team to confirm." },
  { q: 'Do you offer franchise opportunities?',                          a: "That's outside my knowledge. I'd recommend contacting our team directly about partnership options." },
  { q: 'Can I return a product after 60 days?',                          a: "I don't have that information about returns beyond the standard window. Someone from the team can help you." },
  { q: 'What is the full ingredient list for the vitamin C serum?',      a: "I'm unable to provide the complete ingredient list here. Our team can share the full details with you." },
  { q: 'Do you have a physical branch in Multan?',                       a: "I can't help with branch locations at the moment — let me connect you with the team for the latest." },
]

// ── helpers ──────────────────────────────────────────────────────────────────
const now = new Date()
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

const randInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const randDate = (s: Date, e: Date) => new Date(s.getTime() + Math.random() * (e.getTime() - s.getTime()))
const embedKey = () => 'pk_' + randomUUID().replace(/-/g, '').slice(0, 29)
const pkPhone = () => '+92 3' + randInt(0, 4) + randInt(0, 9) + ' ' + randInt(1000000, 9999999)

async function chunkedInsert<T>(table: any, rows: T[], size = 500) {
  for (let i = 0; i < rows.length; i += size) {
    await db.insert(table).values(rows.slice(i, i + size) as any)
  }
}

// Build conversations + messages for one bot. Returns the conversation rows so
// leads can reference them. `windows` = how many conversations land in each range.
function buildConversations(botId: string, ranges: { start: Date; end: Date; n: number }[]) {
  const convs: (typeof schema.conversations.$inferInsert)[] = []
  const msgs: (typeof schema.messages.$inferInsert)[] = []

  const all: { id: string; startedAt: Date }[] = []
  for (const r of ranges) {
    for (let i = 0; i < r.n; i++) {
      const id = randomUUID()
      all.push({ id, startedAt: randDate(r.start, r.end) })
    }
  }
  // newest first so "recent" = the ones with real messages
  all.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())

  all.forEach((c, idx) => {
    const withMsgs = idx < MESSAGES_FOR_RECENT
    const turns = withMsgs ? randInt(2, 4) : 0
    let count = withMsgs ? turns * 2 : randInt(3, 9)
    if (withMsgs) {
      let t = c.startedAt.getTime()
      for (let k = 0; k < turns; k++) {
        t += randInt(20, 90) * 1000
        msgs.push({ id: randomUUID(), conversationId: c.id, role: 'user', content: pick(USER_MSGS), createdAt: new Date(t) })
        t += randInt(2, 8) * 1000
        msgs.push({ id: randomUUID(), conversationId: c.id, role: 'assistant', content: pick(BOT_MSGS), createdAt: new Date(t) })
      }
    }
    convs.push({
      id: c.id, botId, sessionId: 'sess_' + randomUUID().slice(0, 12),
      pageUrl: 'https://client-website.com/', startedAt: c.startedAt, messageCount: count,
    })
  })
  return { convs, msgs }
}

function buildLeads(botId: string, convIds: string[], nThisMonth: number, nPrevMonth: number) {
  const rows: (typeof schema.leads.$inferInsert)[] = []
  const make = (capturedAt: Date) => {
    rows.push({
      id: randomUUID(), botId, conversationId: pick(convIds), capturedAt,
      name: `${pick(PK_FIRST)} ${pick(PK_LAST)}`, phone: pkPhone(),
      email: Math.random() < 0.4 ? `lead${randInt(100, 999)}@gmail.com` : null,
      notes: pick(['Asked about pricing', 'Wants a callback', 'Interested in bulk order', 'Asked about delivery', null]),
    })
  }
  for (let i = 0; i < nThisMonth; i++) make(randDate(monthStart, now))
  for (let i = 0; i < nPrevMonth; i++) make(randDate(prevMonthStart, monthStart))
  return rows
}

async function createAuthUser(u: { email: string; password: string; name: string }, role: 'developer' | 'client') {
  const id = randomUUID()
  const ts = new Date()
  await db.insert(schema.users).values({
    id, name: u.name, email: u.email, emailVerified: true, role, createdAt: ts, updatedAt: ts,
  })
  await db.insert(schema.accounts).values({
    id: randomUUID(), accountId: id, providerId: 'credential', userId: id,
    password: await hashPassword(u.password), createdAt: ts, updatedAt: ts,
  })
  return id
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('▶ Seeding Octively DEMO account into:', process.env.DATABASE_URL!.replace(/:[^:@/]+@/, ':***@'))

  // 1) RESET — delete demo users (cascades org → bots → conversations/messages/leads)
  for (const email of [DEV.email, CLIENT.email]) {
    const deleted = await db.delete(schema.users).where(eq(schema.users.email, email)).returning({ id: schema.users.id })
    if (deleted.length) console.log(`  ↺ reset existing account: ${email}`)
  }

  // 2) Developer (agency) + client logins
  const devId = await createAuthUser(DEV, 'developer')
  const clientId = await createAuthUser(CLIENT, 'client')
  console.log('  ✓ created logins:', DEV.email, '+', CLIENT.email)

  // 3) Organization on the Agency plan
  const orgId = randomUUID()
  await db.insert(schema.organizations).values({ id: orgId, ownerId: devId, name: ORG_NAME, plan: PLAN })

  // 4) Bots — featured (linked to client) + 4 others
  const featuredBotId = randomUUID()
  await db.insert(schema.bots).values({
    id: featuredBotId, orgId, clientUserId: clientId, name: FEATURED.name,
    embedKey: embedKey(), model: 'meta-llama/llama-3.3-70b-instruct', isActive: true,
    // Guardrail ON + lead capture ON so the Settings tab reads right on camera (Agency plan).
    widgetConfig: { strictMode: true, leadCaptureEnabled: true },
  })
  const otherBotIds: string[] = []
  for (const b of OTHER_BOTS) {
    const id = randomUUID()
    otherBotIds.push(id)
    await db.insert(schema.bots).values({ id, orgId, name: b.name, embedKey: embedKey(), model: 'meta-llama/llama-3.3-70b-instruct', isActive: true })
  }
  console.log(`  ✓ created ${1 + OTHER_BOTS.length} bots (featured: "${FEATURED.name}")`)

  // 5) Featured bot data — hits the storyboard targets
  const featured = buildConversations(featuredBotId, [
    { start: monthStart, end: weekStart, n: FEATURED.monthConvs - FEATURED.weekConvs }, // this month, before this week
    { start: weekStart, end: now, n: FEATURED.weekConvs },                              // this week
    { start: prevMonthStart, end: monthStart, n: FEATURED.prevMonthConvs },             // last month (delta)
  ])
  await chunkedInsert(schema.conversations, featured.convs)
  await chunkedInsert(schema.messages, featured.msgs)
  const featuredLeads = buildLeads(featuredBotId, featured.convs.map(c => c.id as string), FEATURED.monthLeads, FEATURED.prevMonthLeads)
  await chunkedInsert(schema.leads, featuredLeads)
  console.log(`  ✓ featured bot: ${featured.convs.length} conversations, ${featured.msgs.length} messages, ${featuredLeads.length} leads`)

  // 5a) Knowledge Base — seed "ready" documents so the KB tab is populated on camera.
  const docRows = FEATURED_DOCS.map((d, i) => {
    const created = randDate(new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), weekStart)
    return {
      id: randomUUID(), botId: featuredBotId, orgId,
      sourceType: d.sourceType, sourceUrl: d.sourceUrl,
      storageKey: d.sourceType === 'file' ? `${orgId}/${featuredBotId}/${randomUUID()}` : null,
      displayName: d.displayName, mimeType: d.mimeType, byteSize: d.byteSize,
      status: 'ready', pageCount: d.pageCount, chunkCount: d.chunkCount, version: 1,
      createdAt: created, updatedAt: created, readyAt: new Date(created.getTime() + 30_000),
    }
  })
  await chunkedInsert(schema.documents, docRows)

  // 5b) Unanswered — seed question + bot uncertainty reply; flag the REPLY (matches product).
  const recentConvIds = featured.convs.slice(0, UNANSWERED_PAIRS.length).map(c => c.id as string)
  const unansweredRows: (typeof schema.messages.$inferInsert)[] = []
  UNANSWERED_PAIRS.forEach((pair, i) => {
    const askedAt = randDate(weekStart, now)
    unansweredRows.push({ id: randomUUID(), conversationId: recentConvIds[i], role: 'user', content: pair.q, createdAt: askedAt })
    unansweredRows.push({ id: randomUUID(), conversationId: recentConvIds[i], role: 'assistant', content: pair.a, flaggedUnanswered: true, createdAt: new Date(askedAt.getTime() + 4_000) })
  })
  await chunkedInsert(schema.messages, unansweredRows)
  console.log(`  ✓ featured bot: ${docRows.length} knowledge-base docs (ready), ${UNANSWERED_PAIRS.length} unanswered questions, guardrail ON`)

  // 6) Other bots — lighter, current-month data for a believable agency dashboard
  let orgConvMonth = FEATURED.monthConvs
  let orgLeadMonth = FEATURED.monthLeads
  for (const botId of otherBotIds) {
    const nConv = randInt(70, 140)
    const nLead = randInt(7, 16)
    const built = buildConversations(botId, [{ start: monthStart, end: now, n: nConv }])
    await chunkedInsert(schema.conversations, built.convs)
    await chunkedInsert(schema.messages, built.msgs)
    const leadRows = buildLeads(botId, built.convs.map(c => c.id as string), nLead, 0)
    await chunkedInsert(schema.leads, leadRows)
    orgConvMonth += nConv
    orgLeadMonth += nLead
  }

  // 7) Sync org monthly counters with what we seeded
  await db.update(schema.organizations)
    .set({ conversationsThisMonth: orgConvMonth, leadsThisMonth: orgLeadMonth })
    .where(eq(schema.organizations.id, orgId))

  console.log('\n✅ Demo seed complete.\n')
  console.log('  Developer (admin.octively.com):')
  console.log(`     ${DEV.email}  /  ${DEV.password}`)
  console.log('  Client (app.octively.com):')
  console.log(`     ${CLIENT.email}  /  ${CLIENT.password}`)
  console.log(`\n  Portal (featured "${FEATURED.name}") should read ≈ ${FEATURED.monthConvs} / ${FEATURED.monthLeads} / ${FEATURED.weekConvs}.`)
  console.log(`  Agency dashboard: ${1 + OTHER_BOTS.length} bots, ${orgConvMonth} conversations & ${orgLeadMonth} leads this month.\n`)
  process.exit(0)
}

main().catch((err) => {
  console.error('✖ Seed failed:', err)
  process.exit(1)
})
