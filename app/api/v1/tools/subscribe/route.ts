import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { brevo, BREVO_SENDER } from '@/lib/email/clients'

const schema = z.object({
  email: z.string().email(),
  source: z.string().max(80),
})

// Acceptable tool sources for validation — prevents abuse from arbitrary sources.
const ALLOWED_SOURCES = new Set([
  'chatbot-pricing-calculator',
  'chatbot-roi-calculator',
  'agency-retainer-calculator',
  'ai-services-directory',
  'ai-chatbot-name-generator',
  'chatbot-welcome-message-generator',
  'chatbot-faq-generator',
  'website-chatbot-readiness-checker',
])

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON', code: 'bad_request', status: 400 }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message, code: 'validation_error', status: 400 }, { status: 400 })
  }

  const { email, source } = parsed.data
  if (!ALLOWED_SOURCES.has(source)) {
    return NextResponse.json({ error: 'Unknown source', code: 'bad_request', status: 400 }, { status: 400 })
  }

  try {
    // Add to Brevo contact list (idempotent via updateEnabled).
    await brevo.contacts.createContact({
      email,
      attributes: { TOOL_SOURCE: source },
      listIds: [Number(process.env.BREVO_TOOLS_LIST_ID ?? '2')],
      updateEnabled: true,
    })

    await brevo.transactionalEmails.sendTransacEmail({
      sender: BREVO_SENDER,
      to: [{ email }],
      subject: 'The Octively freelancer AI playbook',
      htmlContent: `
        <p>Thanks for using the calculator.</p>
        <p>Here is a quick guide on how to price and sell AI chatbot retainers to clients you already work with:</p>
        <p><strong>Starting price:</strong> ₨10,000–₨20,000/month per client in Pakistan ($40–$80 internationally).</p>
        <p><strong>What to tell the client:</strong> "I will add an AI chatbot to your site that captures leads and answers customer questions. You get your own dashboard to track it. No extra work on your end."</p>
        <p><strong>What you need:</strong> Sign up free at <a href="https://admin.octively.com/dashboard/signup">admin.octively.com</a>, create the bot, paste one script tag on their site, and invite them to their portal. Setup takes under an hour.</p>
        <p>Reply to this email if you have questions. We are happy to help.</p>
        <p>Owais<br>Octively</p>
      `,
    })
  } catch (err) {
    console.error('[tools/subscribe] Brevo error:', err)
    // Do not expose Brevo errors to the client — still return success if the
    // contact was likely created (Brevo SDK throws on network, not on duplicate).
    return NextResponse.json({ error: 'Email service error', code: 'internal', status: 500 }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
