// Static bank for the free Chatbot Welcome Message Generator.
// Each template is tagged by tone + goal. The picker filters, substitutes the
// {{business}} token, and shuffles a fresh set on each click. No LLM call, so
// it is free to run. The optional "Generate with AI" button is the only path
// that hits the model.

export type MsgTone = 'friendly' | 'professional' | 'playful'
export type MsgGoal = 'support' | 'leads' | 'sales' | 'bookings'

export interface WelcomeTemplate {
  text: string
  tones: MsgTone[]
  goals: MsgGoal[]
}

export const TONE_LABELS: Record<MsgTone, string> = {
  friendly: 'Friendly',
  professional: 'Professional',
  playful: 'Playful',
}

export const GOAL_LABELS: Record<MsgGoal, string> = {
  support: 'Answer support questions',
  leads: 'Capture leads',
  sales: 'Help people buy',
  bookings: 'Book appointments',
}

export const BUSINESS_TOKEN = '{{business}}'

// Templates use {{business}} where the brand name goes. The picker swaps it for
// the user's input, or "us" when left blank.
export const WELCOME_TEMPLATES: WelcomeTemplate[] = [
  // Friendly + support
  { text: `Hi there! Welcome to ${BUSINESS_TOKEN}. What can I help you with today?`, tones: ['friendly'], goals: ['support'] },
  { text: `Hey! I'm the ${BUSINESS_TOKEN} assistant. Ask me anything and I'll point you in the right direction.`, tones: ['friendly'], goals: ['support'] },
  { text: `Welcome! Got a question about ${BUSINESS_TOKEN}? I'm here to help, day or night.`, tones: ['friendly'], goals: ['support'] },
  { text: `Hi! Need a hand? I can answer most questions about ${BUSINESS_TOKEN} in a few seconds.`, tones: ['friendly'], goals: ['support'] },
  { text: `Hello and welcome to ${BUSINESS_TOKEN}. Tell me what you're looking for and I'll sort it out.`, tones: ['friendly'], goals: ['support'] },
  { text: `Hey there! Stuck on something? Ask away and I'll do my best to help.`, tones: ['friendly'], goals: ['support'] },
  { text: `Hi! Thanks for stopping by ${BUSINESS_TOKEN}. How can I make your day easier?`, tones: ['friendly'], goals: ['support'] },

  // Friendly + leads
  { text: `Hi! Welcome to ${BUSINESS_TOKEN}. Want me to show you what we do? Just leave your name to get started.`, tones: ['friendly'], goals: ['leads'] },
  { text: `Hey there! Looking for ${BUSINESS_TOKEN}? Tell me a bit about what you need and I'll help you out.`, tones: ['friendly'], goals: ['leads'] },
  { text: `Welcome! I'd love to help you find the right fit. What brings you to ${BUSINESS_TOKEN} today?`, tones: ['friendly'], goals: ['leads'] },
  { text: `Hi! Happy to help. Drop your email and I'll send you the details you're after.`, tones: ['friendly'], goals: ['leads'] },
  { text: `Hey! Quick question so I can help better: what are you hoping ${BUSINESS_TOKEN} can do for you?`, tones: ['friendly'], goals: ['leads'] },
  { text: `Hello! Want a quote or more info? Leave your name and I'll get you sorted.`, tones: ['friendly'], goals: ['leads'] },

  // Friendly + sales
  { text: `Hi! Looking for something specific at ${BUSINESS_TOKEN}? Tell me what you need and I'll find it.`, tones: ['friendly'], goals: ['sales'] },
  { text: `Hey there! Not sure which option is right for you? I can help you choose in a minute.`, tones: ['friendly'], goals: ['sales'] },
  { text: `Welcome! Ask me about products, prices, or what's popular right now at ${BUSINESS_TOKEN}.`, tones: ['friendly'], goals: ['sales'] },
  { text: `Hi! Want a quick recommendation? Tell me what you're after and I'll suggest the best fit.`, tones: ['friendly'], goals: ['sales'] },
  { text: `Hey! Got questions before you buy? I'm here to help you decide.`, tones: ['friendly'], goals: ['sales'] },

  // Friendly + bookings
  { text: `Hi! Want to book a time with ${BUSINESS_TOKEN}? I can set that up for you right here.`, tones: ['friendly'], goals: ['bookings'] },
  { text: `Hey there! Ready to schedule? Tell me a day that works and I'll check availability.`, tones: ['friendly'], goals: ['bookings'] },
  { text: `Welcome! Looking to book an appointment? I'll get you a slot in just a moment.`, tones: ['friendly'], goals: ['bookings'] },
  { text: `Hi! Need an appointment with ${BUSINESS_TOKEN}? Let's find a time that suits you.`, tones: ['friendly'], goals: ['bookings'] },

  // Professional + support
  { text: `Welcome to ${BUSINESS_TOKEN}. I'm here to help. What question can I answer for you?`, tones: ['professional'], goals: ['support'] },
  { text: `Hello. I'm the ${BUSINESS_TOKEN} assistant. I can help with common questions and guide you to the right place.`, tones: ['professional'], goals: ['support'] },
  { text: `Welcome. How can I assist you today? I can answer questions about our services and account help.`, tones: ['professional'], goals: ['support'] },
  { text: `Hello and welcome to ${BUSINESS_TOKEN}. Let me know what you need and I'll help you find it.`, tones: ['professional'], goals: ['support'] },
  { text: `Hi. I'm here to help with any questions about ${BUSINESS_TOKEN}. What would you like to know?`, tones: ['professional'], goals: ['support'] },
  { text: `Welcome. I can answer most questions instantly. If I cannot, I'll connect you with the team.`, tones: ['professional'], goals: ['support'] },
  { text: `Good day. How may I help you with ${BUSINESS_TOKEN} today?`, tones: ['professional'], goals: ['support'] },

  // Professional + leads
  { text: `Welcome to ${BUSINESS_TOKEN}. To help you faster, may I ask what you're looking for today?`, tones: ['professional'], goals: ['leads'] },
  { text: `Hello. I can share details about our services. Leave your name and email and I'll follow up with the right information.`, tones: ['professional'], goals: ['leads'] },
  { text: `Welcome. Would you like a quote or more information? Tell me a little about your needs.`, tones: ['professional'], goals: ['leads'] },
  { text: `Hi. I'd be glad to help. What is the main thing you'd like ${BUSINESS_TOKEN} to solve for you?`, tones: ['professional'], goals: ['leads'] },
  { text: `Hello and welcome. Share your contact details and I'll make sure the right person reaches out.`, tones: ['professional'], goals: ['leads'] },
  { text: `Welcome to ${BUSINESS_TOKEN}. Let's find the right solution for you. What are you working on?`, tones: ['professional'], goals: ['leads'] },

  // Professional + sales
  { text: `Welcome to ${BUSINESS_TOKEN}. I can help you compare options and find the best fit. Where shall we start?`, tones: ['professional'], goals: ['sales'] },
  { text: `Hello. Looking for pricing or product details? I can walk you through it.`, tones: ['professional'], goals: ['sales'] },
  { text: `Welcome. Tell me your requirements and I'll recommend the right option from ${BUSINESS_TOKEN}.`, tones: ['professional'], goals: ['sales'] },
  { text: `Hi. I can answer questions about features, pricing, and delivery. What would help most?`, tones: ['professional'], goals: ['sales'] },
  { text: `Welcome. Ready to make a decision? I'll give you the details you need to choose with confidence.`, tones: ['professional'], goals: ['sales'] },

  // Professional + bookings
  { text: `Welcome to ${BUSINESS_TOKEN}. Would you like to schedule an appointment? I can check available times now.`, tones: ['professional'], goals: ['bookings'] },
  { text: `Hello. I can help you book a session with ${BUSINESS_TOKEN}. What date works for you?`, tones: ['professional'], goals: ['bookings'] },
  { text: `Welcome. To book your appointment, let me know your preferred day and time.`, tones: ['professional'], goals: ['bookings'] },
  { text: `Hi. I can arrange a consultation for you. Shall we find a time that fits your schedule?`, tones: ['professional'], goals: ['bookings'] },

  // Playful + support
  { text: `Hey hey! Welcome to ${BUSINESS_TOKEN}. What can I help you crack today?`, tones: ['playful'], goals: ['support'] },
  { text: `Well hello there! Got a question? Throw it my way and I'll catch it.`, tones: ['playful'], goals: ['support'] },
  { text: `Hi! I'm the ${BUSINESS_TOKEN} helper bot. Ask me anything, I don't take breaks.`, tones: ['playful'], goals: ['support'] },
  { text: `Knock knock! It's your friendly ${BUSINESS_TOKEN} assistant. How can I help?`, tones: ['playful'], goals: ['support'] },
  { text: `Hey! Lost? Curious? Bored? Either way, ask me something about ${BUSINESS_TOKEN}.`, tones: ['playful'], goals: ['support'] },

  // Playful + leads
  { text: `Hey there! Want the good stuff from ${BUSINESS_TOKEN}? Drop your name and let's chat.`, tones: ['playful'], goals: ['leads'] },
  { text: `Hi! Tell me what you're after and I'll work some magic. Deal?`, tones: ['playful'], goals: ['leads'] },
  { text: `Psst. Looking for ${BUSINESS_TOKEN}? You found us. What can we get rolling for you?`, tones: ['playful'], goals: ['leads'] },
  { text: `Hey! Leave your email and I'll send the details before you can say chatbot.`, tones: ['playful'], goals: ['leads'] },

  // Playful + sales
  { text: `Hey! Can't decide? That's my favorite kind of problem. Tell me what you like.`, tones: ['playful'], goals: ['sales'] },
  { text: `Hi there! Want a hot tip on what's popular at ${BUSINESS_TOKEN} right now?`, tones: ['playful'], goals: ['sales'] },
  { text: `Welcome! Shopping around? Let me be your guide and save you the scrolling.`, tones: ['playful'], goals: ['sales'] },
  { text: `Hey! Ask me anything before you buy. I promise I won't oversell you.`, tones: ['playful'], goals: ['sales'] },

  // Playful + bookings
  { text: `Hey! Want to grab a spot with ${BUSINESS_TOKEN}? Let's get you on the calendar.`, tones: ['playful'], goals: ['bookings'] },
  { text: `Hi! Booking time? Pick a day and I'll do the boring scheduling part for you.`, tones: ['playful'], goals: ['bookings'] },
  { text: `Welcome! Ready to lock in a time? I've got the calendar right here.`, tones: ['playful'], goals: ['bookings'] },
]

function applyToken(text: string, business: string): string {
  const name = business.trim() || 'us'
  return text.split(BUSINESS_TOKEN).join(name)
}

/** Returns a shuffled set of welcome messages matching tone + goal, with the business name filled in. */
export function pickWelcomeMessages(
  tone: MsgTone,
  goal: MsgGoal,
  business: string,
  count = 6,
): string[] {
  const matches = WELCOME_TEMPLATES.filter((t) => t.tones.includes(tone) && t.goals.includes(goal))
  const pool = matches.length > 0 ? matches : WELCOME_TEMPLATES.filter((t) => t.tones.includes(tone))
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((t) => applyToken(t.text, business))
}
