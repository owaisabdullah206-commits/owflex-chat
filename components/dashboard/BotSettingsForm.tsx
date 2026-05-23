'use client'

import { useTransition, useState, useEffect } from 'react'
import {
  MessageCircle, Bot, HelpCircle, Headphones, Sparkles,
  Zap, MessageSquare, Smile, Sun, Moon, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { updateBot } from '@/lib/db/queries/bots'
import { SUPPORTED_MODELS, type SupportedModel } from '@/lib/ai/litellm'

// ─── Trigger icon catalogue ───────────────────────────────────────────────────
const TRIGGER_ICONS = [
  { id: 'message-circle', label: 'Chat',     Icon: MessageCircle },
  { id: 'bot',            label: 'Bot',      Icon: Bot           },
  { id: 'help-circle',    label: 'Help',     Icon: HelpCircle    },
  { id: 'headphones',     label: 'Support',  Icon: Headphones    },
  { id: 'sparkles',       label: 'AI',       Icon: Sparkles      },
  { id: 'zap',            label: 'Quick',    Icon: Zap           },
  { id: 'message-square', label: 'Box',      Icon: MessageSquare },
  { id: 'smile',          label: 'Friendly', Icon: Smile         },
] as const

type TriggerIconId = typeof TRIGGER_ICONS[number]['id']

function getIconComponent(id: string) {
  return TRIGGER_ICONS.find((t) => t.id === id)?.Icon ?? MessageCircle
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface BotSettingsFormProps {
  botId: string
  orgPlan: string
  initial: {
    name: string
    systemPrompt: string
    model: string
    smartRoutingEnabled: boolean
    routingLightModel: string | null
    routingStrongModel: string | null
    primaryColor: string
    position: 'bottom-right' | 'bottom-left'
    welcomeMessage: string
    leadCaptureEnabled: boolean
    collectLeadBefore: boolean
    strictMode: boolean
    triggerIcon: string
    borderRadius: number
    tooltipEnabled: boolean
    tooltipMessages: string[]
    brandingEnabled: boolean
    brandingText: string
    brandingUrl: string
    handoffEnabled: boolean
  }
}

// ─── Main form ────────────────────────────────────────────────────────────────
export function BotSettingsForm({ botId, orgPlan, initial }: BotSettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const [name, setName]                         = useState(initial.name)
  const [systemPrompt, setSystemPrompt]         = useState(initial.systemPrompt)
  const [model, setModel]                       = useState(initial.model)
  const [smartRouting, setSmartRouting]         = useState(initial.smartRoutingEnabled)
  const [lightModel, setLightModel]             = useState<string>(initial.routingLightModel ?? initial.model)
  const [strongModel, setStrongModel]           = useState<string>(initial.routingStrongModel ?? 'anthropic/claude-haiku-4-5-20251001')
  const [primaryColor, setPrimaryColor]         = useState(initial.primaryColor)
  const [position, setPosition]                 = useState(initial.position)
  const [welcomeMessage, setWelcomeMessage]     = useState(initial.welcomeMessage)
  const [leadCaptureEnabled, setLeadCapture]    = useState(initial.leadCaptureEnabled)
  const [collectLeadBefore, setCollectLeadBefore] = useState(initial.collectLeadBefore)
  const [strictMode, setStrictMode]             = useState(initial.strictMode)
  const [triggerIcon, setTriggerIcon]           = useState<TriggerIconId>(initial.triggerIcon as TriggerIconId)
  const [borderRadius, setBorderRadius]         = useState(initial.borderRadius)
  const [tooltipEnabled, setTooltipEnabled]     = useState(initial.tooltipEnabled)
  const [tooltipMessages, setTooltipMessages]   = useState(initial.tooltipMessages.join('\n'))
  const [brandingEnabled, setBrandingEnabled]   = useState(initial.brandingEnabled)
  const [brandingText, setBrandingText]         = useState(initial.brandingText)
  const [brandingUrl, setBrandingUrl]           = useState(initial.brandingUrl)
  const [handoffEnabled, setHandoffEnabled]     = useState(initial.handoffEnabled)
  const [previewTheme, setPreviewTheme]         = useState<'dark' | 'light'>('dark')

  const isFreePlan = orgPlan === 'free'

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  function markDirty() { setIsDirty(true) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)
    setError(null)
    startTransition(async () => {
      const result = await updateBot(botId, {
        name,
        systemPrompt,
        model: model as SupportedModel,
        smartRoutingEnabled: smartRouting,
        routingLightModel: smartRouting ? lightModel as SupportedModel : null,
        routingStrongModel: smartRouting ? strongModel as SupportedModel : null,
        widgetConfig: {
          primaryColor,
          position,
          welcomeMessage,
          leadCaptureEnabled,
          collectLeadBefore,
          strictMode,
          triggerIcon,
          borderRadius,
          tooltipEnabled,
          tooltipMessages: tooltipMessages.split('\n').map((s) => s.trim()).filter(Boolean),
          brandingEnabled: (orgPlan === 'agency' || orgPlan === 'enterprise') ? brandingEnabled : true,
          brandingText: brandingText.trim() || undefined,
          brandingUrl:  brandingUrl.trim()  || undefined,
          handoffEnabled,
        },
      })
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setIsDirty(false)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ── Left: form ── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {isDirty && (
          <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 border-l-2 border-l-amber-400 px-3 py-2">
            You have unsaved changes
          </div>
        )}

        {/* Bot Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs text-[var(--ink-muted)]">Bot Name</Label>
          <Input id="name" value={name}
            onChange={(e) => { setName(e.target.value); markDirty() }}
            className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)] rounded-none"
            disabled={isPending} />
        </div>

        {/* System Prompt */}
        <div className="space-y-1.5">
          <Label htmlFor="systemPrompt" className="text-xs text-[var(--ink-muted)]">System Prompt</Label>
          <Textarea id="systemPrompt" value={systemPrompt}
            onChange={(e) => { setSystemPrompt(e.target.value); markDirty() }}
            rows={5}
            className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)] resize-none rounded-none"
            disabled={isPending} />
        </div>

        {/* Smart Routing */}
        <div className="border border-[var(--hairline)] bg-[var(--surface)]">
          <div className="flex items-start justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">Smart routing</p>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                {smartRouting
                  ? 'Classifies each message and routes to the right model tier.'
                  : 'All messages use the single model below. Enable to route by complexity.'}
              </p>
            </div>
            <Switch
              checked={smartRouting}
              onCheckedChange={(v) => { setSmartRouting(v); markDirty() }}
              disabled={isPending || isFreePlan}
              className="mt-0.5 shrink-0"
            />
          </div>

          {smartRouting && (
            <div className="border-t border-[var(--hairline)] divide-y divide-[var(--hairline)]">
              {/* Light model */}
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-28 shrink-0">
                  <p className="text-[11px] font-medium text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>light_model</p>
                  <p className="text-[10px] text-[var(--ink-subtle)]">greetings · faq</p>
                </div>
                <div className="relative flex-1">
                  <select value={lightModel}
                    onChange={(e) => { setLightModel(e.target.value); markDirty() }}
                    disabled={isPending}
                    className="w-full appearance-none border border-[var(--hairline)] bg-[var(--bg)] text-[var(--ink)] pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:border-[var(--of-primary)] cursor-pointer"
                    style={{ fontFamily: 'var(--font-mono)' }}>
                    {SUPPORTED_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--ink-muted)]" />
                </div>
              </div>
              {/* Default model (knowledge) */}
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-28 shrink-0">
                  <p className="text-[11px] font-medium text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>default_model</p>
                  <p className="text-[10px] text-[var(--ink-subtle)]">knowledge queries</p>
                </div>
                <div className="relative flex-1">
                  <select value={model}
                    onChange={(e) => { setModel(e.target.value); markDirty() }}
                    disabled={isPending || isFreePlan}
                    className="w-full appearance-none border border-[var(--hairline)] bg-[var(--bg)] text-[var(--ink)] pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:border-[var(--of-primary)] disabled:opacity-50 cursor-pointer"
                    style={{ fontFamily: 'var(--font-mono)' }}>
                    {SUPPORTED_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--ink-muted)]" />
                </div>
              </div>
              {/* Strong model */}
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-28 shrink-0">
                  <p className="text-[11px] font-medium text-[var(--ink-muted)]" style={{ fontFamily: 'var(--font-mono)' }}>strong_model</p>
                  <p className="text-[10px] text-[var(--ink-subtle)]">complex reasoning</p>
                </div>
                <div className="relative flex-1">
                  <select value={strongModel}
                    onChange={(e) => { setStrongModel(e.target.value); markDirty() }}
                    disabled={isPending}
                    className="w-full appearance-none border border-[var(--hairline)] bg-[var(--bg)] text-[var(--ink)] pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:border-[var(--of-primary)] cursor-pointer"
                    style={{ fontFamily: 'var(--font-mono)' }}>
                    {SUPPORTED_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--ink-muted)]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Model (single, shown only when smart routing is off) */}
        {!smartRouting && (
        <div className="space-y-1.5">
          <Label htmlFor="model" className="text-xs text-[var(--ink-muted)]">
            Model
            {isFreePlan && (
              <span className="ml-2 text-[10px] text-[var(--ink-muted)] bg-[var(--surface-2)] px-1.5 py-0.5">
                Upgrade to change
              </span>
            )}
          </Label>
          <div className="relative">
            <select id="model" value={model}
              onChange={(e) => { setModel(e.target.value); markDirty() }}
              disabled={isPending || isFreePlan}
              className="w-full appearance-none border border-[var(--hairline)] bg-[var(--bg)] text-[var(--ink)] pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-[var(--of-primary)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ fontFamily: 'var(--font-mono)' }}>
              {SUPPORTED_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ink-muted)]" />
          </div>
        </div>
        )}

        {/* Welcome Message */}
        <div className="space-y-1.5">
          <Label htmlFor="welcomeMessage" className="text-xs text-[var(--ink-muted)]">Welcome Message</Label>
          <Input id="welcomeMessage" value={welcomeMessage}
            onChange={(e) => { setWelcomeMessage(e.target.value); markDirty() }}
            maxLength={200}
            className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)] rounded-none"
            disabled={isPending} />
        </div>

        {/* Widget Colour */}
        <div className="space-y-1.5">
          <Label htmlFor="primaryColor" className="text-xs text-[var(--ink-muted)]">Widget Colour</Label>
          <div className="flex items-center gap-3">
            <input id="primaryColor" type="color" value={primaryColor}
              onChange={(e) => { setPrimaryColor(e.target.value); markDirty() }}
              disabled={isPending}
              className="h-9 w-14 border border-[var(--hairline)] cursor-pointer bg-transparent disabled:opacity-50" />
            <Input value={primaryColor}
              onChange={(e) => { setPrimaryColor(e.target.value); markDirty() }}
              pattern="^#[0-9a-fA-F]{6}$" maxLength={7}
              className="w-32 rounded-none bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)]"
              style={{ fontFamily: 'var(--font-mono)' }}
              disabled={isPending} />
          </div>
        </div>

        {/* Trigger Icon */}
        <div className="space-y-2">
          <Label className="text-xs text-[var(--ink-muted)]">Trigger Icon</Label>
          <div className="grid grid-cols-4 gap-2">
            {TRIGGER_ICONS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setTriggerIcon(id); markDirty() }}
                disabled={isPending}
                className={`flex flex-col items-center gap-1.5 py-3 border transition-all cursor-pointer ${
                  triggerIcon === id
                    ? 'border-[var(--of-primary)] bg-[var(--of-primary)]/10 text-[var(--of-primary)]'
                    : 'border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--hairline-strong)] hover:text-[var(--ink)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px]">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Corner Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-[var(--ink-muted)]">Corner Radius</Label>
            <span className="text-xs text-[var(--ink-subtle)]" style={{ fontFamily: 'var(--font-mono)' }}>
              {borderRadius}px
            </span>
          </div>
          <input
            type="range" min={0} max={24} step={2}
            value={borderRadius}
            onChange={(e) => { setBorderRadius(Number(e.target.value)); markDirty() }}
            disabled={isPending}
            className="w-full accent-[var(--of-primary)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--ink-subtle)]">
            <span>Square</span>
            <span>Rounded</span>
          </div>
        </div>

        {/* Widget Position */}
        <div className="space-y-1.5">
          <Label htmlFor="position" className="text-xs text-[var(--ink-muted)]">Widget Position</Label>
          <div className="relative">
            <select id="position" value={position}
              onChange={(e) => { setPosition(e.target.value as 'bottom-right' | 'bottom-left'); markDirty() }}
              disabled={isPending}
              className="w-full appearance-none border border-[var(--hairline)] bg-[var(--bg)] text-[var(--ink)] pl-3 pr-8 py-2 text-sm focus:outline-none focus:border-[var(--of-primary)] disabled:opacity-50 cursor-pointer">
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ink-muted)]" />
          </div>
        </div>

        {/* Toggles */}
        <div className="border-t border-[var(--hairline)] divide-y divide-[var(--hairline)]">
          {/* Lead Capture */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-[var(--ink)]">Lead Capture</p>
              <p className="text-xs text-[var(--ink-muted)]">Collect visitor contact details automatically during chat</p>
            </div>
            <Switch checked={leadCaptureEnabled}
              onCheckedChange={(v) => { setLeadCapture(v); markDirty() }}
              disabled={isPending} />
          </div>

          {/* Collect Lead Before Chat */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-[var(--ink)]">Collect Info Before Chat</p>
              <p className="text-xs text-[var(--ink-muted)]">Show a name / email / phone form before the chat opens. Stored as a lead automatically.</p>
            </div>
            <Switch checked={collectLeadBefore}
              onCheckedChange={(v) => { setCollectLeadBefore(v); markDirty() }}
              disabled={isPending} />
          </div>

          {/* Strict Mode */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-[var(--ink)]">Strict Mode</p>
              <p className="text-xs text-[var(--ink-muted)]">
                Bot refuses questions outside its knowledge base and says &ldquo;I don&apos;t know&rdquo;
              </p>
            </div>
            <Switch checked={strictMode}
              onCheckedChange={(v) => { setStrictMode(v); markDirty() }}
              disabled={isPending} />
          </div>

          {/* Human Handoff */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-[var(--ink)]">Human Handoff</p>
              <p className="text-xs text-[var(--ink-muted)]">
                When the bot can&apos;t answer, notify you by email and flag the conversation for follow-up
              </p>
            </div>
            <Switch checked={handoffEnabled}
              onCheckedChange={(v) => { setHandoffEnabled(v); markDirty() }}
              disabled={isPending} />
          </div>

          {/* Tooltip Messages */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm text-[var(--ink)]">Trigger Tooltip</p>
              <p className="text-xs text-[var(--ink-muted)]">Rotating messages shown above the trigger on first load</p>
            </div>
            <Switch checked={tooltipEnabled}
              onCheckedChange={(v) => { setTooltipEnabled(v); markDirty() }}
              disabled={isPending} />
          </div>
        </div>


        {tooltipEnabled && (
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--ink-muted)]">
              Tooltip Messages
              <span className="ml-2 text-[var(--ink-subtle)]">(one per line, max 5)</span>
            </Label>
            <Textarea
              value={tooltipMessages}
              onChange={(e) => { setTooltipMessages(e.target.value); markDirty() }}
              rows={4}
              placeholder={`Need help? Ask me!\nHi there! How can I assist?\nGot questions? I'm here!`}
              className="rounded-none bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)] resize-none text-xs"
              disabled={isPending}
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending}
            className="bg-[var(--of-primary)] hover:bg-[var(--of-primary-hover)] text-white">
            {isPending ? 'Saving…' : 'Save Changes'}
          </Button>
          {saved  && <span className="text-xs text-[var(--success-text)]">Saved — widget updates within 5 minutes</span>}
          {error  && <span className="text-xs text-[var(--error-text)]">{error}</span>}
        </div>

        {/* Attribution — agency/enterprise white-label only, intentionally low-visibility */}
        {(orgPlan === 'agency' || orgPlan === 'enterprise') && (
          <div className="pt-6 mt-2 border-t border-[var(--hairline)]">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] text-[var(--ink-subtle)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                attribution_footer
              </span>
              <Switch
                checked={brandingEnabled}
                onCheckedChange={(v) => { setBrandingEnabled(v); markDirty() }}
                disabled={isPending}
              />
            </div>
            {brandingEnabled && (
              <div className="mt-3 space-y-2">
                <Input
                  value={brandingText}
                  onChange={(e) => { setBrandingText(e.target.value); markDirty() }}
                  maxLength={60}
                  placeholder="Powered by My Agency"
                  className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)] rounded-none text-xs h-8"
                  disabled={isPending}
                />
                <Input
                  value={brandingUrl}
                  onChange={(e) => { setBrandingUrl(e.target.value); markDirty() }}
                  type="url"
                  placeholder="https://myagency.com"
                  className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)] rounded-none text-xs h-8"
                  disabled={isPending}
                />
              </div>
            )}
          </div>
        )}
      </form>

      {/* ── Right: live preview ── */}
      <div className="hidden lg:block">
        <LiveBotPreview
          botName={name}
          primaryColor={primaryColor}
          welcomeMessage={welcomeMessage}
          triggerIcon={triggerIcon}
          borderRadius={borderRadius}
          position={position}
          tooltipEnabled={tooltipEnabled}
          tooltipMessages={tooltipMessages.split('\n').map((s) => s.trim()).filter(Boolean)}
          brandingEnabled={brandingEnabled}
          brandingText={brandingText.trim() || 'Powered by Octively'}
          theme={previewTheme}
          onToggleTheme={() => setPreviewTheme((t) => t === 'dark' ? 'light' : 'dark')}
        />
      </div>
    </div>
  )
}

// ─── Live preview ─────────────────────────────────────────────────────────────
function LiveBotPreview({
  botName,
  primaryColor,
  welcomeMessage,
  triggerIcon,
  borderRadius,
  position,
  tooltipEnabled,
  tooltipMessages,
  brandingEnabled,
  brandingText,
  theme,
  onToggleTheme,
}: {
  botName: string
  primaryColor: string
  welcomeMessage: string
  triggerIcon: string
  borderRadius: number
  position: 'bottom-right' | 'bottom-left'
  tooltipEnabled: boolean
  tooltipMessages: string[]
  brandingEnabled: boolean
  brandingText: string
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}) {
  const isDark = theme === 'dark'
  const isLeft = position === 'bottom-left'
  const c = isDark
    ? { bg: '#0C0A09', surface: '#171512', hairline: '#2A2622', ink: '#F5F0EB', inkMuted: '#A09890' }
    : { bg: '#FFFFFF', surface: '#F4F4F5', hairline: '#E4E4E7', ink: '#111111', inkMuted: '#6B7280' }

  const TriggerIcon = getIconComponent(triggerIcon)
  const initial     = botName.trim().charAt(0).toUpperCase() || 'B'
  const displayMsg  = welcomeMessage.trim() || 'Hi! How can I help you today?'
  const firstTip    = tooltipMessages[0] || 'Need help? Ask me!'
  const br          = `${borderRadius}px`
  const innerBr     = `${Math.max(4, borderRadius - 4)}px`

  return (
    <div className="sticky top-20">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-wide">Live Preview</p>
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] px-2 py-1 rounded border border-[var(--hairline)] transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      {/* Chat window */}
      <div
        style={{ borderRadius: br, backgroundColor: c.bg, border: `1px solid ${c.hairline}`, width: '300px' }}
        className="overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-2.5" style={{ backgroundColor: primaryColor }}>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <TriggerIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-white text-sm font-semibold truncate flex-1">{botName || 'My Bot'}</span>
          <div className="w-2 h-2 rounded-full bg-emerald-300 shrink-0" title="Online" />
        </div>

        {/* Messages */}
        <div className="p-3 space-y-3" style={{ minHeight: '340px', backgroundColor: c.bg }}>
          {/* Bot bubble */}
          <div className="flex gap-2 items-end">
            <div
              className="w-6 h-6 rounded-full shrink-0 mb-0.5 flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <TriggerIcon className="h-3 w-3 text-white" />
            </div>
            <div
              className="text-xs px-3 py-2 max-w-[80%] leading-relaxed"
              style={{
                backgroundColor: c.surface,
                color: c.ink,
                border: `1px solid ${c.hairline}`,
                borderRadius: innerBr,
                borderBottomLeftRadius: '4px',
              }}
            >
              {displayMsg}
            </div>
          </div>

          {/* User bubble */}
          <div className="flex justify-end">
            <div
              className="text-white text-xs px-3 py-2 max-w-[80%] leading-relaxed"
              style={{
                backgroundColor: primaryColor,
                borderRadius: innerBr,
                borderBottomRightRadius: '4px',
              }}
            >
              Tell me about your services.
            </div>
          </div>

          {/* Second bot bubble */}
          <div className="flex gap-2 items-end">
            <div
              className="w-6 h-6 rounded-full shrink-0 mb-0.5 flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <TriggerIcon className="h-3 w-3 text-white" />
            </div>
            <div
              className="text-xs px-3 py-2 max-w-[80%] leading-relaxed"
              style={{
                backgroundColor: c.surface,
                color: c.ink,
                border: `1px solid ${c.hairline}`,
                borderRadius: innerBr,
                borderBottomLeftRadius: '4px',
              }}
            >
              Sure! We offer…
              <span style={{ color: c.inkMuted }}>
                {' '}(answer will appear here based on your knowledge base)
              </span>
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div
          className="px-3 py-2.5 flex items-center gap-2"
          style={{ borderTop: `1px solid ${c.hairline}`, backgroundColor: c.surface }}
        >
          <div
            className="flex-1 h-8 px-3 flex items-center"
            style={{ backgroundColor: c.bg, border: `1px solid ${c.hairline}`, borderRadius: `${Math.max(4, borderRadius)}px` }}
          >
            <span className="text-xs" style={{ color: c.inkMuted }}>Type a message…</span>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </div>
        </div>

        {/* Branding footer */}
        {brandingEnabled && (
          <div
            className="text-center py-1"
            style={{
              borderTop: `1px solid ${c.hairline}`,
              backgroundColor: c.surface,
              fontSize: '10px',
              opacity: 0.45,
              color: c.ink,
            }}
          >
            {brandingText}
          </div>
        )}
      </div>

      {/* Trigger area */}
      <div
        className="mt-3 flex items-center gap-2"
        style={{ width: '300px', justifyContent: isLeft ? 'flex-start' : 'flex-end' }}
      >
        {isLeft && (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <TriggerIcon className="h-6 w-6 text-white" />
          </div>
        )}
        {tooltipEnabled && (
          <div
            className="text-xs px-3 py-1.5 shadow-sm"
            style={{
              borderRadius: '999px',
              backgroundColor: isDark ? '#171512' : '#FFFFFF',
              color: isDark ? '#F5F0EB' : '#111111',
              border: `1px solid ${isDark ? '#2A2622' : '#E4E4E7'}`,
              maxWidth: '180px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {firstTip}
          </div>
        )}
        {!isLeft && (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <TriggerIcon className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--ink-subtle)] mt-2.5">Updates live as you change settings above.</p>
    </div>
  )
}
