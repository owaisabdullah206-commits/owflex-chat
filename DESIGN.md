---
version: 1.0
name: OwFlex
description: >
  A tri-surface design system for three subdomains with distinct personalities.
  owflex.com is a warm editorial marketing canvas (Intercom-inspired) built on
  soft cream with Sky-Teal as the single chromatic accent. admin.owflex.com is a
  near-black technical dashboard (Linear-inspired) built for developers who live
  in the tool daily. app.owflex.com is a clean white client portal
  (Supabase-inspired) built for non-technical Pakistani SMB owners who check
  leads and conversations weekly. All three surfaces share the same Sky-Teal
  accent (#0EA5E9), Inter typeface, and token naming conventions — but differ
  entirely in canvas, density, and emotional tone.

surfaces:
  marketing: "owflex.com — warm cream editorial, Intercom-inspired, LIGHT ONLY"
  dashboard: "admin.owflex.com — near-black technical, Linear-inspired, DARK DEFAULT + light toggle"
  portal: "app.owflex.com — clean white friendly, Supabase-inspired, LIGHT DEFAULT + dark toggle"

theme-modes:
  owflex.com:
    default: light
    dark-mode: "NOT supported — cream canvas is the brand signal, dark inverts it"
    rationale: >
      Intercom ships marketing light-only. The warm cream (#F5F1EC) is the brand
      identity — a dark version would be a different product entirely. Adding dark
      mode to a marketing site gives zero conversion benefit and doubles CSS work.

  admin.owflex.com:
    default: dark
    toggle: true
    respects-system: true
    rationale: >
      Developers use dashboards for hours daily. System dark/light preference
      must be respected. Dark is the default because it reduces eye strain and
      feels native to technical tools (VS Code, Linear, Supabase dashboard).
      Light mode for users who prefer bright environments.

  app.owflex.com:
    default: light
    toggle: true
    respects-system: true
    rationale: >
      SMB owners use the portal on phones. Android system dark mode adoption
      in Pakistan is growing. Respecting system preference feels polished and
      trustworthy. Light is default because it reads as "professional" for
      a business reporting tool. Dark mode is secondary but supported.

colors:

  # ── SHARED BRAND TOKENS (all three surfaces) ──────────────────────────────
  # The single chromatic accent across the entire system.
  # Sky-Teal — not AI-purple, not generic blue.
  primary:          "#0EA5E9"   # Sky 500 — primary CTA, focus rings, links
  primary-hover:    "#0284C7"   # Sky 600 — hover state
  primary-deep:     "#0369A1"   # Sky 700 — pressed state
  primary-soft:     "#E0F2FE"   # Sky 50  — soft backgrounds, active nav
  primary-text-dark: "#38BDF8"  # Sky 400 — primary text on dark surfaces
  primary-text-light: "#0284C7" # Sky 600 — primary text on light surfaces

  # Semantic — shared across all surfaces
  success:          "#10B981"   # Emerald 500
  success-soft:     "#ECFDF5"   # Emerald 50
  success-dark:     "#34D399"   # Emerald 400 (on dark surfaces)
  warning:          "#F59E0B"   # Amber 500
  warning-soft:     "#FFFBEB"   # Amber 50
  warning-dark:     "#FCD34D"   # Amber 300 (on dark surfaces)
  error:            "#EF4444"   # Red 500
  error-soft:       "#FEF2F2"   # Red 50
  error-dark:       "#F87171"   # Red 400 (on dark surfaces)
  credit:           "#10B981"   # Emerald — credit/money displays only
  credit-dark:      "#34D399"   # Emerald 400 on dark

  # ── MARKETING SURFACE (owflex.com) ────────────────────────────────────────
  # Intercom-inspired. Warm cream canvas. White floating cards.
  # Charcoal type. Sky-Teal replaces Fin Orange as the single accent.
  mkt-canvas:       "#F5F1EC"   # Warm cream — the brand's anchor surface
  mkt-surface-1:    "#FFFFFF"   # Pure white — floating cards
  mkt-surface-2:    "#EBE7E1"   # Slightly darker cream — tinted cards
  mkt-ink:          "#111111"   # Charcoal — all headlines and body
  mkt-ink-muted:    "#626260"   # Secondary type — meta, deselected tabs
  mkt-ink-subtle:   "#7B7B78"   # Tertiary type — footer, helper text
  mkt-ink-tertiary: "#9C9FA5"   # Quaternary — disabled, footnotes
  mkt-hairline:     "#D3CEC6"   # 1px borders on cards
  mkt-hairline-soft: "#EBE7E1"  # Softer dividers — FAQ rows, footer
  mkt-inverse:      "#000000"   # True black — testimonial strip only

  # ── DASHBOARD SURFACE (admin.owflex.com) ──────────────────────────────────
  # Linear-inspired. Near-black canvas. Four-step surface ladder.
  # Light gray type. Sky-Teal replaces Linear lavender as the accent.
  adm-canvas:       "#0C0A09"   # Near-black with warm undertone (not #010102)
  adm-surface-1:    "#171512"   # One step above canvas — cards, sidebar
  adm-surface-2:    "#211E1A"   # Two steps — featured cards, hover states
  adm-surface-3:    "#2A2622"   # Three steps — dropdowns, sub-nav
  adm-surface-4:    "#332E29"   # Four steps — deepest raised surface
  adm-ink:          "#F5F0EB"   # Primary text — warm light gray
  adm-ink-muted:    "#A09890"   # Secondary — muted labels
  adm-ink-subtle:   "#6B6560"   # Tertiary — footer, disabled
  adm-ink-tertiary: "#4A4540"   # Quaternary — very faint hints
  adm-hairline:     "#2A2622"   # Default 1px border
  adm-hairline-md:  "#3D3830"   # Stronger border — emphasis, inputs
  adm-hairline-strong: "#524B42" # Strongest border — focus adjacent

  # ── PORTAL SURFACE (app.owflex.com) ───────────────────────────────────────
  # Supabase-inspired. White canvas. Near-black type.
  # Sky-Teal replaces Supabase emerald as the single accent.
  prt-canvas:       "#FAFAFA"   # Off-white — not pure white, avoids harshness
  prt-canvas-soft:  "#F4F4F5"   # Slightly tinted — alternating sections
  prt-surface:      "#FFFFFF"   # Pure white — cards
  prt-ink:          "#171717"   # Near-black — all body and headlines
  prt-ink-secondary: "#212121"  # Slightly cooler near-black — emphasis
  prt-ink-muted:    "#52525B"   # Secondary type — meta, helper text
  prt-ink-subtle:   "#71717A"   # Tertiary — captions, footnotes
  prt-ink-faint:    "#A1A1AA"   # Disabled / placeholder
  prt-hairline:     "#E4E4E7"   # 1px borders on cards
  prt-hairline-strong: "#D4D4D8" # Stronger 1px — input borders, emphasis

  # ── DASHBOARD LIGHT MODE (admin.owflex.com — .light class) ───────────────
  # Active when developer toggles light mode or system prefers light.
  # Technical and dense — same density as dark mode.
  # Supabase dashboard light is the reference. Still tool-first, not friendly.
  # JetBrains Mono rule still applies in light mode.
  adm-light-canvas:         "#FAFAFA"   # Off-white page background
  adm-light-surface:        "#FFFFFF"   # Cards
  adm-light-surface-raised: "#F4F4F5"   # Hover, nested content
  adm-light-surface-high:   "#EEEEEE"   # Deepest raised (dropdowns)
  adm-light-ink:            "#171717"   # Near-black primary type
  adm-light-ink-muted:      "#52525B"   # Secondary labels
  adm-light-ink-subtle:     "#71717A"   # Tertiary — table headers, disabled
  adm-light-hairline:       "#E4E4E7"   # Default 1px border
  adm-light-hairline-md:    "#D4D4D8"   # Input borders, emphasis
  adm-light-sidebar:        "#F4F4F5"   # Sidebar bg in light mode (tinted)

  # ── PORTAL DARK MODE (app.owflex.com — .dark class) ──────────────────────
  # Active when SMB client's device is in system dark mode OR manual toggle.
  # Warmer and softer dark than the dashboard — less technical, more app-like.
  # WhatsApp/Instagram dark mode is the emotional reference, not Linear.
  # NO JetBrains Mono rule still applies. Inter Bold for all numbers.
  prt-dark-canvas:          "#0F0F0F"   # Near-black, neutral warm undertone
  prt-dark-surface:         "#1A1A1A"   # Cards
  prt-dark-surface-raised:  "#242424"   # Hover, nested
  prt-dark-ink:             "#F5F5F5"   # Near-white primary type
  prt-dark-ink-muted:       "#A1A1AA"   # Secondary labels
  prt-dark-ink-subtle:      "#71717A"   # Tertiary — captions, disabled
  prt-dark-ink-faint:       "#52525B"   # Placeholder text
  prt-dark-hairline:        "#2A2A2A"   # Default 1px border
  prt-dark-hairline-strong: "#3A3A3A"   # Input borders

typography:

  # All three surfaces use Inter.
  # Dashboard uses JetBrains Mono for all metrics, keys, and code.
  # Portal uses Inter Bold instead of mono (friendlier for SMB owners).
  # Marketing uses Inter at weight 500 for display with negative tracking.

  # ── SHARED DISPLAY SCALE ─────────────────────────────────────────────────
  display-xl:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 64px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -2.0px
    usage: "Marketing hero headlines only"

  display-lg:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: -1.4px
    usage: "Marketing section opener headlines"

  display-md:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: -0.8px
    usage: "Marketing sub-section, pricing tier titles"

  headline:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: -0.5px
    usage: "Marketing card titles, CTA banners"

  # ── SHARED UI SCALE ──────────────────────────────────────────────────────
  heading-lg:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.3px
    usage: "Dashboard page titles, portal section headers"

  heading-md:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.2px
    usage: "Card titles across all surfaces"

  heading-sm:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0
    usage: "Section subtitles, table group headers"

  body-lg:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: -0.1px
    usage: "Marketing hero subheads, lead paragraphs"

  body:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
    usage: "Default body — portal and dashboard"

  body-sm:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
    usage: "Table body, sidebar nav, secondary copy"

  caption:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
    usage: "Timestamps, footnotes, meta labels"

  label:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.5px
    usage: "Table headers (uppercase), section eyebrows (sentence case)"

  button:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: 0
    usage: "All button labels across all surfaces"

  # ── MONOSPACE (dashboard only) ───────────────────────────────────────────
  metric:
    fontFamily: "'JetBrains Mono', 'Fira Mono', ui-monospace, monospace"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -0.5px
    usage: "Stat card numbers on admin dashboard only"

  metric-sm:
    fontFamily: "'JetBrains Mono', 'Fira Mono', ui-monospace, monospace"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0
    usage: "Smaller metrics, credit balance, token counts"

  code:
    fontFamily: "'JetBrains Mono', 'Fira Mono', ui-monospace, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
    usage: "Embed code blocks, API keys, model names, embed keys"

  # ── PORTAL METRIC (Inter — no mono for SMB clients) ──────────────────────
  portal-metric:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -1.0px
    usage: "Stat card numbers on client portal — larger, friendlier, no mono"

rounded:
  xs:   4px
  sm:   6px    # Buttons on all surfaces — square-ish, technical
  md:   8px    # Inputs, compact cards
  lg:   12px   # Standard cards, pricing cards, feature cards
  xl:   16px   # Product mockup tiles, large containers
  xxl:  24px   # CTA banners (marketing)
  pill: 9999px # Tab toggles, badges, pill tags
  full: 9999px # Avatars

spacing:
  xxs: 2px
  xs:  4px
  sm:  8px
  md:  12px
  lg:  16px
  xl:  24px
  xxl: 32px
  xxxl: 48px
  section: 96px  # Marketing section gaps
  section-sm: 64px # Dashboard / portal section gaps

components:

  # ════════════════════════════════════════════════════════════════════════
  # SURFACE 1: MARKETING (owflex.com)
  # Intercom-inspired. Cream canvas. White floating cards. Charcoal type.
  # Sky-Teal is the ONLY chromatic event. Used on primary CTA and brand mark.
  # ════════════════════════════════════════════════════════════════════════

  mkt-button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 10px 20px
    note: "Sky-Teal CTA — the only filled color button on the marketing site."

  mkt-button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#FFFFFF"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 10px 20px

  mkt-button-secondary:
    backgroundColor: "{colors.mkt-surface-1}"
    textColor: "{colors.mkt-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 10px 20px
    border: "1px solid {colors.mkt-hairline}"
    note: "White button on cream. Used for secondary CTAs."

  mkt-button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.mkt-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 10px 20px
    note: "Plain text button. Nav items, inline CTAs."

  mkt-card-feature:
    backgroundColor: "{colors.mkt-surface-1}"
    textColor: "{colors.mkt-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
    border: "1px solid {colors.mkt-hairline}"
    note: "Standard feature card floating on cream canvas."

  mkt-card-product-mockup:
    backgroundColor: "{colors.mkt-surface-1}"
    textColor: "{colors.mkt-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 24px
    border: "1px solid {colors.mkt-hairline}"
    note: "Product screenshot container. xl radius. Protagonist of each section."

  mkt-card-pricing:
    backgroundColor: "{colors.mkt-surface-1}"
    textColor: "{colors.mkt-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 28px
    border: "1px solid {colors.mkt-hairline}"

  mkt-card-pricing-featured:
    backgroundColor: "{colors.mkt-ink}"
    textColor: "#FFFFFF"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 28px
    note: "Featured plan inverts to charcoal — NOT teal. Charcoal is the power move."

  mkt-card-testimonial:
    backgroundColor: "{colors.mkt-surface-1}"
    textColor: "{colors.mkt-ink}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    padding: 32px
    border: "1px solid {colors.mkt-hairline}"

  mkt-card-tinted:
    backgroundColor: "{colors.mkt-surface-2}"
    textColor: "{colors.mkt-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 32px
    note: "Slightly darker cream — early access callouts, discount banners."

  mkt-cta-banner:
    backgroundColor: "{colors.mkt-surface-1}"
    textColor: "{colors.mkt-ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    padding: 48px
    border: "1px solid {colors.mkt-hairline}"

  mkt-testimonial-strip:
    backgroundColor: "{colors.mkt-inverse}"
    textColor: "#FFFFFF"
    note: "Full-width black strip — the only true-black surface on marketing."

  mkt-pricing-tab-default:
    backgroundColor: "{colors.mkt-canvas}"
    textColor: "{colors.mkt-ink-muted}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 8px 18px

  mkt-pricing-tab-selected:
    backgroundColor: "{colors.mkt-surface-1}"
    textColor: "{colors.mkt-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 8px 18px
    border: "1px solid {colors.mkt-hairline}"

  mkt-input:
    backgroundColor: "{colors.mkt-surface-1}"
    textColor: "{colors.mkt-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 10px 14px
    border: "1px solid {colors.mkt-hairline}"
    note: "Focus: border shifts to {colors.primary}."

  mkt-faq-row:
    backgroundColor: "{colors.mkt-canvas}"
    textColor: "{colors.mkt-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 24px
    border-bottom: "1px solid {colors.mkt-hairline-soft}"

  mkt-top-nav:
    backgroundColor: "{colors.mkt-canvas}"
    textColor: "{colors.mkt-ink}"
    typography: "{typography.body-sm}"
    height: 60px
    note: "Sticky cream bar. Logo left. Nav center. Secondary + Primary CTA right."

  mkt-footer:
    backgroundColor: "{colors.mkt-canvas}"
    textColor: "{colors.mkt-ink-muted}"
    typography: "{typography.caption}"
    padding: 64px 32px
    note: "Dense link grid. OwFlex wordmark left. 4-5 column link groups."

  mkt-customer-logo-tile:
    backgroundColor: "{colors.mkt-canvas}"
    textColor: "{colors.mkt-ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 16px

  # ════════════════════════════════════════════════════════════════════════
  # SURFACE 2: DEVELOPER DASHBOARD (admin.owflex.com)
  # Linear-inspired. Near-black canvas. Four-step surface ladder.
  # JetBrains Mono for all numbers. Sky-Teal as the single accent.
  # ════════════════════════════════════════════════════════════════════════

  adm-button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 7px 14px
    note: "Sky-Teal. Compact — Linear's 7px/14px spec."

  adm-button-secondary:
    backgroundColor: "{colors.adm-surface-2}"
    textColor: "{colors.adm-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 7px 14px
    border: "1px solid {colors.adm-hairline-md}"
    note: "Dark secondary — sidebar actions, export, settings."

  adm-button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.adm-ink-muted}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 7px 10px
    note: "Ghost — sidebar nav items, icon-only actions."

  adm-button-destructive:
    backgroundColor: "transparent"
    textColor: "{colors.error-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 7px 14px
    border: "1px solid rgba(239,68,68,0.3)"
    note: "Delete / revoke. Never red fill on dark — always border only."

  adm-stat-card:
    backgroundColor: "{colors.adm-surface-1}"
    textColor: "{colors.adm-ink}"
    rounded: "{rounded.lg}"
    padding: 18px 20px
    border: "1px solid {colors.adm-hairline}"
    note: >
      Metric in {typography.metric} JetBrains Mono 700 color adm-ink.
      Label above in {typography.label} uppercase adm-ink-subtle.
      Delta below: success-dark for ↑, error-dark for ↓.
      Credit stat: metric color is credit-dark (#34D399).

  adm-card:
    backgroundColor: "{colors.adm-surface-1}"
    textColor: "{colors.adm-ink}"
    rounded: "{rounded.lg}"
    padding: 20px
    border: "1px solid {colors.adm-hairline}"
    note: "General content card. Default surface."

  adm-card-raised:
    backgroundColor: "{colors.adm-surface-2}"
    textColor: "{colors.adm-ink}"
    rounded: "{rounded.lg}"
    padding: 20px
    border: "1px solid {colors.adm-hairline-md}"
    note: "Hover state, featured card, nested content."

  adm-embed-code-block:
    backgroundColor: "{colors.adm-canvas}"
    textColor: "#38BDF8"
    rounded: "{rounded.md}"
    padding: 14px 16px
    border: "1px solid {colors.adm-hairline-md}"
    note: >
      Embed script display. Font: {typography.code}.
      String color: #38BDF8 (Sky 400).
      Copy-to-clipboard button top-right.
      Always renders on adm-canvas — the deepest dark surface.

  adm-table:
    backgroundColor: "{colors.adm-surface-1}"
    textColor: "{colors.adm-ink}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.adm-hairline}"
    note: >
      Row height: 42px.
      Header: {typography.label} uppercase adm-ink-subtle, border-bottom hairline-md.
      Body: {typography.body-sm}.
      Hover row: adm-surface-2 background.
      No zebra striping.

  adm-sidebar:
    backgroundColor: "{colors.adm-surface-1}"
    textColor: "{colors.adm-ink-muted}"
    width: 220px
    border-right: "1px solid {colors.adm-hairline}"
    note: >
      Fixed left. Logo + wordmark top (16px padding).
      Nav items: 34px height, body-sm, ghost style.
      Active: primary-soft bg, primary-text-dark text.
      Section dividers: label style uppercase adm-ink-subtle.
      User row pinned bottom with avatar + name + plan badge.

  adm-top-bar:
    backgroundColor: "{colors.adm-surface-1}"
    textColor: "{colors.adm-ink}"
    height: 52px
    border-bottom: "1px solid {colors.adm-hairline}"
    note: "Page title left. Model badge + primary CTA right."

  adm-input:
    backgroundColor: "{colors.adm-canvas}"
    textColor: "{colors.adm-ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: 7px 11px
    border: "1px solid {colors.adm-hairline-md}"
    note: "Focus: border shifts to primary. Height: 34px."

  adm-pricing-tab-default:
    backgroundColor: "{colors.adm-canvas}"
    textColor: "{colors.adm-ink-subtle}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 6px 14px

  adm-pricing-tab-selected:
    backgroundColor: "{colors.adm-surface-2}"
    textColor: "{colors.adm-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 6px 14px

  # ════════════════════════════════════════════════════════════════════════
  # SURFACE 3: CLIENT PORTAL (app.owflex.com)
  # Supabase-inspired. Off-white canvas. Near-black type.
  # Sky-Teal replaces emerald. Inter Bold for metrics (no mono for SMBs).
  # One primary action per screen. Mobile-first.
  # ════════════════════════════════════════════════════════════════════════

  prt-button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 10px 20px
    note: "Sky-Teal. Minimum 44px height on mobile."

  prt-button-secondary:
    backgroundColor: "{colors.prt-surface}"
    textColor: "{colors.prt-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 10px 20px
    border: "1px solid {colors.prt-hairline-strong}"

  prt-button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.prt-ink-muted}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 10px 14px

  prt-stat-card:
    backgroundColor: "{colors.prt-surface}"
    textColor: "{colors.prt-ink}"
    rounded: "{rounded.lg}"
    padding: 20px 24px
    border: "1px solid {colors.prt-hairline}"
    note: >
      Metric in {typography.portal-metric} Inter 700 — large and readable.
      Label below in {typography.body-sm} prt-ink-muted.
      NO monospace — SMB clients find mono cold and technical.
      Primary stats use primary-text-light color for the number.
      Success stats use success (#10B981) for the number.

  prt-card:
    backgroundColor: "{colors.prt-surface}"
    textColor: "{colors.prt-ink}"
    rounded: "{rounded.lg}"
    padding: 20px 24px
    border: "1px solid {colors.prt-hairline}"
    note: "General content card on off-white canvas."

  prt-card-dark:
    backgroundColor: "#1C1C1C"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: 20px 24px
    note: "Used only for embed code display if shown in portal. Rare."

  prt-table:
    backgroundColor: "{colors.prt-surface}"
    textColor: "{colors.prt-ink}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.prt-hairline}"
    note: >
      Row height: 56px (more generous than dashboard — touch-friendly).
      Header: {typography.label} uppercase prt-ink-subtle.
      Body: {typography.body} — larger than dashboard.
      On mobile: collapses to card-per-row layout (not scrollable table).
      Each row becomes a card: name bold, meta below, action right.

  prt-top-nav:
    backgroundColor: "{colors.prt-surface}"
    textColor: "{colors.prt-ink}"
    height: 56px
    border-bottom: "1px solid {colors.prt-hairline}"
    note: >
      Logo left. Bot name or page title centered.
      Account avatar right — no hamburger menu.
      No sidebar. Top nav only on all breakpoints.

  prt-input:
    backgroundColor: "{colors.prt-surface}"
    textColor: "{colors.prt-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 10px 14px
    border: "1px solid {colors.prt-hairline-strong}"
    note: "Focus: border shifts to primary. Height: 44px (touch target)."

  prt-lead-card:
    backgroundColor: "{colors.prt-surface}"
    textColor: "{colors.prt-ink}"
    rounded: "{rounded.lg}"
    padding: 16px
    border: "1px solid {colors.prt-hairline}"
    note: >
      Used on mobile when table collapses to card list.
      Avatar circle left (32px, primary-soft bg, primary-text-light initials).
      Name + snippet below it.
      Phone + timestamp right-aligned.
      Full-width tap target for mobile.

  prt-empty-state:
    note: >
      Centered in content area.
      Icon: 48px, prt-ink-faint color.
      Heading: {typography.heading-md} prt-ink.
      Subtext: {typography.body} prt-ink-muted. Plain language.
      CTA: {prt-button-primary} below.
      Example: "No customers yet — share your chatbot link to start capturing leads."

  # ════════════════════════════════════════════════════════════════════════
  # SHARED BADGES AND PILLS (all three surfaces)
  # ════════════════════════════════════════════════════════════════════════

  badge-active:
    light: { bg: "{colors.success-soft}", text: "{colors.success}" }
    dark:  { bg: "rgba(16,185,129,0.15)", text: "{colors.success-dark}" }
    rounded: "{rounded.pill}"
    padding: 2px 8px
    typography: "{typography.caption}"

  badge-inactive:
    light: { bg: "{colors.prt-canvas-soft}", text: "{colors.prt-ink-muted}" }
    dark:  { bg: "{colors.adm-surface-3}", text: "{colors.adm-ink-muted}" }
    rounded: "{rounded.pill}"
    padding: 2px 8px
    typography: "{typography.caption}"

  badge-warning:
    light: { bg: "{colors.warning-soft}", text: "{colors.warning}" }
    dark:  { bg: "rgba(245,158,11,0.15)", text: "{colors.warning-dark}" }
    rounded: "{rounded.pill}"
    padding: 2px 8px
    typography: "{typography.caption}"

  badge-error:
    light: { bg: "{colors.error-soft}", text: "{colors.error}" }
    dark:  { bg: "rgba(239,68,68,0.15)", text: "{colors.error-dark}" }
    rounded: "{rounded.pill}"
    padding: 2px 8px
    typography: "{typography.caption}"

  badge-credit:
    light: { bg: "{colors.success-soft}", text: "{colors.success}" }
    dark:  { bg: "rgba(52,211,153,0.15)", text: "{colors.credit-dark}" }
    rounded: "{rounded.pill}"
    padding: 2px 8px
    typography: "{typography.caption}"
    note: "Credits remaining display. Always emerald tone."

  badge-model:
    dark: { bg: "{colors.adm-surface-3}", text: "{colors.adm-ink-muted}" }
    rounded: "{rounded.pill}"
    padding: 2px 8px
    typography: "{typography.code}"
    note: "Model name chip — admin dashboard only. JetBrains Mono."

  badge-plan:
    light: { bg: "{colors.primary-soft}", text: "{colors.primary-text-light}" }
    dark:  { bg: "{colors.primary-soft}", text: "{colors.primary-text-dark}" }
    rounded: "{rounded.pill}"
    padding: 2px 8px
    typography: "{typography.caption}"

  # ════════════════════════════════════════════════════════════════════════
  # TOAST NOTIFICATIONS (all surfaces)
  # ════════════════════════════════════════════════════════════════════════

  toast-success:
    dark:  { bg: "{colors.adm-surface-2}", border: "1px solid {colors.success-dark}" }
    light: { bg: "{colors.prt-surface}", border: "1px solid {colors.success}" }
    textColor-dark: "{colors.adm-ink}"
    textColor-light: "{colors.prt-ink}"
    rounded: "{rounded.md}"
    padding: 12px 16px
    note: "Bottom-right. Auto-dismiss 4s. Check icon in success color."

  toast-error:
    dark:  { bg: "{colors.adm-surface-2}", border: "1px solid {colors.error-dark}" }
    light: { bg: "{colors.prt-surface}", border: "1px solid {colors.error}" }
    rounded: "{rounded.md}"
    padding: 12px 16px
    note: "Does NOT auto-dismiss. X icon in error color."

---

## Surface Guide — Read Before Building Anything

OwFlex has three subdomains. Every component in this system is labeled for
which surface it belongs to. Never mix surface components across subdomains.

---

### Surface 1: Marketing (owflex.com)

**Who sees it:** Anyone discovering OwFlex for the first time.
**Job:** Explain the product, build trust, drive signups.

The marketing canvas is **cream (#F5F1EC)** — warm, editorial, never pure white.
White floating cards lift off it. Charcoal type on cream. Sky-Teal as the only
chromatic event — on the primary CTA and the OwFlex wordmark teal dot. That's it.

Every section leads with a **product screenshot** in a mkt-card-product-mockup
tile. The product is the argument. Marketing chrome stays quiet.

**Emotional tone:** Calm, confident, editorial. Like Intercom's marketing site —
a product-led publication, not a typical SaaS landing page.

**Layout:**
- Max content width: 1240px centered
- Section vertical rhythm: 96px
- Card grids: 3-up desktop → 2-up tablet → 1-up mobile
- Pricing: 4 tiers 4-up → 2-up → 1-up

**Do's:**
- Keep cream as the page background — never replace with white or off-white
- Lift all cards from cream onto white (mkt-surface-1)
- Use Sky-Teal primary CTA once per viewport — never twice
- Lead every section with a product screenshot tile
- Negative track display type: -2.0px at 64px scaling to 0 at body

**Don'ts:**
- No pure white canvas
- No gradients on hero sections
- No teal section backgrounds
- No pill-rounded CTAs
- No more than one primary button per viewport group
- No all-caps (except label token which has its own tracking)

---

### Surface 2: Developer Dashboard (admin.owflex.com)

**Who sees it:** Owais (admin), and freelancers/agencies who pay for OwFlex.
**Job:** Manage bots, view all client leads, handle billing, copy embed codes.

The dashboard canvas is **near-black (#0C0A09)** — warm undertone, not cold blue-black.
Surface ladder carries hierarchy: canvas → surface-1 → surface-2 → surface-3 → surface-4.
No shadows. Depth through surface lift + hairline borders only.

All numbers, metrics, API keys, model names, embed codes: **JetBrains Mono**.
This is non-negotiable. It signals technical precision and makes numbers scannable.

**Emotional tone:** Precise, dense, fast. Like Linear — a tool you respect because
it never wastes your time. Data is the UI.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ Sidebar 220px  │  Top Bar 52px                       │
│ (adm-surface-1)│  (page title + model badge + CTA)  │
│                ├─────────────────────────────────────┤
│  OwFlex logo   │  Content (adm-canvas background)    │
│  ─────────     │                                     │
│  Dashboard     │  Stat cards row (4 cols, gap 10px)  │
│  Bots          │  ──────────────────────────────     │
│  Leads         │  Two-col card row                   │
│  Analytics     │  ──────────────────────────────     │
│  Billing       │  Full-width card (table / code)     │
│  Settings      │                                     │
│                │                                     │
│  [user row]    │                                     │
└──────────────────────────────────────────────────────┘
```

**Do's:**
- JetBrains Mono on all numeric metrics, all embed keys, all model names
- Sidebar nav active state: primary-soft bg + primary-text-dark text
- Stat card deltas: success-dark for ↑, error-dark for ↓
- Table headers: label token (11px, 500, +0.5px tracking, uppercase)
- Embed code block: always on adm-canvas (deepest dark), never on surface-1
- One primary (filled) button per viewport group

**Don'ts:**
- No light mode on admin — dark only
- No shadows — surface lift only
- No teal backgrounds on any card or section
- No warm/orange accents — only Sky-Teal for primary actions
- No all-caps except table header label tokens
- No JetBrains Mono on body copy — mono for metrics/code only

---

### Surface 3: Client Portal (app.owflex.com)

**Who sees it:** The SMB client (restaurant owner, shop manager, clinic admin).
**Job:** Check leads, see conversation history, understand how the chatbot performed.

The portal canvas is **off-white (#FAFAFA)** — near-white, never harsh pure white.
White cards float on it. Near-black type. Sky-Teal for the primary action.
**No monospace** — Inter Bold for all numbers. SMB clients find mono cold.

One primary action per screen. Plain language. Large touch targets.
This must work beautifully on mobile — Pakistani SMB owners use phones.

**Emotional tone:** Trustworthy, clear, welcoming. Like checking WhatsApp Business
stats or a simplified bank dashboard. Never technical. Never overwhelming.

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ Top Nav: [Logo] ─────── [Bot name] ─── [Avatar]       │
├────────────────────────────────────────────────────────┤
│  (prt-canvas #FAFAFA background)                       │
│                                                        │
│  Welcome, Nasir! 👋                                    │
│  Here's how your chatbot performed this month          │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   589    │  │    47    │  │    12    │            │
│  │ Customers│  │  Leads   │  │This week │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Latest customers who left their number           │ │
│  │ [Lead card list]                                 │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

**Do's:**
- Inter Bold (700) for all stat numbers — large, readable, NO mono
- portal-metric token (40px / 700 / -1.0px tracking) for primary stats
- Table rows collapse to card-per-lead on mobile
- 44px minimum touch target on all interactive elements
- Plain language: "Customers who chatted" not "Conversation sessions"
- Empty states with a clear next-action CTA
- Urdu-English mixing is fine in copy ("Aaj ke leads" as subtitle)

**Don'ts:**
- No JetBrains Mono anywhere on the client portal
- No sidebar — top nav only
- No more than 3 stat cards above the fold on mobile
- No technical terms (no "API", no "tokens", no "embeddings")
- No dark mode on client portal — light only
- No more than 2 primary buttons visible at once

---

## Typography — The Critical Rules

### Marketing (owflex.com)
- Display type: Inter 600, aggressive negative tracking (-2.0px at 64px)
- Body: Inter 400, no tracking
- No monospace anywhere on marketing

### Dashboard (admin.owflex.com)
- UI text: Inter 400/500/600
- ALL numbers, metrics, token counts, credit balances, embed keys, model names,
  API keys → JetBrains Mono, always
- Table headers → label token (11px / 500 / +0.5px / uppercase)

### Portal (app.owflex.com)
- All text: Inter
- Stat numbers → portal-metric (40px / 700 / Inter — no mono)
- Table headers → label token (11px / 500 / +0.5px / uppercase)
- Body larger than dashboard (15px vs 13px) — more breathing room

---

## Color Usage Rules

**Sky-Teal (#0EA5E9) goes on:**
- Primary button (all three surfaces — the single unifying element)
- OwFlex wordmark dot / brand mark
- Active sidebar nav item (soft: primary-soft bg)
- Focus rings on inputs
- Primary text metric on portal stat cards
- Links in body copy

**Sky-Teal NEVER goes on:**
- Section backgrounds
- Card backgrounds
- More than one button per viewport group
- Decorative elements or borders

**JetBrains Mono goes on (admin only):**
- Every metric number in stat cards
- Credit balance displays
- Token usage counts
- Embed key / API key display
- Code blocks and embed script snippets
- Model name badges (e.g. "deepseek/v4-flash")

**Emerald (#10B981 / #34D399) goes on:**
- Credit balance display (both surfaces)
- Positive financial delta indicators
- Success badges
- NEVER as primary accent

**Red goes on:**
- Error messages and validation
- Destructive action badges
- Negative delta indicators (e.g. "↓ 3% this month")
- NEVER for warnings (use amber) or information (use teal)

---

## Elevation & Depth

### Dashboard (dark surfaces) — NO shadows
```
adm-canvas (#0C0A09)                    ← page background
  adm-surface-1 (#171512)              ← sidebar, cards
    adm-surface-2 (#211E1A)            ← hover, featured, raised
      adm-surface-3 (#2A2622)          ← dropdowns, nested
        adm-surface-4 (#332E29)        ← deepest raised
```

### Marketing (cream surfaces) — NO shadows
```
mkt-canvas (#F5F1EC)                    ← page background
  mkt-surface-1 (#FFFFFF)              ← floating cards
    mkt-surface-2 (#EBE7E1)            ← tinted feature cards
      mkt-inverse (#000000)            ← testimonial strip only
```

### Portal (light surfaces) — minimal shadows allowed
```
prt-canvas (#FAFAFA)                    ← page background
  prt-surface (#FFFFFF)                ← cards
    prt-canvas-soft (#F4F4F5)          ← alternating sections
```
Portal may use `box-shadow: 0 1px 3px rgba(0,0,0,0.06)` on cards —
the only surface where subtle shadows are acceptable.

---

## Responsive Breakpoints

| Name | Width | Marketing | Dashboard | Portal |
|------|-------|-----------|-----------|--------|
| Desktop-XL | 1440px | Full layout | Sidebar expanded | Full layout |
| Desktop | 1280px | Default | Default | Default |
| Tablet | 1024px | Cards 3→2 | Sidebar 220→48px icon | Stats 3→2 |
| Mobile-Lg | 768px | Cards 2→1, hamburger | Sidebar → Sheet | Stats 3→1 |
| Mobile | 480px | Single col, display 64→28px | Compact | Cards, table→card-list |

### Touch target minimums
- Marketing: 40px height on all CTAs
- Dashboard: 36px (developer, usually desktop)
- Portal: **44px on all interactive elements** — mobile-first

---

## Subdomain-to-Route Mapping

| URL | Surface | Default Theme | Dark Mode | Auth |
|-----|---------|--------------|-----------|------|
| owflex.com | Marketing | Light (cream) | ❌ Not supported | None |
| owflex.com/pricing | Marketing | Light (cream) | ❌ Not supported | None |
| admin.owflex.com | Dashboard | **Dark** | ✅ Toggle + system | Developer login |
| admin.owflex.com/bots | Dashboard | **Dark** | ✅ Toggle + system | Developer login |
| admin.owflex.com/billing | Dashboard | **Dark** | ✅ Toggle + system | Developer login |
| app.owflex.com | Portal | Light | ✅ Toggle + system | Client login |
| app.owflex.com/leads | Portal | Light | ✅ Toggle + system | Client login |
| app.owflex.com/conversations | Portal | Light | ✅ Toggle + system | Client login |

**In Next.js:** Each subdomain maps to a separate layout component.
- `app/(marketing)/layout.tsx` — mkt-* tokens, cream canvas, **no dark mode**
- `app/(dashboard)/layout.tsx` — adm-* tokens (dark) + adm-light-* tokens (light)
- `app/(portal)/layout.tsx` — prt-* tokens (light) + prt-dark-* tokens (dark)

---

## Language & Copy Tone

### Marketing (owflex.com) — Confident, product-led
- "Give your clients a professional dashboard — without building one"
- "Your chatbot, your data, your brand"
- "₨2,000/month. No setup fees."

### Dashboard (admin.owflex.com) — Technical, direct
- "Embed Key" (not "Script ID")
- "Monthly message allowance" (not "API quota")
- "deepseek/deepseek-v4-flash" (show actual model string)
- "Credit balance: $4.20" (not "Tokens remaining")

### Portal (app.owflex.com) — Plain, warm, bilingual-friendly
- "Customers who chatted" (not "Conversation sessions")
- "Phone numbers captured" (not "Lead count")
- "Questions we couldn't answer" (not "Unanswered queries")
- "Your chatbot" (not "Bot instance")
- "Aaj ke leads — Today's new leads" (Urdu subtitle + English label)

---

## Claude Code Agent Prompts

**Building any marketing page (owflex.com):**
> "Read DESIGN.md surface guide for owflex.com (Surface 1: Marketing).
> Cream canvas #F5F1EC as the page background.
> White floating cards (mkt-card-feature) on cream.
> Sky-Teal #0EA5E9 primary CTA only — one per viewport group.
> Inter 600 display type with -2.0px tracking at 64px.
> No shadows. No monospace. Lead each section with a product screenshot tile.
> Charcoal #111111 for all type. Follow mkt-* component tokens."

**Building any dashboard page (admin.owflex.com):**
> "Read DESIGN.md surface guide for admin.owflex.com (Surface 2: Dashboard).
> Near-black canvas #0C0A09. 220px sidebar (adm-surface-1).
> JetBrains Mono on ALL numbers, metrics, embed keys, model names — no exceptions.
> adm-stat-card for stats (4-col grid, gap 10px).
> adm-table for data (42px rows, label-token uppercase headers).
> Sky-Teal #0EA5E9 primary CTA, one per viewport group.
> No shadows — surface lift through adm-surface-1/2/3 ladder only.
> Follow adm-* component tokens."

**Building any portal page (app.owflex.com):**
> "Read DESIGN.md surface guide for app.owflex.com (Surface 3: Portal).
> Off-white canvas #FAFAFA. Top nav only — no sidebar.
> Inter Bold 700 for all stat numbers (portal-metric token, 40px) — NO JetBrains Mono.
> prt-stat-card: generous padding, large readable numbers, plain language labels.
> prt-table collapses to prt-lead-card on mobile (< 768px).
> 44px minimum touch target on all interactive elements.
> Sky-Teal #0EA5E9 primary CTA. Light mode only.
> Follow prt-* component tokens."

---

## Theme Implementation

### The Three Rules

1. **owflex.com** — no theme toggle, no dark mode class, no `prefers-color-scheme`
   check. Cream canvas always. Period.

2. **admin.owflex.com** — dark by default. Respects `prefers-color-scheme` on
   first visit. User toggle stored in `localStorage`. Apply `.dark` / `.light`
   class on `<html>`.

3. **app.owflex.com** — light by default. Respects `prefers-color-scheme` on
   first visit. User toggle stored in `localStorage`. Apply `.dark` / `.light`
   class on `<html>`.

### globals.css — Complete Token Map

```css
/* ─────────────────────────────────────────────────────────
   SHARED: Sky-Teal accent + semantic colors
   Used across all surfaces and both theme modes
   ───────────────────────────────────────────────────────── */
:root {
  --of-primary:         #0EA5E9;
  --of-primary-hover:   #0284C7;
  --of-primary-deep:    #0369A1;
  --of-primary-soft:    #E0F2FE;
  --of-primary-text-light: #0284C7;
  --of-primary-text-dark:  #38BDF8;

  --of-success:         #10B981;
  --of-success-soft:    #ECFDF5;
  --of-success-dark:    #34D399;
  --of-warning:         #F59E0B;
  --of-warning-soft:    #FFFBEB;
  --of-warning-dark:    #FCD34D;
  --of-error:           #EF4444;
  --of-error-soft:      #FEF2F2;
  --of-error-dark:      #F87171;
  --of-credit:          #10B981;
  --of-credit-dark:     #34D399;
}

/* ─────────────────────────────────────────────────────────
   MARKETING: owflex.com
   Light only. No .dark override. Cream canvas always.
   ───────────────────────────────────────────────────────── */
.marketing {
  --bg:           #F5F1EC;  /* mkt-canvas — cream */
  --surface:      #FFFFFF;  /* mkt-surface-1 — white cards */
  --surface-2:    #EBE7E1;  /* mkt-surface-2 — tinted */
  --ink:          #111111;  /* mkt-ink — charcoal */
  --ink-muted:    #626260;
  --ink-subtle:   #7B7B78;
  --ink-tertiary: #9C9FA5;
  --hairline:     #D3CEC6;
  --hairline-soft:#EBE7E1;
  --primary-text: var(--of-primary-text-light);
}

/* ─────────────────────────────────────────────────────────
   DASHBOARD DARK (default): admin.owflex.com
   Applied when html has class="dashboard" or "dashboard dark"
   ───────────────────────────────────────────────────────── */
.dashboard {
  --bg:           #0C0A09;  /* adm-canvas */
  --surface:      #171512;  /* adm-surface-1 */
  --surface-2:    #211E1A;  /* adm-surface-2 */
  --surface-3:    #2A2622;  /* adm-surface-3 */
  --surface-4:    #332E29;  /* adm-surface-4 */
  --ink:          #F5F0EB;  /* adm-ink */
  --ink-muted:    #A09890;
  --ink-subtle:   #6B6560;
  --ink-tertiary: #4A4540;
  --hairline:     #2A2622;
  --hairline-md:  #3D3830;
  --hairline-strong: #524B42;
  --primary-text: var(--of-primary-text-dark);
  --success-text: var(--of-success-dark);
  --error-text:   var(--of-error-dark);
  --warning-text: var(--of-warning-dark);
  --credit-text:  var(--of-credit-dark);
}

/* ─────────────────────────────────────────────────────────
   DASHBOARD LIGHT: admin.owflex.com when toggled to light
   Applied when html has class="dashboard light"
   ───────────────────────────────────────────────────────── */
.dashboard.light {
  --bg:           #FAFAFA;  /* adm-light-canvas */
  --surface:      #FFFFFF;  /* adm-light-surface */
  --surface-2:    #F4F4F5;  /* adm-light-surface-raised */
  --surface-3:    #EEEEEE;  /* adm-light-surface-high */
  --surface-4:    #E4E4E7;
  --ink:          #171717;  /* adm-light-ink */
  --ink-muted:    #52525B;
  --ink-subtle:   #71717A;
  --ink-tertiary: #A1A1AA;
  --hairline:     #E4E4E7;  /* adm-light-hairline */
  --hairline-md:  #D4D4D8;
  --hairline-strong: #C4C4C8;
  --sidebar-bg:   #F4F4F5;  /* adm-light-sidebar */
  --primary-text: var(--of-primary-text-light);
  --success-text: var(--of-success);
  --error-text:   var(--of-error);
  --warning-text: var(--of-warning);
  --credit-text:  var(--of-credit);
}

/* ─────────────────────────────────────────────────────────
   PORTAL LIGHT (default): app.owflex.com
   Applied when html has class="portal" or "portal light"
   ───────────────────────────────────────────────────────── */
.portal {
  --bg:           #FAFAFA;  /* prt-canvas */
  --bg-soft:      #F4F4F5;  /* prt-canvas-soft */
  --surface:      #FFFFFF;  /* prt-surface */
  --surface-raised: #F4F4F5;
  --ink:          #171717;  /* prt-ink */
  --ink-secondary:#212121;
  --ink-muted:    #52525B;
  --ink-subtle:   #71717A;
  --ink-faint:    #A1A1AA;
  --hairline:     #E4E4E7;  /* prt-hairline */
  --hairline-strong: #D4D4D8;
  --primary-text: var(--of-primary-text-light);
  --success-text: var(--of-success);
  --error-text:   var(--of-error);
  --warning-text: var(--of-warning);
  --credit-text:  var(--of-credit);
}

/* ─────────────────────────────────────────────────────────
   PORTAL DARK: app.owflex.com when toggled to dark
   Applied when html has class="portal dark"
   ───────────────────────────────────────────────────────── */
.portal.dark {
  --bg:           #0F0F0F;  /* prt-dark-canvas */
  --bg-soft:      #1A1A1A;
  --surface:      #1A1A1A;  /* prt-dark-surface */
  --surface-raised: #242424;
  --ink:          #F5F5F5;  /* prt-dark-ink */
  --ink-secondary:#EEEEEE;
  --ink-muted:    #A1A1AA;
  --ink-subtle:   #71717A;
  --ink-faint:    #52525B;
  --hairline:     #2A2A2A;  /* prt-dark-hairline */
  --hairline-strong: #3A3A3A;
  --primary-text: var(--of-primary-text-dark);
  --success-text: var(--of-success-dark);
  --error-text:   var(--of-error-dark);
  --warning-text: var(--of-warning-dark);
  --credit-text:  var(--of-credit-dark);
}
```

### Theme Toggle — Next.js Implementation

One reusable hook handles all three subdomains. The `surface` prop locks it to
the correct behavior per subdomain.

```typescript
// lib/theme.ts
export type Surface = 'dashboard' | 'portal'
export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'owflex-theme'
const DEFAULTS: Record<Surface, Theme> = {
  dashboard: 'dark',   // admin.owflex.com — dark first
  portal:    'light',  // app.owflex.com   — light first
}

export function getInitialTheme(surface: Surface): Theme {
  if (typeof window === 'undefined') return DEFAULTS[surface]
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored) return stored
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return systemDark ? 'dark' : 'light'
}

export function applyTheme(surface: Surface, theme: Theme) {
  const html = document.documentElement
  // Remove all surface + theme classes first
  html.classList.remove('dashboard', 'portal', 'marketing', 'dark', 'light')
  // Apply surface class
  html.classList.add(surface)
  // Apply theme class (dark or light)
  html.classList.add(theme)
  localStorage.setItem(STORAGE_KEY, theme)
}
```

```typescript
// hooks/useTheme.ts
'use client'
import { useState, useEffect } from 'react'
import { Surface, Theme, getInitialTheme, applyTheme } from '@/lib/theme'

export function useTheme(surface: Surface) {
  const [theme, setTheme] = useState<Theme>(DEFAULTS[surface])

  useEffect(() => {
    const initial = getInitialTheme(surface)
    setTheme(initial)
    applyTheme(surface, initial)

    // Respect system preference changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      // Only follow system if user hasn't manually toggled
      if (!localStorage.getItem('owflex-theme')) {
        const t: Theme = e.matches ? 'dark' : 'light'
        setTheme(t)
        applyTheme(surface, t)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [surface])

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(surface, next)
  }

  return { theme, toggle }
}

const DEFAULTS = { dashboard: 'dark' as Theme, portal: 'light' as Theme }
```

**Usage in layouts:**

```typescript
// app/(dashboard)/layout.tsx
'use client'
import { useTheme } from '@/hooks/useTheme'

export default function DashboardLayout({ children }) {
  const { theme, toggle } = useTheme('dashboard')
  return (
    <>
      {/* html class is set by useTheme via applyTheme */}
      <ThemeToggleButton theme={theme} onToggle={toggle} />
      {children}
    </>
  )
}

// app/(portal)/layout.tsx
'use client'
import { useTheme } from '@/hooks/useTheme'

export default function PortalLayout({ children }) {
  const { theme, toggle } = useTheme('portal')
  return (
    <>
      <ThemeToggleButton theme={theme} onToggle={toggle} />
      {children}
    </>
  )
}

// app/(marketing)/layout.tsx — NO theme hook, no toggle
export default function MarketingLayout({ children }) {
  // html class is set statically: class="marketing"
  return <>{children}</>
}
```

### Theme Toggle Button Component

```typescript
// components/shared/ThemeToggleButton.tsx
import { Theme } from '@/lib/theme'

interface Props {
  theme: Theme
  onToggle: () => void
}

export function ThemeToggleButton({ theme, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md
                 text-[var(--ink-muted)] text-xs font-medium
                 bg-[var(--surface-2)] border border-[var(--hairline)]
                 hover:text-[var(--ink)] transition-colors"
    >
      {theme === 'dark' ? '☀ Light' : '☾ Dark'}
    </button>
  )
}
```

### Tailwind Usage with CSS Variables

Use `var(--token)` directly in Tailwind's bracket notation. This means every
component automatically responds to theme changes without conditional classes:

```typescript
// ✅ Correct — theme-aware via CSS vars
<div className="bg-[var(--surface)] border border-[var(--hairline)] rounded-lg p-5">
  <span className="text-[var(--ink-subtle)] text-xs font-medium uppercase tracking-wide">
    Total Chats
  </span>
  <p className="font-mono text-[28px] font-bold text-[var(--ink)] mt-1">
    1,247
  </p>
</div>

// ❌ Wrong — hardcoded colors break on theme switch
<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
```

### Anti-Flash Strategy (SSR)

To prevent a flash of wrong theme on page load, add this to the `<head>` of
each subdomain's root layout — runs before React hydrates:

```typescript
// app/(dashboard)/layout.tsx — <head> script
const themeScript = `
  (function() {
    var stored = localStorage.getItem('owflex-theme');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (systemDark ? 'dark' : 'light');
    document.documentElement.classList.add('dashboard', theme);
  })();
`

// app/(portal)/layout.tsx — <head> script
const themeScript = `
  (function() {
    var stored = localStorage.getItem('owflex-theme');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (systemDark ? 'dark' : 'light');
    document.documentElement.classList.add('portal', theme);
  })();
`

// app/(marketing)/layout.tsx — static, no script needed
// Just set: <html class="marketing"> — no theme logic
```

---

## Known Design Constraints

1. Saans (Intercom) and Linear Display are proprietary. We use Inter for all
   three surfaces — the token spec compensates with aggressive weight and
   tracking decisions.

2. JetBrains Mono is free (Apache 2.0). No licensing issue. Self-host from
   fonts.google.com for best load performance.

3. Marketing (owflex.com) is intentionally light-only. The warm cream canvas
   (#F5F1EC) is the brand identity — inverting it for dark mode would create a
   completely different feel with zero conversion benefit.

4. Dashboard defaults dark, portal defaults light. Both respect
   `prefers-color-scheme` on first visit. User toggle overrides system
   preference and is persisted in `localStorage`.

5. Dashboard light mode (adm-light-*) is the same density as dark mode — it's
   not a friendlier version, it's the same tool in a brighter coat.

6. Portal dark mode (prt-dark-*) is softer and warmer than the dashboard dark.
   The reference is WhatsApp/Instagram dark mode, not Linear.

7. The single Sky-Teal accent (#0EA5E9) works across all five theme states
   (marketing light, dashboard dark, dashboard light, portal light, portal dark)
   with WCAG AA contrast on all canvas colors.

8. Semantic colors have `-dark` variants for dark surface use — brighter versions
   that maintain contrast on near-black backgrounds.

9. Run `npx @google/design.md lint DESIGN.md` after any edits to this file.
