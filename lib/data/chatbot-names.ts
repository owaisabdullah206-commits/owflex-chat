// Static bank for the free Chatbot Name Generator tool.
// The generator reads from this list and filters by vibe + industry, then
// shuffles a fresh selection on each click. No LLM call needed, so it costs
// nothing to run. The optional "Generate with AI" button is the only path
// that hits the model.

export type NameVibe = 'friendly' | 'professional' | 'playful' | 'techy'

export type NameIndustry =
  | 'general'
  | 'ecommerce'
  | 'healthcare'
  | 'realestate'
  | 'finance'
  | 'education'
  | 'saas'
  | 'agency'
  | 'food'
  | 'travel'

export interface ChatbotName {
  name: string
  vibes: NameVibe[]
  industries: NameIndustry[]
}

export const VIBE_LABELS: Record<NameVibe, string> = {
  friendly: 'Friendly',
  professional: 'Professional',
  playful: 'Playful',
  techy: 'Tech / modern',
}

export const INDUSTRY_LABELS: Record<NameIndustry, string> = {
  general: 'General / any',
  ecommerce: 'E-commerce',
  healthcare: 'Healthcare',
  realestate: 'Real estate',
  finance: 'Finance',
  education: 'Education',
  saas: 'SaaS / software',
  agency: 'Agency / services',
  food: 'Food / restaurant',
  travel: 'Travel / hospitality',
}

// ~120 names, each tagged so the picker can filter by vibe and industry.
export const CHATBOT_NAMES: ChatbotName[] = [
  // Friendly, general
  { name: 'Buddy', vibes: ['friendly', 'playful'], industries: ['general'] },
  { name: 'Sunny', vibes: ['friendly', 'playful'], industries: ['general'] },
  { name: 'Pip', vibes: ['friendly', 'playful'], industries: ['general'] },
  { name: 'Joy', vibes: ['friendly'], industries: ['general'] },
  { name: 'Leo', vibes: ['friendly'], industries: ['general'] },
  { name: 'Chip', vibes: ['friendly', 'playful'], industries: ['general', 'saas'] },
  { name: 'Ace', vibes: ['friendly', 'professional'], industries: ['general'] },
  { name: 'Milo', vibes: ['friendly'], industries: ['general'] },
  { name: 'Nova', vibes: ['friendly', 'techy'], industries: ['general', 'saas'] },
  { name: 'Remi', vibes: ['friendly'], industries: ['general'] },
  { name: 'Coco', vibes: ['friendly', 'playful'], industries: ['general', 'food'] },
  { name: 'Wink', vibes: ['friendly', 'playful'], industries: ['general'] },

  // Professional, trustworthy
  { name: 'Sage', vibes: ['professional'], industries: ['general', 'finance', 'healthcare'] },
  { name: 'Clarke', vibes: ['professional'], industries: ['general', 'finance', 'agency'] },
  { name: 'Verity', vibes: ['professional'], industries: ['finance', 'healthcare'] },
  { name: 'Advisor', vibes: ['professional'], industries: ['finance', 'agency'] },
  { name: 'Counsel', vibes: ['professional'], industries: ['finance', 'agency'] },
  { name: 'Navigator', vibes: ['professional'], industries: ['general', 'agency'] },
  { name: 'Steward', vibes: ['professional'], industries: ['finance', 'realestate'] },
  { name: 'Mentor', vibes: ['professional'], industries: ['education', 'agency'] },
  { name: 'Atlas', vibes: ['professional', 'techy'], industries: ['general', 'saas'] },
  { name: 'Prime', vibes: ['professional', 'techy'], industries: ['saas', 'finance'] },
  { name: 'Sterling', vibes: ['professional'], industries: ['finance', 'realestate'] },
  { name: 'Guide', vibes: ['professional', 'friendly'], industries: ['general', 'travel'] },

  // Playful, catchy
  { name: 'Spark', vibes: ['playful', 'techy'], industries: ['general', 'saas'] },
  { name: 'Echo', vibes: ['playful', 'techy'], industries: ['general', 'saas'] },
  { name: 'Bolt', vibes: ['playful', 'techy'], industries: ['general', 'ecommerce'] },
  { name: 'Pulse', vibes: ['playful', 'techy'], industries: ['general', 'healthcare'] },
  { name: 'Zip', vibes: ['playful'], industries: ['general', 'ecommerce'] },
  { name: 'Buzz', vibes: ['playful'], industries: ['general', 'ecommerce'] },
  { name: 'Fizz', vibes: ['playful'], industries: ['food', 'ecommerce'] },
  { name: 'Dash', vibes: ['playful', 'techy'], industries: ['general', 'travel'] },
  { name: 'Pop', vibes: ['playful'], industries: ['ecommerce', 'food'] },
  { name: 'Jolt', vibes: ['playful', 'techy'], industries: ['general'] },
  { name: 'Vibe', vibes: ['playful'], industries: ['general', 'ecommerce'] },
  { name: 'Zest', vibes: ['playful'], industries: ['food', 'travel'] },

  // Tech / modern
  { name: 'Ada', vibes: ['techy', 'professional'], industries: ['saas', 'general'] },
  { name: 'Turing', vibes: ['techy'], industries: ['saas'] },
  { name: 'Neural', vibes: ['techy'], industries: ['saas'] },
  { name: 'Pixel', vibes: ['techy', 'playful'], industries: ['saas', 'agency'] },
  { name: 'Byte', vibes: ['techy', 'playful'], industries: ['saas'] },
  { name: 'Logic', vibes: ['techy', 'professional'], industries: ['saas'] },
  { name: 'Query', vibes: ['techy'], industries: ['saas'] },
  { name: 'Nexus', vibes: ['techy', 'professional'], industries: ['saas', 'general'] },
  { name: 'Cortex', vibes: ['techy'], industries: ['saas'] },
  { name: 'Lumen', vibes: ['techy', 'professional'], industries: ['saas', 'general'] },
  { name: 'Orbit', vibes: ['techy', 'friendly'], industries: ['saas', 'general'] },
  { name: 'Quill', vibes: ['techy', 'professional'], industries: ['saas', 'education'] },

  // E-commerce and retail
  { name: 'Cart Companion', vibes: ['friendly'], industries: ['ecommerce'] },
  { name: 'Deal Finder', vibes: ['friendly', 'professional'], industries: ['ecommerce'] },
  { name: 'ShopBot', vibes: ['professional'], industries: ['ecommerce'] },
  { name: 'Style Scout', vibes: ['playful', 'friendly'], industries: ['ecommerce'] },
  { name: 'Bargain Buddy', vibes: ['playful', 'friendly'], industries: ['ecommerce'] },
  { name: 'SavvyShop', vibes: ['friendly'], industries: ['ecommerce'] },
  { name: 'Wardrobe Wiz', vibes: ['playful'], industries: ['ecommerce'] },
  { name: 'Checkout Helper', vibes: ['professional', 'friendly'], industries: ['ecommerce'] },

  // Healthcare
  { name: 'CareAI', vibes: ['professional', 'friendly'], industries: ['healthcare'] },
  { name: 'HealthPal', vibes: ['friendly'], industries: ['healthcare'] },
  { name: 'Vita', vibes: ['friendly', 'professional'], industries: ['healthcare'] },
  { name: 'NurseBot', vibes: ['professional'], industries: ['healthcare'] },
  { name: 'Wellness Guide', vibes: ['professional', 'friendly'], industries: ['healthcare'] },
  { name: 'Remedy', vibes: ['professional'], industries: ['healthcare'] },
  { name: 'Mira', vibes: ['friendly', 'professional'], industries: ['healthcare', 'general'] },

  // Real estate
  { name: 'HomeScout', vibes: ['friendly', 'professional'], industries: ['realestate'] },
  { name: 'PropertyPal', vibes: ['friendly'], industries: ['realestate'] },
  { name: 'Listing Locator', vibes: ['professional'], industries: ['realestate'] },
  { name: 'HomeGenius', vibes: ['professional', 'techy'], industries: ['realestate'] },
  { name: 'Tour Guide', vibes: ['friendly'], industries: ['realestate', 'travel'] },
  { name: 'KeyBot', vibes: ['professional'], industries: ['realestate'] },

  // Finance and banking
  { name: 'Budget Buddy', vibes: ['friendly', 'playful'], industries: ['finance'] },
  { name: 'FinBot', vibes: ['professional', 'techy'], industries: ['finance'] },
  { name: 'Penny', vibes: ['friendly', 'playful'], industries: ['finance'] },
  { name: 'Money Minder', vibes: ['professional', 'friendly'], industries: ['finance'] },
  { name: 'Capital', vibes: ['professional'], industries: ['finance'] },
  { name: 'WealthWatcher', vibes: ['professional'], industries: ['finance'] },
  { name: 'Ledger', vibes: ['professional', 'techy'], industries: ['finance'] },

  // Education
  { name: 'Tutor', vibes: ['professional', 'friendly'], industries: ['education'] },
  { name: 'Scholar', vibes: ['professional'], industries: ['education'] },
  { name: 'Quizzy', vibes: ['playful', 'friendly'], industries: ['education'] },
  { name: 'LearnBot', vibes: ['friendly'], industries: ['education'] },
  { name: 'Professor Pip', vibes: ['playful', 'friendly'], industries: ['education'] },
  { name: 'Cleo', vibes: ['friendly', 'professional'], industries: ['education', 'general'] },

  // SaaS / software support
  { name: 'Helper', vibes: ['friendly', 'professional'], industries: ['saas'] },
  { name: 'OnboardBot', vibes: ['professional'], industries: ['saas'] },
  { name: 'Assist', vibes: ['professional'], industries: ['saas', 'general'] },
  { name: 'Flow', vibes: ['techy', 'playful'], industries: ['saas'] },
  { name: 'Relay', vibes: ['techy', 'professional'], industries: ['saas'] },
  { name: 'Sync', vibes: ['techy'], industries: ['saas'] },

  // Agency / services
  { name: 'Concierge', vibes: ['professional', 'friendly'], industries: ['agency', 'travel'] },
  { name: 'Liaison', vibes: ['professional'], industries: ['agency'] },
  { name: 'Bridge', vibes: ['professional', 'friendly'], industries: ['agency', 'general'] },
  { name: 'Scout', vibes: ['friendly', 'professional'], industries: ['agency', 'realestate'] },
  { name: 'Hub', vibes: ['techy', 'professional'], industries: ['agency', 'saas'] },

  // Food / restaurant
  { name: 'Chef Bot', vibes: ['friendly', 'playful'], industries: ['food'] },
  { name: 'Order Pal', vibes: ['friendly'], industries: ['food'] },
  { name: 'Tasty', vibes: ['playful', 'friendly'], industries: ['food'] },
  { name: 'Menu Mate', vibes: ['friendly', 'playful'], industries: ['food'] },
  { name: 'Bites', vibes: ['playful'], industries: ['food'] },

  // Travel / hospitality
  { name: 'Voyager', vibes: ['professional', 'friendly'], industries: ['travel'] },
  { name: 'Wander', vibes: ['friendly', 'playful'], industries: ['travel'] },
  { name: 'Compass', vibes: ['professional', 'friendly'], industries: ['travel'] },
  { name: 'Journey', vibes: ['friendly'], industries: ['travel'] },
  { name: 'Roam', vibes: ['playful', 'friendly'], industries: ['travel'] },
  { name: 'Sherpa', vibes: ['professional', 'friendly'], industries: ['travel'] },

  // More general all-rounders to widen any filter result
  { name: 'Iris', vibes: ['friendly', 'professional'], industries: ['general', 'saas'] },
  { name: 'Max', vibes: ['friendly'], industries: ['general'] },
  { name: 'Otto', vibes: ['friendly', 'techy'], industries: ['general', 'saas'] },
  { name: 'Sol', vibes: ['friendly'], industries: ['general'] },
  { name: 'Ember', vibes: ['friendly', 'playful'], industries: ['general'] },
  { name: 'Indie', vibes: ['playful', 'friendly'], industries: ['general', 'agency'] },
  { name: 'Wave', vibes: ['playful', 'techy'], industries: ['general'] },
  { name: 'Beam', vibes: ['techy', 'friendly'], industries: ['general', 'saas'] },
  { name: 'Halo', vibes: ['friendly', 'professional'], industries: ['general', 'healthcare'] },
  { name: 'Pace', vibes: ['professional', 'techy'], industries: ['general', 'saas'] },
  { name: 'Vera', vibes: ['professional', 'friendly'], industries: ['general', 'finance'] },
  { name: 'Felix', vibes: ['friendly', 'playful'], industries: ['general'] },
  { name: 'Juno', vibes: ['friendly', 'professional'], industries: ['general', 'saas'] },
  { name: 'Reese', vibes: ['friendly'], industries: ['general', 'agency'] },
]

/** Returns a shuffled selection of names matching the chosen vibe + industry. */
export function pickNames(
  vibe: NameVibe,
  industry: NameIndustry,
  count = 12,
): string[] {
  const matches = CHATBOT_NAMES.filter(
    (n) =>
      n.vibes.includes(vibe) &&
      (n.industries.includes(industry) || n.industries.includes('general')),
  )
  // Fall back to vibe-only if a narrow industry has too few matches.
  const pool = matches.length >= count ? matches : CHATBOT_NAMES.filter((n) => n.vibes.includes(vibe))
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((n) => n.name)
}
