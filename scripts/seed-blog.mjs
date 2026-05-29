// Seed the 3 starter blog articles into Sanity.
//
// Usage (from project root):
//   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx \
//   NEXT_PUBLIC_SANITY_DATASET=production \
//   SANITY_API_WRITE_TOKEN=sk... \
//   node scripts/seed-blog.mjs
//
// Re-running is safe — documents use fixed _ids and are created-or-replaced.

import { createClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN. See .env.example.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false })

const POSTS = [
  {
    _id: 'post-stammer-ai-alternative',
    slug: 'stammer-ai-alternative',
    title: 'Looking for a Stammer.ai alternative? An honest comparison',
    description:
      'Stammer.ai is a solid agency chatbot platform, but it is not cheap. Here is a fair look at where it shines, where it does not, and when Octively is the better fit.',
    keyword: 'stammer.ai alternative',
    publishedAt: '2026-05-29T09:00:00.000Z',
    readingMinutes: 6,
    body: `Stammer.ai built a real product, and a lot of agencies run on it happily. So this is not a hit piece. If you are searching for an alternative, you usually have one of two reasons: the price stopped making sense, or you are paying for voice and channels you never switched on. Both are fair.

Here is how I would actually think about the decision.

## What Stammer.ai is good at

Stammer is built for agencies that want chat and voice agents under their own brand, with sub-accounts for each client. The white-label is genuine, the dashboard is polished, and the voice side is a real selling point if your clients want phone agents. If you are running a voice-first AI agency, that is hard to ignore.

The catch is that all of this sits behind an agency plan that starts around $197 a month, and the value only lands once you have a handful of paying clients to spread that cost across.

## Where it stops making sense

If you are a freelancer with two clients, or an agency just adding chatbots to an existing service, $197 a month before your first invoice is a lot of pressure. You end up signing clients to justify the tool instead of buying the tool to serve clients you already have.

Voice is the other thing. Plenty of agencies pay for the voice capability and never deploy a single phone agent. You are funding a feature set you do not use.

## Where Octively fits instead

Octively is narrower on purpose. It does white-label chat with a client portal, and it does that part cheaply. You build a bot in a visual dashboard, drop one script tag on the client's site, and give the client a login where they can read conversations and pull leads themselves.

The price is the main difference. There is a free plan to start, and paid plans begin at ₨2,500 a month in Pakistan, or $15 internationally. The Agency plan covers unlimited client portals at ₨20,000 (about $79). That is well under the $197 floor, which changes the math when you are small.

## A quick comparison

| | Octively | Stammer.ai |
|---|---|---|
| Starting paid plan | ₨2,500 / $15 per month | ~$197 per month |
| Free plan | Yes | Trial only |
| Client portal | Built in | Included |
| Voice agents | No | Yes |
| Best for | Freelancers and small agencies doing chat | Agencies that want chat and voice |

## So which should you pick?

If you need voice agents, or you are already at the scale where $197 is a rounding error, Stammer is a reasonable home and switching for the sake of it is not worth your weekend.

If you are doing website chatbots for SMB clients, you do not need voice, and you want each client to log in and see their own results without you re-explaining it every week, Octively will cost you a fraction of that and do the job you actually hired it for.

The honest version: pick the cheapest tool that covers what you sell. For most freelancers and small chat-focused agencies, that is not the $197 plan.`,
  },
  {
    _id: 'post-affordable-white-label-chatbot',
    slug: 'affordable-white-label-chatbot',
    title: 'What does a white-label AI chatbot actually cost in 2026?',
    description:
      'A plain breakdown of white-label AI chatbot pricing in 2026, the hidden per-seat and per-message costs, and how to keep margin when you resell to clients.',
    keyword: 'affordable white label chatbot',
    publishedAt: '2026-05-29T09:30:00.000Z',
    readingMinutes: 7,
    body: `Most "white-label chatbot pricing" pages bury the number you actually want. So let me put it up front: the well-known agency platforms start somewhere between $197 and $360 a month. Stammer.ai is around $197, ConvoCore around $220, ChatLab around $360. Those are entry prices, before you add clients or usage.

That range is fine if you are already running a busy agency. It is rough if you are not. Here is what to watch for so you do not overpay.

## The sticker price is not the real price

Two things tend to inflate the monthly cost after you sign up.

**Per-seat fees.** Some platforms charge per client sub-account or per extra seat. Onboard ten clients and the "from $X" plan quietly doubles. When you compare tools, find the price at ten clients, not at one.

**Per-message or per-credit usage.** AI responses cost money to generate, and most platforms pass that through as message credits or usage fees. That is normal. What matters is whether the included allowance covers a real client's traffic, and how steep the overage is. A cheap base plan with brutal overage is not actually cheap.

## What "affordable" should mean for a reseller

You are reselling, so the only number that matters is margin. If you charge a client ₨15,000 (or $99) a month for a managed chatbot, your platform cost needs to leave room under that. A $197 base plan eats most of a single small retainer. A ₨2,500 plan does not.

The other half of margin is predictability. Flat plans with no per-seat fee mean your cost barely moves as you add clients, so you can quote a client without recalculating your own bill every time.

## Where Octively lands

Octively is built around that reseller math. There is a free plan, paid plans start at ₨2,500 a month in Pakistan or $15 internationally, and the Agency plan covers unlimited client portals at ₨20,000 (about $79). Plans include a credit allowance for AI usage, with top-up packs if a client's bot gets busy.

It is not trying to be the platform with the most features. It is trying to be the one that still leaves you a margin when you charge a small business a sensible monthly fee.

## A simple way to choose

Work it backwards from what you can charge:

1. Decide your client price. For a managed SMB chatbot with a portal, ₨10,000 to ₨20,000 (or $79 to $149) is realistic.
2. Subtract a comfortable platform cost. Aim to keep the tool under a quarter of what you charge.
3. Check the price at the number of clients you actually expect, including any per-seat or usage fees.

Run that through the $197 plans and you need several clients before it breathes. Run it through a ₨2,500 plan and the first client is already profitable. For most people reading a page titled "affordable white-label chatbot," that is the whole point.`,
  },
  {
    _id: 'post-ai-chatbot-for-freelancers',
    slug: 'ai-chatbot-for-freelancers',
    title: 'How to add an AI chatbot to client projects as a freelancer',
    description:
      'A practical guide for freelancers on adding an AI chatbot to client websites, giving the client their own portal, and turning a one-off build into a monthly retainer.',
    keyword: 'AI chatbot for freelancers',
    publishedAt: '2026-05-29T10:00:00.000Z',
    readingMinutes: 6,
    body: `If you build websites for clients, an AI chatbot is one of the easier upsells you can make right now. The client gets something that captures leads around the clock, and you get a reason to bill monthly instead of once. The trick is setting it up so it runs without you babysitting it.

Here is how I would approach it.

## Why bother

A static site sits there. A chatbot answers the questions your client's customers actually ask at 11pm, books a few calls, and quietly collects email addresses. For a small business that is real value, and it is value they can see, which makes the monthly fee easy to defend.

The mistake freelancers make is treating the bot as a one-time deliverable. You build it, hand it over, and never charge again. The better move is to keep ownership of the dashboard and bill a retainer for it.

## The setup, start to finish

It does not take a developer, despite how it sounds.

1. Create the bot in a dashboard and give it your client's content to learn from. No code here.
2. Add one script tag to the client's site. On WordPress, Webflow, Shopify, or plain HTML, this is a copy-paste into the footer or a custom-code box. Guides and short videos cover each platform.
3. Invite the client to their own portal. They set a password and can then read conversations and export leads on their own.

That third step is the one that saves you. Once the client can see results themselves, the weekly "what did the bot do this week" email stops.

## How to price it

Two clean models work.

**Setup plus retainer.** Charge a one-time fee to build and train the bot, then a monthly fee to host, monitor, and keep it current. The monthly fee is where the real money is over a year.

**Retainer only.** Skip the setup fee to lower the barrier, and fold it into a slightly higher monthly. Good for landing the first few clients.

Either way, your platform cost needs to stay small so the retainer is mostly margin. Octively has a free plan to start, and paid plans from ₨2,500 a month in Pakistan or $15 internationally, which leaves plenty of room under a normal retainer.

## What to actually charge the client

For a small business, a managed chatbot with a portal lands comfortably at ₨10,000 to ₨20,000 a month, or $79 to $149 internationally. That is a small number for a business owner who is getting leads out of it, and a meaningful one for you across a handful of clients.

The whole thing works because the cost to you is low, the value to the client is visible, and the client can watch it working without calling you. Build it once, set up the portal, and let it earn.`,
  },
]

async function run() {
  for (const p of POSTS) {
    const doc = {
      _id: p._id,
      _type: 'post',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      description: p.description,
      keyword: p.keyword,
      publishedAt: p.publishedAt,
      readingMinutes: p.readingMinutes,
      body: p.body,
    }
    await client.createOrReplace(doc)
    console.log(`✓ seeded: ${p.slug}`)
  }
  console.log(`\nDone. ${POSTS.length} posts in dataset "${dataset}".`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
