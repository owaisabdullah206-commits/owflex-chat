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
    tags: ['Comparison', 'Agency'],
    publishedAt: '2026-05-29T09:00:00.000Z',
    readingMinutes: 6,
    faq: [
      {
        question: 'Is Octively a good Stammer.ai alternative for agencies?',
        answer:
          'Yes, if your agency focuses on website chatbots for SMB clients and does not need voice agents. Octively offers the same white-label client portal concept at a fraction of the cost — paid plans start at ₨2,500/month in Pakistan or $15 internationally, versus Stammer\'s ~$197/month entry price.',
      },
      {
        question: 'Does Octively support voice agents like Stammer.ai?',
        answer:
          'No. Octively is focused entirely on website chat — building bots, deploying them via an embed script, and giving each client a branded portal to view conversations and leads. If voice agents are a core part of your offering, Stammer.ai is the better fit.',
      },
      {
        question: 'How much cheaper is Octively compared to Stammer.ai?',
        answer:
          'Significantly. Stammer\'s agency plan starts around $197/month. Octively\'s Agency plan with unlimited client portals is ₨20,000/month in Pakistan (about $79) or $79 internationally. For a freelancer or small agency, that difference is meaningful from day one.',
      },
      {
        question: 'Can my clients log in to see their own chatbot conversations?',
        answer:
          'Yes. Each client gets their own branded portal login where they can read conversation history, view captured leads, and pull exports — without contacting you. This is a core feature on all Octively plans, not an add-on.',
      },
    ],
    readingMinutes: 5,
    body: `Stammer built a real product and plenty of agencies use it well. This isn't a takedown. If you're already on Stammer and happy, there's probably no reason to switch.

But if you're searching for an alternative, the reason is usually one of two things: the price doesn't make sense at your current scale, or you're paying for voice agents and channel integrations you've never actually used. Both are worth thinking through before you move.

## What Stammer does well

The white-label setup is solid. You get a branded subdomain, your name on the dashboard, and separate sub-accounts for each client. Clients log in and see something that looks like it belongs to your agency, not to a tool you're renting.

Voice is where Stammer has a real advantage over most alternatives. The platform is built for agencies that want to deploy phone agents — bots that answer calls, handle basic questions, and book appointments verbally. If your clients are asking for that, the competition is thin. It's a genuine capability, not a gimmick.

Stammer also supports more channels than most competitors: web chat, voice, and some social integrations. For an agency with a broad AI service catalogue, that breadth matters.

## The price problem

The agency plan starts at around $197 a month. That's the entry point before usage costs.

The issue isn't that $197 is unreasonable for what the platform does. The issue is that it requires several paying clients before the numbers turn positive. A freelancer with two clients charging ₨15,000 each is spending more on the tool than they make from it at the start. You end up adding clients to justify the software rather than buying software to serve clients you already have.

For agencies already running at capacity, $197 is a normal monthly tool cost. For everyone getting started or adding chatbots to an existing service, it's pressure from day one.

## Features you're paying for that you might not need

Most agencies doing website chatbots for small businesses don't need voice agents. A dental practice, a restaurant, a local law firm — they want a chat widget that captures leads overnight and lets staff check them in the morning. Phone agents are useful for specific businesses, but they're not the default ask.

The cost of building and maintaining voice infrastructure is real, and it's part of why Stammer is priced where it is. Same with social channel integrations. Both features are genuinely useful for the right clients. For an agency doing website chat only, you're effectively subsidising features you won't invoice for.

## How the client portals compare

Both platforms include a client-facing portal where each client logs in to see their conversations and leads. This is the part that matters most day-to-day: a way for clients to check their own results without you writing them a weekly summary.

Stammer's portal is polished and functional. Octively's serves the same purpose — each client gets their own branded login, can read their full conversation history, and export leads without contacting you. The difference isn't which portal is better. It's that Octively's entire product is that portal plus a website chatbot, without the voice infrastructure layered on top.

## Setup and day-to-day use

For web chat specifically, setup is similar on both platforms. You configure the bot in a dashboard, add information about the client's business, and get an embed script to paste into the site. On WordPress, Webflow, Shopify, or plain HTML, it's a copy-paste into the footer settings. Under an hour for a typical deployment.

Day-to-day the workflow is straightforward on both. When a client asks how their bot is going, you send them the portal link and let them check for themselves. Neither platform needs much maintenance unless the client's business changes.

## The ongoing cost picture

One thing to check before committing to any platform: what does the bill look like when you have ten clients, not one?

Some platforms charge per client sub-account, meaning the monthly cost scales up as you grow. Octively's Agency plan covers unlimited client portals at a flat rate, so the cost stays constant whether you have three clients or thirty. That predictability is useful when you're quoting retainer prices and don't want to recalculate your own costs every time you sign someone new.

On usage: both platforms charge for AI responses through a credit system. A typical SMB client bot handles around 200-500 conversations a month. Check whether the plan you're considering covers that volume without expensive overages.

## Head-to-head

| | Octively | Stammer.ai |
|---|---|---|
| Starting paid plan | ₨2,500 / $15 per month | ~$197 per month |
| Agency plan (unlimited portals) | ₨20,000 / $79 per month | Higher tiers |
| Free plan | Yes, no expiry | Trial only |
| Client portal | Yes, on all plans | Yes |
| Web chat | Yes | Yes |
| Voice agents | No | Yes |
| Social channels | No | Some |
| Best suited for | Website chat for SMB clients | Chat and voice for larger agencies |

## Which one to pick

Use Stammer if you're selling phone agents or social channel bots, your clients specifically want voice, or you're at a scale where $197 a month is an unremarkable line item.

Use Octively if your work is website chatbots for small businesses, you want a flat cost that doesn't grow as you add clients, you're in Pakistan where the PKR pricing makes a real difference, or you want to start without paying until you have a client to cover the cost.

Both platforms do what they say. The question is whether you need everything on Stammer's menu. For a freelancer or small agency focused on website chat, the answer is usually no — and paying for it anyway is just expensive.`,
  },
  {
    _id: 'post-affordable-white-label-chatbot',
    slug: 'affordable-white-label-chatbot',
    title: 'What does a white-label AI chatbot actually cost in 2026?',
    description:
      'A plain breakdown of white-label AI chatbot pricing in 2026, the hidden per-seat and per-message costs, and how to keep margin when you resell to clients.',
    keyword: 'affordable white label chatbot',
    tags: ['Pricing', 'Agency'],
    publishedAt: '2026-05-29T09:30:00.000Z',
    readingMinutes: 7,
    faq: [
      {
        question: 'What is the cheapest white-label AI chatbot platform for agencies?',
        answer:
          'Octively is one of the most affordable options available. Paid plans start at ₨2,500/month in Pakistan or $15 internationally, with an Agency plan at ₨20,000 ($79) covering unlimited client portals. Most comparable platforms (Stammer, ConvoCore, ChatLab) start at $197–$360/month.',
      },
      {
        question: 'What hidden costs should I watch out for in white-label chatbot platforms?',
        answer:
          'Two are most common: per-seat fees (charged per client sub-account — can double your bill quickly) and per-message or credit-based usage fees (AI responses cost money; check the included allowance and overage rate before signing up). Look for flat plans with predictable pricing.',
      },
      {
        question: 'How do I calculate my margin when reselling an AI chatbot?',
        answer:
          'Start with what you can charge your client (e.g. ₨15,000/$99/month for a managed chatbot with portal). Subtract your platform cost. Aim to keep the tool under 25% of what you charge. With a ₨2,500 base plan, even the first client is profitable. With a $197 plan, you need several clients before the math works.',
      },
      {
        question: 'Is there a free white-label AI chatbot plan?',
        answer:
          'Octively has a free plan that lets you build and deploy one bot. It is a genuine free tier — not a trial with an expiry date — so you can test it with a real client before committing to a paid plan.',
      },
    ],
    readingMinutes: 5,
    body: `The number you actually want is right here: agency-tier white-label chatbot platforms start between $197 and $360 a month. Stammer.ai is around $197. ConvoCore is around $220. ChatLab runs closer to $360. Those are the headline prices before you factor in clients and usage.

That range is manageable if you're already billing several clients. It's a problem if you're not. Here's what to look at before you pick a platform.

## What the main platforms charge

The pricing structures vary more than the headline numbers suggest.

Most platforms at this tier charge a flat monthly fee for the platform, then layer on some combination of client sub-account limits (or per-seat fees), a credit allowance for AI responses, and optional add-ons for extra channels or white-label domains.

Stammer's agency plans start around $197. ConvoCore sits in a similar range with different feature weightings. ChatLab is more of a turnkey solution at the higher price point.

Octively prices differently. A permanent free tier for one bot, paid plans from ₨2,500 a month in Pakistan or $15 internationally, and an Agency plan at ₨20,000 (about $79) for unlimited client portals.

## Per-seat fees: the bill that surprises you

Some platforms advertise a low starting price that only applies to a small number of client sub-accounts. Add more clients and you're on a higher tier, or paying per seat on top.

Before you commit to anything, find out what the plan costs at ten clients. That's a realistic target for a small agency over the first year. If the platform charges $20 per extra client sub-account, ten clients adds $200 to your monthly bill before you've made a single AI request.

Flat-rate plans avoid this entirely. If the cost doesn't move when you add clients, you can quote retainer prices without recalculating your own bill every time.

## How message credits work

AI responses cost money to generate. Every platform covers this through a credit or message allowance included in the plan, with the option to buy more.

The number to check: how many conversations does a typical client have per month? For a small business like a dental practice or a local retailer, 200-400 conversations a month is realistic. Check whether the included allowance on the plan you're considering covers that across all your clients, and what the overage rate is.

A cheap headline plan with steep overage fees can easily end up costing more than a slightly pricier plan with a generous allowance.

## The reseller margin math

You're paying for a platform so you can charge clients more than the platform costs. That's the model. The margin is the business.

Here's how the numbers look in practice. You charge a client ₨15,000 a month ($99) for a managed chatbot with a portal. That's a reasonable retainer for a small business getting a chatbot plus someone monitoring it for them.

On a ₨2,500 plan: your platform cost is about 17% of what you charge. Four clients brings in ₨60,000; the platform costs ₨2,500.

On a $197 plan: at one client paying $99, you're already underwater. At three clients paying $99 each, the platform takes a third of your revenue. You need five or six clients before the margin feels like a real business.

The break-even point matters most when you're starting. A cheaper platform means you can sign one client and profit from month one.

## Comparing the options

| Platform | Starting price | Client portals | Voice | Free tier |
|---|---|---|---|---|
| Octively | ₨2,500 / $15/mo | Yes, all plans | No | Yes, permanent |
| Stammer.ai | ~$197/mo | Yes | Yes | Trial only |
| ConvoCore | ~$220/mo | Yes | Yes | Trial only |
| ChatLab | ~$360/mo | Yes | Limited | No |

## What the free tiers actually mean

Several platforms call something a free tier that's really a time-limited trial. Useful for testing the product before you buy, but you'll need to move to a paid plan before you have any real clients.

Octively's free tier is permanent: one bot, limited to a set number of conversations per month. You can deploy a real bot for a real client and stay on the free tier until that client is paying you enough to justify upgrading. That's a meaningful difference if you're starting without upfront capital.

## How to pick

Work backwards from what you can charge:

1. Decide your client price. For a managed chatbot with a portal, ₨10,000 to ₨20,000 a month or $79 to $149 internationally is realistic for small businesses.
2. Look at the platform cost at your expected client count, including per-seat fees and typical usage.
3. Keep the tool under 25% of what you charge.

Run those numbers through a $197 plan and you need four or five clients before the margin is comfortable. Through a ₨2,500 plan, the first client is already profitable.

For an agency already billing ten or twenty clients, the higher-priced platforms may be worth it for the extra features. For everyone else, the math points the other way.`,
  },
  {
    _id: 'post-ai-chatbot-for-freelancers',
    slug: 'ai-chatbot-for-freelancers',
    title: 'How to add an AI chatbot to client projects as a freelancer',
    description:
      'A practical guide for freelancers on adding an AI chatbot to client websites, giving the client their own portal, and turning a one-off build into a monthly retainer.',
    keyword: 'AI chatbot for freelancers',
    tags: ['Freelancers', 'Getting Started'],
    publishedAt: '2026-05-29T10:00:00.000Z',
    readingMinutes: 6,
    faq: [
      {
        question: 'Do I need to know how to code to add an AI chatbot to a client site?',
        answer:
          'No. You build and configure the bot in a visual dashboard — no code required. The only technical step is adding a single script tag to the client\'s website, and guides cover that for WordPress, Webflow, Shopify, Wix, and plain HTML. Most freelancers complete a full setup in under an hour.',
      },
      {
        question: 'How do I add an AI chatbot to a WordPress or Webflow site?',
        answer:
          'After building the bot in Octively\'s dashboard, you get a one-line embed script. On WordPress, paste it into the footer area via your theme settings or a header/footer plugin. On Webflow, drop it into the Site Settings → Custom Code → Footer Code section. The bot appears on the site immediately.',
      },
      {
        question: 'How much should I charge clients for an AI chatbot service?',
        answer:
          'For a managed chatbot with a branded client portal, ₨10,000 to ₨20,000 per month in Pakistan or $79 to $149 internationally is a realistic range for SMB clients. The key is keeping your platform cost low (Octively starts at ₨2,500/$15) so the retainer is mostly margin.',
      },
      {
        question: 'How do clients view their chatbot conversations and leads?',
        answer:
          'Each client gets their own branded portal login. They can read every conversation, see captured leads, and export the data — without calling you. You set up the portal once when you onboard the client; after that they are self-service.',
      },
    ],
    readingMinutes: 6,
    body: `If you build websites, you already have the hard part covered. You have clients, they trust you with their online presence, and you're the person they call when something needs fixing. Adding a chatbot to that relationship takes two to three hours and turns a one-off project into a monthly payment.

The setup isn't the hard part. The tricky bit is structuring it so the client sees value on their own and you're not writing weekly "here's what the bot did" summaries.

## Why clients pay for this

A static website waits for someone to fill in a contact form. A chatbot responds.

For a small business, the practical benefit is capture. Someone visits the site at 10pm with a question, the bot answers it, and the client has a lead in the morning instead of a missed inquiry. For a dentist, that might be "are you taking new patients?" For a restaurant, it's "do you have a table on Saturday?" For a real estate agent, it's someone asking about a specific listing.

Clients don't pay for chatbots because they understand AI. They pay because they're losing enquiries to competitors whose websites actually respond.

The mistake freelancers make is treating the bot as a one-time deliverable. You build it, hand it over, and stop charging. The better approach is to retain ownership of the dashboard and bill monthly for keeping it running and accurate.

## What you're actually building

A chatbot on Octively has three parts: the bot itself, the embed on the client's site, and the portal where the client checks their results. The full setup takes under two hours for a typical client site.

### Step 1: Create and configure the bot

You set up the bot in a dashboard. Give it a name, write a short description of the client's business, and add the information it should know: services, prices, hours, location, and the ten or fifteen questions customers ask most often.

No code involved. The bot works from what you give it. A few paragraphs about the business plus common Q&A pairs gets you to a working bot. You refine it over the first few weeks as you see what people actually ask.

### Step 2: Add it to the site

Once the bot is configured, you get a one-line embed script. That script goes into the site's footer.

On WordPress, that's a footer code field in your theme settings or a free plugin like Insert Headers and Footers. On Webflow, it's Site Settings, Custom Code, Footer Code section. On Shopify, it goes into the theme's footer template. On Squarespace, there's an embed block. On plain HTML, paste it before the closing body tag.

The bot appears on the site immediately. No deployment pipeline, no caching to clear.

### Step 3: Set up the client portal

The last step is creating a client account and inviting them to their own portal. They get a link, set a password, and from that point on they can see their full conversation history and lead list without contacting you.

This step saves more time than any other. Once the client has their own login, the "how's the bot doing?" question becomes one reply: "here's your portal link." After that, they check themselves.

## Keeping the bot useful over time

Bots drift. A client updates their prices. They add a new service. They move location. Every couple of months, it's worth spending twenty minutes going through recent conversations to see what the bot handles well and where it's getting stuck or giving outdated answers.

That review is also the easiest thing to build into a retainer. You're not just charging for the tool to stay running. You're charging for someone to actually watch it and keep it accurate. Most small business owners can't do that themselves and don't want to learn.

## How to price the service

Two structures work well.

The first is a setup fee plus a monthly retainer. You charge a one-time amount (₨15,000-₨25,000 or around $100-$200) to build and configure the bot, then a monthly fee for hosting, monitoring, and keeping it current. The monthly fee is where most of the money comes from over a year.

The second is a retainer only, with a higher monthly rate that folds in the setup work. This is easier to sell to a hesitant client because it sounds like a smaller commitment, even if the total cost over six months is similar.

Either way, your platform cost needs to stay well below what you charge. On a ₨2,500 plan, even a single client at ₨10,000 a month leaves solid margin.

## What to actually charge

For a managed chatbot with a client portal, ₨10,000 to ₨20,000 a month is a realistic retainer in Pakistan. Internationally, $79 to $149 covers similar ground.

The client isn't paying for the bot alone. They're paying for someone who configured it correctly, keeps it accurate, and is reachable if something goes wrong. That's the service. The chatbot is what delivers it.

Five clients at ₨15,000 each is ₨75,000 a month from a service that takes maybe two to three hours total to maintain once it's running. That math is why freelancers who figure this out tend to keep doing it.

## Finding the first client

The first one doesn't require any pitching. You probably have a client right now whose website has a contact form and nothing else. A bakery, a physio, a tutoring centre, a local estate agent. Someone whose business would genuinely benefit from answering questions at 2am.

Build it for them on the free plan. Show them the portal after a week. Charge a monthly fee once they've seen a few real conversations come through.

The second and third clients come from the first. Small business owners talk to each other. When a client mentions their website started generating enquiries overnight, someone nearby will ask who set it up.`,
  },
  {
    _id: 'post-how-to-embed-ai-chatbot',
    slug: 'how-to-embed-ai-chatbot-on-website',
    title: 'How to embed an AI chatbot on any website (WordPress, Webflow, Shopify)',
    description:
      'A step-by-step guide to adding an AI chatbot to a client website using a single embed script — covers WordPress, Webflow, Shopify, Squarespace, Wix, and plain HTML.',
    keyword: 'how to embed AI chatbot on website',
    tags: ['Getting Started', 'Guide'],
    publishedAt: '2026-05-30T09:00:00.000Z',
    readingMinutes: 6,
    faq: [
      {
        question: 'Do I need to edit code to add a chatbot to my website?',
        answer:
          'No. Adding a chatbot is a copy-paste operation. You get a one-line script from the chatbot platform and paste it into your site\'s footer settings. Every major website builder has a field for this. On WordPress it\'s in your theme settings or a plugin; on Webflow it\'s in Site Settings; on Shopify it\'s in the theme editor.',
      },
      {
        question: 'Will the chatbot work immediately after I add the embed script?',
        answer:
          'Yes. Once the script is in the footer, the chatbot widget appears on all pages of the site immediately. There\'s no deployment step or cache to clear. You can test it by visiting any page on the site.',
      },
      {
        question: 'Can I add the chatbot to only specific pages?',
        answer:
          'Yes, though it requires slightly different steps depending on the platform. On WordPress, plugins like Code Snippets let you add scripts conditionally. On Webflow, you can add the script to individual page settings rather than site-wide. The default (site-wide footer) is simpler and works well for most small business sites.',
      },
      {
        question: 'What if the chatbot widget overlaps with other elements on the site?',
        answer:
          'The widget sits in the corner of the screen and is designed not to interfere with other content. If there\'s a conflict with a floating button or live chat widget on the same site, you can adjust the widget\'s position in the chatbot platform\'s settings.',
      },
    ],
    body: `Adding an AI chatbot to a website is a copy-paste job, not a development project. You get a script from the chatbot platform and put it in the site's footer. The chatbot appears on all pages immediately. The whole thing takes about five minutes once you know where the footer code field is on whichever platform you're working with.

This guide covers the most common ones.

## What you're adding and where it goes

Every website builder has a field for custom scripts in the footer. The chatbot embed is a single line of JavaScript that goes there. Once it's in, the chatbot widget loads on every page of the site without any further changes.

You build and configure the chatbot separately, in the Octively dashboard. That part doesn't involve touching the client's site at all. The embed is just the step that connects the bot you built to the site where it needs to appear.

## WordPress

WordPress has a few ways to add footer scripts, depending on how the site is built.

### Through your theme settings

Most modern themes (Divi, Astra, GeneratePress, and others) have a field for footer code in their customisation options. In the WordPress admin, go to Appearance, then Customise, and look for a section called Additional CSS or Scripts, or check the theme's own settings panel. Paste the embed script there and save.

### Using a plugin

If the theme doesn't have a footer code field, the Insert Headers and Footers plugin (by WPCode) is the easiest option. Install it, go to Settings, then Insert Headers and Footers, and paste the script in the Footer Scripts field. It applies to the whole site immediately.

### For WooCommerce stores

The same methods work. The chatbot will appear on product pages, the cart, and checkout unless you restrict it using conditional logic. For most small stores, site-wide is fine.

## Webflow

In your Webflow project, go to the Project Settings tab (the gear icon), then the Custom Code section. You'll see a Footer Code field. Paste the embed script there, save, and publish the site. The chatbot appears on all published pages.

If you want the chatbot on only specific pages, open the page settings for that page (the gear icon next to its name in the Pages panel) and paste the script in the Before tag field at the bottom of the page.

## Shopify

In your Shopify admin, go to Online Store, then Themes. Click the three dots next to your active theme and choose Edit Code. In the Layout folder, open theme.liquid. Find the closing </body> tag near the bottom of the file and paste the embed script on the line just before it. Save the file.

The chatbot will appear on every page of the store, including the product pages, cart, and checkout.

## Squarespace

In your Squarespace dashboard, go to Settings, then Advanced, then Code Injection. Paste the embed script in the Footer field and save. The chatbot appears on all pages.

Note: Code injection is only available on Business plans and above in Squarespace.

## Wix

In your Wix editor, go to Settings (the gear icon in the left sidebar), then Custom Code. Click Add Custom Code, paste the script, give it a name, and set it to load in the Body — End. Choose to apply it to All Pages and save. Publish the site.

## Plain HTML

Open the HTML file you want to add the chatbot to. Find the closing </body> tag at the bottom and paste the embed script on the line just before it. Save and upload the file. For sites with multiple pages, you'll need to add the script to each one, or to a shared footer template if the site uses one.

## Testing it

Once the script is in place, visit any page on the site. The chatbot widget should appear in the corner within a few seconds. Click it to make sure it opens and responds correctly.

If the widget doesn't appear, check that the script was saved in the right place and that any caching plugins or CDN settings aren't serving a cached version of the page without the new script. Clearing the site cache usually fixes it.

## What to do after the embed is live

The embed is the last technical step. After this, the chatbot configuration is all handled in the Octively dashboard: updating what the bot knows, reviewing conversations, adjusting its responses. None of that touches the client's site.

The next step is setting up the client's portal so they can log in and see their conversations themselves. That's done entirely in the Octively dashboard and takes about two minutes.`,
  },
  {
    _id: 'post-client-chatbot-portal',
    slug: 'give-clients-their-own-chatbot-portal',
    title: 'How to give each client their own AI chatbot dashboard',
    description:
      'A guide to setting up separate branded portals for each client so they can view their chatbot conversations and leads without calling you — and why this is the feature that makes a chatbot retainer actually sustainable.',
    keyword: 'AI chatbot platform where clients can login',
    tags: ['Agency', 'Client Portal'],
    publishedAt: '2026-05-30T09:30:00.000Z',
    readingMinutes: 5,
    faq: [
      {
        question: 'Can each of my clients have their own separate chatbot login?',
        answer:
          'Yes. Octively gives each client their own branded portal login — separate from your dashboard and from each other\'s. Each client sees only their own conversations and leads. You can invite them with a single email from the dashboard.',
      },
      {
        question: 'Can clients edit the chatbot from their portal?',
        answer:
          'No. The client portal is read-only: they can view conversations, see captured leads, and export data. Only you (the agency or freelancer) can edit the bot\'s configuration in the main dashboard. This keeps the setup clean and prevents clients from accidentally breaking the bot.',
      },
      {
        question: 'What do clients see in their portal?',
        answer:
          'Clients see their full conversation history — every message their customers sent and every reply from the bot. They also see a leads section with any contact information captured during conversations, which they can export to a CSV.',
      },
      {
        question: 'Is the client portal branded with my agency name or Octively?',
        answer:
          'The portal is branded with your configuration, not Octively\'s name. Clients see the bot name and branding you set up, not the underlying platform. This is standard on all paid plans.',
      },
    ],
    body: `The reason most AI chatbot services fail as a freelance or agency offering isn't the bot. It's the reporting.

You deploy the bot. It works. The client asks how it's going. You check the dashboard, write a summary, attach a screenshot, and send an email. Next week they ask again. You do it again. After a few months, the retainer barely covers the admin time it takes to explain the results.

The fix is simple: give the client their own login.

## What a client portal actually is

A client portal is a separate login that gives your client a view into their own chatbot's data — and only their data. They can see every conversation their customers have had with the bot, see which ones captured a lead or contact detail, and export the list whenever they want.

They can't see your other clients. They can't change the bot's configuration. They just see their results.

When a client asks "how is the bot doing?" the answer is "check your portal." You send them the link once. After that, the question stops coming.

## Why this changes the economics of a chatbot retainer

Without a portal, you're the human interface between the chatbot and the client. That's management overhead on every client, forever. With a portal, clients are self-service. The retainer becomes about keeping the bot accurate and handling anything unusual — not about answering the same status question repeatedly.

This is the difference between a service that scales and one that doesn't. At two clients it's manageable. At ten, reporting manually is a part-time job.

## How to set up a client portal in Octively

Setting up a client portal takes about two minutes per client.

### Step 1: Create the client account

In your Octively dashboard, go to the Clients section and invite a new client. Enter their name, email address, and which bot they should have access to. They receive an email with a link to set their password.

### Step 2: The client sets their password

The client clicks the link, sets a password, and they're in. No app to download, no complicated setup. The portal works in a browser.

### Step 3: Show them around once

On a quick call or in a short video, walk the client through what they can see: the conversation list, the leads section, and the export button. Most clients don't need much more than this. Once they know where to look, they check it themselves.

## What clients actually do with the portal

Most clients check it a few times a week when they first get access. They're looking at the conversations, reading what customers have asked, and checking whether the bot answered correctly.

After a month or two, the checking becomes less frequent — not because they stopped caring, but because things are running as expected. They know where to look when something comes up. That's a healthy client relationship.

The export feature gets used when the client wants to follow up with leads. They download a CSV with whatever contact information the bot collected and take it from there. No asking you to pull a report.

## The difference between "client portal" and "shared access"

Some platforms handle client visibility by giving clients access to the main agency dashboard with restricted permissions. This works but isn't ideal: the client sees your platform interface, your other clients' bots in a list, and has to navigate around things they don't need.

Octively's approach is a separate portal with a different interface designed for the end client. They see their bot's data presented simply, not a modified version of your admin dashboard. For non-technical clients — which describes most small business owners — that difference matters.

## Building it into how you sell the service

The portal isn't just a feature you configure after setup. It's a selling point.

When you're pitching a chatbot service to a client, one of the first questions is "how do I know if it's working?" The answer used to be "I'll send you a report every month." The better answer is "you'll have your own dashboard to check whenever you want."

That's a more confident pitch and it's a real differentiator. Most agencies offering chatbot services don't give clients their own view of the data. When you do, it's easy for the client to see the value on their own — without you having to make the case repeatedly.`,
  },
  {
    _id: 'post-chatbot-lead-generation',
    slug: 'ai-chatbot-for-lead-generation',
    title: 'Using an AI chatbot for lead generation on a small business website',
    description:
      'How a chatbot captures leads from website visitors that would otherwise leave without making contact — and how to set one up that actually works for an SMB client.',
    keyword: 'AI chatbot lead generation',
    tags: ['Getting Started', 'Lead Generation'],
    publishedAt: '2026-05-30T10:00:00.000Z',
    readingMinutes: 6,
    faq: [
      {
        question: 'How does a chatbot capture leads from website visitors?',
        answer:
          'When a visitor asks a question, the bot can respond and then ask for their name and contact details before continuing. This works particularly well at natural handoff points — when the visitor asks about pricing, availability, or booking. The captured information goes into a leads list that the client can view and export from their portal.',
      },
      {
        question: 'Is a chatbot better than a contact form for capturing leads?',
        answer:
          'For most small businesses, yes. Contact forms require a visitor to decide on their own to fill something in. A chatbot engages visitors at the moment they have a question, which is when they\'re most likely to share their contact details. The conversational format also feels lower-friction than a form, especially on mobile.',
      },
      {
        question: 'What information can the chatbot collect from visitors?',
        answer:
          'The bot can collect whatever you configure it to ask for: name, email, phone number, the nature of their enquiry, their preferred contact time, or any other field that makes sense for the client\'s business. The collected data appears in the client\'s lead list.',
      },
      {
        question: 'How quickly can I set up a lead-capturing chatbot for a client?',
        answer:
          'Under two hours for a typical small business site. You configure the bot in the Octively dashboard (no code), add a one-line embed script to the site\'s footer, and set up the client portal. The bot starts capturing leads immediately.',
      },
    ],
    body: `Most small business websites have the same problem: people visit, look around, don't find exactly what they need, and leave. The contact form is there, but filling it in requires a decision. Most visitors don't make that decision. They go back to Google and try the next result.

A chatbot changes that interaction. Instead of waiting for a visitor to decide to reach out, it meets them mid-visit and answers whatever brought them to the site. And it can ask for their contact details at the moment they're most engaged — right after it's been useful.

## Why the timing matters

The contact form problem is a timing problem. A visitor who just read three pages of a plumber's website and still isn't sure whether they serve their area isn't going to fill in a form to find out. They'll just leave.

That same visitor, asked by a chatbot "are you looking for someone in [area]?" and told yes, we cover that area — is very likely to give their name and phone number when the bot follows up with "want us to call you back to discuss the job?"

The difference is where in the visit the ask happens. Forms ask at the end, after a visitor has already decided whether they're interested. Chatbots ask in the middle of the conversation, when they're still engaged.

## What a lead capture flow actually looks like

A simple lead capture flow for a small business might look like this:

1. Visitor asks: "Do you do commercial cleaning?"
2. Bot replies: "Yes, we handle offices, retail spaces, and restaurants. What type of premises are you looking to have cleaned?"
3. Visitor: "An office, about 20 people."
4. Bot: "Got it. Would you like a quote? If you leave your name and email, someone can get back to you with pricing within 24 hours."
5. Visitor leaves their details.

That exchange took 30 seconds and produced a qualified lead. The same visitor on a static site either finds a contact form and decides not to fill it in, or leaves. The chatbot changed the outcome.

## What to configure for it to work

A lead capturing chatbot needs two things to work well: enough information to be genuinely useful, and a natural moment to ask for contact details.

### Giving the bot enough information

The bot needs to know what the business does, where they operate, what their services cost (or at least a range), and the answers to the questions customers ask most often. You get this from the client in a 20-minute conversation, or by reading through their existing website content.

The more the bot can actually answer, the more trust it builds before it asks for anything. A bot that says "I don't know, please contact us" on the second message is worse than no bot.

### Configuring the lead capture

In the Octively dashboard, you set which fields to collect (name, email, phone, or custom fields) and the messages the bot uses to ask. You also set when in the conversation the bot should offer to connect the visitor with someone — typically after it's answered a question, not at the start before it's provided any value.

A common mistake is configuring the bot to ask for an email address as the first thing it does. Visitors haven't received anything from the bot yet. There's no reason to give their details. The capture works best when it comes after the bot has been useful.

## What clients see in their portal

Every conversation the bot has appears in the client's portal. Leads — conversations where contact details were captured — appear in a separate leads section, which the client can export to a CSV whenever they want.

This is what makes the service easy to demonstrate. After the first week, you send the client to their portal and they see a list of people who visited their site, had a conversation, and left their details. Most clients who see that list understand the value immediately.

## How this compares to other options

### Versus a contact form

Contact forms capture leads who were already committed to reaching out. Chatbots capture leads who weren't. The populations overlap but the chatbot catches a larger and less self-selected group.

### Versus live chat

Live chat requires someone to be available to respond. Most small businesses can't staff that. A chatbot handles conversations at any hour, which means leads at 11pm and on weekends — times when nobody is watching the chat window.

### Versus a pop-up

Pop-ups interrupt the visit with an offer before the visitor has had a chance to decide whether they're interested. Chatbots respond to the visitor's own behaviour. The lead quality tends to be better.

## Setting realistic expectations with clients

A chatbot isn't going to double a business's revenue in the first month. For a typical small business site, you'd expect somewhere between ten and fifty leads a month from a well-configured bot on a site with decent traffic.

The clearer value is consistency: leads come in even when the owner is busy, closed, or asleep. They have a record of what each person asked, not just a phone number. And they have a portal to check it themselves, which means they're not dependent on you to tell them whether it's working.

That combination — consistent capture, transparent reporting, low maintenance — is what makes the service worth paying for monthly.`,
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
    console.log(`✓ seeded: ${p.slug}`)
  }
  console.log(`\nDone. ${POSTS.length} posts in dataset "${dataset}".`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
