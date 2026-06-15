// Push new blog DRAFTS into Sanity (free-chatbot keyword cluster, June 2026).
//
// These are pushed as DRAFTS (the `drafts.` _id prefix), so they appear in the
// Sanity Studio under each post's draft state and do NOT go live until you hit
// Publish in the Studio. Re-running is safe (fixed _ids, created-or-replaced).
//
// Usage (from project root):
//   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx \
//   NEXT_PUBLIC_SANITY_DATASET=production \
//   SANITY_API_WRITE_TOKEN=sk... \
//   node scripts/push-blog-drafts.mjs
//
// Keywords targeted (from Google Search Console, 2026-06-14):
//   - "free chatbot for faq"  (was ranking ~73)
//   - "free ai chatbot for website" / "free chatbot" cluster

// WSL hits an IPv6 fetch issue against some APIs; prefer IPv4 to avoid "fetch failed".
import dns from 'node:dns'
dns.setDefaultResultOrder('ipv4first')

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
    id: 'post-free-ai-chatbot-for-website',
    slug: 'free-ai-chatbot-for-website',
    title: 'The best free AI chatbot for a website in 2026 (that is actually free)',
    description:
      'Most "free" AI chatbots in 2026 give you 20 to 50 messages a month, then ask for a card. Here is what is genuinely free, and how to get 200 AI chats a month for ₨0.',
    keyword: 'free ai chatbot for website',
    tags: ['Free chatbot', 'Guides'],
    publishedAt: '2026-06-14T09:00:00.000Z',
    readingMinutes: 6,
    body: `## Most "free" AI chatbots are not really free

Search "free AI chatbot for website" and you get a long list of tools that all say free. Sign up, and the catch shows up. Some give you a 7 day trial, then a bill. Others have a real free plan, but cap it at 20 or 50 messages a month, which is gone by the first busy afternoon.

We checked the popular options in 2026. Here is what their free plans actually hand you.

| Tool | Free plan | Real AI? | The catch |
|------|-----------|----------|-----------|
| Chatbase | 50 messages / month | Yes | Gone fast, then $40/mo |
| Tidio (Lyro) | 50 conversations / month | FAQ only | AI is a paid add-on, then $29/mo |
| Denser.ai | 20 queries / month | Yes | 20 is a demo, not a tool |
| Chatling | 35 messages / month | Yes | Tight cap, then $25/mo |
| Tawk.to | Unlimited chats | No AI | Human live chat, no AI |
| Octively | 200 conversations / month | Yes | Free forever, no card |

Numbers are each provider's published free tier as of June 2026.

The pattern repeats. The tools with real AI cap you hard. The tools with no cap have no AI. For a small site that gets a handful of questions a day, 20 to 50 messages a month runs out in a week, and then you are back on a sales page.

## What free should actually mean

A free chatbot is only worth having if it can do the job for a real site, even a small one. Three things matter.

- Real AI, not a button menu. It should read a question in plain words and answer from your own content.
- A monthly limit you can live on. Enough conversations to cover a quiet month without hitting a wall on day three.
- No credit card to start. If a tool wants a card before you can use it, that is a trial, not a free plan.

## How Octively's free plan works

Octively was built for freelancers and small agencies in Pakistan and beyond, so the free plan is meant to be used, not just sampled. On ₨0, no card, you get:

- 1 bot, 200 conversations a month
- A real AI that answers from your own documents and FAQs, not a script
- Lead capture, up to 15 leads a month
- The embed widget, live with one script tag

That is four to ten times the free allowance of the AI tools in the table, with a knowledge base included. When you outgrow it, Starter is ₨2,500 a month, not $29.

## Set it up in about four minutes

1. Create a free account. No card, no trial timer.
2. Add your content. Upload a PDF or paste your website URL. The bot reads it and learns to answer from it.
3. Drop in the embed script. One small tag on your site.

The bot goes live, answering from your content. If you serve clients, each one can get their own portal to see conversations and leads.

## When free runs out

Free is the right place to start, and the honest way to find out if the bot earns its keep. You will outgrow it once your site gets steady traffic, once you need more than one bot, or once you want to drop the Octively badge and put your own brand on the widget for a client. The paid plans are priced in rupees, through PayFast, for Pakistani budgets.

You do not have to decide any of that today. Start free, watch real conversations come in, and upgrade when the numbers tell you to.`,
    faq: [
      {
        question: 'Is there a truly free AI chatbot for a website?',
        answer:
          'Yes, but most cap you at 20 to 50 messages a month. Octively\'s free plan gives 200 conversations a month with a real knowledge base, no credit card, and no trial timer.',
      },
      {
        question: 'Do I need a credit card to start?',
        answer:
          'No. If a tool asks for a card before you can use it, that is a trial, not a free plan. Octively\'s free plan needs no card.',
      },
      {
        question: 'Can a free chatbot answer from my own content?',
        answer:
          'Yes. Octively\'s free plan includes a knowledge base, so you upload a document or paste your website URL and the bot answers from it.',
      },
      {
        question: 'What happens when I outgrow the free plan?',
        answer:
          'You move to a paid plan only when you need more conversations, more bots, or your own branding. Starter is ₨2,500 a month in Pakistan, or $15 internationally.',
      },
    ],
  },
  {
    id: 'post-free-chatbot-for-faq',
    slug: 'free-chatbot-for-faq',
    title: 'A free chatbot for your FAQs: auto-answer customer questions for ₨0',
    description:
      'Tired of answering the same questions? Here is how to set up a free chatbot that handles your FAQs from your own content, with no credit card and no code.',
    keyword: 'free chatbot for faq',
    tags: ['Free chatbot', 'FAQ', 'Guides'],
    publishedAt: '2026-06-14T09:30:00.000Z',
    readingMinutes: 5,
    body: `## You answer the same five questions every day

Opening hours. Do you ship to my city. How much is it. Do you take PayFast. The messages a small business gets are mostly the same short list, asked again and again, often after hours. A chatbot that handles them buys back your time and answers people while you sleep.

You can do this for free. The catch is that most free FAQ bots are weaker than the word free suggests.

## Two kinds of FAQ bot

There are two ways a bot can handle FAQs, and they are not the same.

Button menus are the old way. You write a question, write the answer, and link them in a tree. The visitor taps through a menu. It works until someone asks in words you did not predict, and then the bot is stuck. Free tools like Tawk.to do this, but it is not really AI.

AI from your content is the better way. You give the bot your FAQ page, a document, or your website, and it answers questions in plain language, even ones worded differently from your FAQ. This is what people mean by an AI chatbot. The snag is that most free AI plans are tiny. Chatbase gives 50 messages a month, Denser 20, Chatling 35. For a bot that is supposed to quietly handle traffic, that is gone quickly.

## What to look for in a free FAQ bot

- It reads your own content, so answers match your business instead of the open web.
- It handles reworded questions, not only exact matches.
- It has a monthly limit you can actually live on, not a 20 message demo.
- It needs no credit card to start.

## Set up a free FAQ bot with Octively

Octively's free plan is built for exactly this job. On ₨0, no card:

1. Create your free account.
2. Feed it your FAQs. Upload your FAQ as a document, paste your website URL, or type entries straight in. The bot reads them and answers from them.
3. Turn on strict mode if you want. It keeps the bot answering only from your content, so it does not improvise.
4. Embed it. One script tag on your site.

You get 200 conversations a month, free, which covers FAQ traffic for most small sites, plus lead capture for the visitors who want to go further.

## Why this beats a plain FAQ page

A static FAQ page makes the visitor scroll and hunt. A chatbot lets them ask in their own words and get the one answer they came for. It also catches the questions your FAQ does not cover yet. Octively lists the questions the bot could not answer, so you get a quiet, honest to-do list for improving your content.

## Start free, upgrade only if you need to

For most small businesses, a free FAQ bot is enough on its own. You only need a paid plan when traffic grows, when you want a second bot, or when you want to remove the branding. Until then, ₨0 covers it.`,
    faq: [
      {
        question: 'Can a free chatbot answer FAQs from my own content?',
        answer:
          'Yes. Octively\'s free plan includes a knowledge base, so you upload your FAQ or paste your website URL and the bot answers from it, even when questions are worded differently.',
      },
      {
        question: 'How many questions can a free FAQ bot handle?',
        answer:
          'It depends on the tool. Many free AI plans cap at 20 to 50 messages a month. Octively\'s free plan gives 200 conversations a month.',
      },
      {
        question: 'Do I need to code anything?',
        answer:
          'No. You add your content, then paste one script tag on your site.',
      },
      {
        question: 'What is strict mode?',
        answer:
          'It keeps the bot answering only from your content, so it does not make up answers outside your FAQs.',
      },
    ],
  },
]

async function run() {
  for (const p of POSTS) {
    const doc = {
      _id: `drafts.${p.id}`, // drafts. prefix => lands as a Studio draft, not live
      _type: 'post',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      description: p.description,
      keyword: p.keyword,
      tags: p.tags ?? [],
      publishedAt: p.publishedAt,
      readingMinutes: p.readingMinutes,
      body: p.body,
      faq: (p.faq ?? []).map((item, i) => ({
        _key: `faq-${i}`,
        _type: 'faqItem',
        question: item.question,
        answer: item.answer,
      })),
    }
    await client.createOrReplace(doc)
    console.log(`✓ draft pushed: ${p.slug}  (_id: drafts.${p.id})`)
  }
  console.log(`\nDone. ${POSTS.length} drafts in Sanity. Open the Studio, review, then Publish.`)
}

run().catch((err) => {
  console.error('Failed to push drafts:', err.message || err)
  process.exit(1)
})
