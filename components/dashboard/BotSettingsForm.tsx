'use client'

import { useTransition, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { updateBot } from '@/lib/db/queries/bots'
import { SUPPORTED_MODELS, type SupportedModel } from '@/lib/ai/litellm'

interface BotSettingsFormProps {
  botId: string
  orgPlan: string
  initial: {
    name: string
    systemPrompt: string
    model: string
    primaryColor: string
    position: 'bottom-right' | 'bottom-left'
    welcomeMessage: string
    leadCaptureEnabled: boolean
    strictMode: boolean
  }
}

export function BotSettingsForm({ botId, orgPlan, initial }: BotSettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const [name, setName] = useState(initial.name)
  const [systemPrompt, setSystemPrompt] = useState(initial.systemPrompt)
  const [model, setModel] = useState(initial.model)
  const [primaryColor, setPrimaryColor] = useState(initial.primaryColor)
  const [position, setPosition] = useState(initial.position)
  const [welcomeMessage, setWelcomeMessage] = useState(initial.welcomeMessage)
  const [leadCaptureEnabled, setLeadCaptureEnabled] = useState(initial.leadCaptureEnabled)
  const [strictMode, setStrictMode] = useState(initial.strictMode)

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
        widgetConfig: { primaryColor, position, welcomeMessage, leadCaptureEnabled, strictMode },
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    <form onSubmit={handleSubmit} className="space-y-6">
      {isDirty && (
        <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
          You have unsaved changes
        </div>
      )}

      {/* Bot Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs text-[var(--ink-muted)]">Bot Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => { setName(e.target.value); markDirty() }}
          className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)]"
          disabled={isPending}
        />
      </div>

      {/* System Prompt */}
      <div className="space-y-1.5">
        <Label htmlFor="systemPrompt" className="text-xs text-[var(--ink-muted)]">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => { setSystemPrompt(e.target.value); markDirty() }}
          rows={5}
          className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)] resize-none"
          disabled={isPending}
        />
      </div>

      {/* Model */}
      <div className="space-y-1.5">
        <Label htmlFor="model" className="text-xs text-[var(--ink-muted)]">
          Model
          {isFreePlan && (
            <span className="ml-2 text-[10px] text-[var(--ink-muted)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded">
              Upgrade to change
            </span>
          )}
        </Label>
        <select
          id="model"
          value={model}
          onChange={(e) => { setModel(e.target.value); markDirty() }}
          disabled={isPending || isFreePlan}
          className="w-full rounded-md border border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink)] px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {SUPPORTED_MODELS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Welcome Message */}
      <div className="space-y-1.5">
        <Label htmlFor="welcomeMessage" className="text-xs text-[var(--ink-muted)]">Welcome Message</Label>
        <Input
          id="welcomeMessage"
          value={welcomeMessage}
          onChange={(e) => { setWelcomeMessage(e.target.value); markDirty() }}
          maxLength={200}
          className="bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)]"
          disabled={isPending}
        />
      </div>

      {/* Primary Colour */}
      <div className="space-y-1.5">
        <Label htmlFor="primaryColor" className="text-xs text-[var(--ink-muted)]">Widget Colour</Label>
        <div className="flex items-center gap-3">
          <input
            id="primaryColor"
            type="color"
            value={primaryColor}
            onChange={(e) => { setPrimaryColor(e.target.value); markDirty() }}
            disabled={isPending}
            className="h-9 w-14 rounded border border-[var(--hairline)] cursor-pointer bg-transparent disabled:opacity-50"
          />
          <Input
            value={primaryColor}
            onChange={(e) => { setPrimaryColor(e.target.value); markDirty() }}
            pattern="^#[0-9a-fA-F]{6}$"
            maxLength={7}
            className="w-32 bg-[var(--surface)] border-[var(--hairline)] text-[var(--ink)]"
            style={{ fontFamily: 'var(--font-mono)' }}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Position */}
      <div className="space-y-1.5">
        <Label htmlFor="position" className="text-xs text-[var(--ink-muted)]">Widget Position</Label>
        <select
          id="position"
          value={position}
          onChange={(e) => { setPosition(e.target.value as 'bottom-right' | 'bottom-left'); markDirty() }}
          disabled={isPending}
          className="w-full rounded-md border border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink)] px-3 py-2 text-sm disabled:opacity-50"
        >
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
        </select>
      </div>

      {/* Toggles */}
      <div className="border-t border-[var(--hairline)] divide-y divide-[var(--hairline)]">
        {/* Lead Capture */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm text-[var(--ink)]">Lead Capture</p>
            <p className="text-xs text-[var(--ink-muted)]">Collect visitor contact details automatically</p>
          </div>
          <Switch
            checked={leadCaptureEnabled}
            onCheckedChange={(v) => { setLeadCaptureEnabled(v); markDirty() }}
            disabled={isPending}
          />
        </div>

        {/* Strict Mode */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm text-[var(--ink)]">Strict Mode</p>
            <p className="text-xs text-[var(--ink-muted)]">
              Bot refuses questions outside its knowledge base and says &ldquo;I don&apos;t know&rdquo;
            </p>
          </div>
          <Switch
            checked={strictMode}
            onCheckedChange={(v) => { setStrictMode(v); markDirty() }}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[var(--of-primary)] hover:bg-[var(--of-primary-hover)] text-white"
        >
          {isPending ? 'Saving…' : 'Save Changes'}
        </Button>
        {saved && <span className="text-xs text-emerald-400">Saved — widget updates within 5 minutes</span>}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </form>
    <div className="hidden lg:block">
      <LiveBotPreview botName={name} primaryColor={primaryColor} welcomeMessage={welcomeMessage} />
    </div>
    </div>
  )
}

function LiveBotPreview({
  botName,
  primaryColor,
  welcomeMessage,
}: {
  botName: string
  primaryColor: string
  welcomeMessage: string
}) {
  const initial = botName.trim().charAt(0).toUpperCase() || 'B'
  const displayMessage = welcomeMessage.trim() || 'Hi! How can I help you today?'

  return (
    <div className="sticky top-24">
      <p className="text-xs font-medium text-[var(--ink-muted)] mb-3 uppercase tracking-wide">Live Preview</p>
      <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] overflow-hidden shadow-lg max-w-xs">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: primaryColor }}>
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">{initial}</span>
          </div>
          <span className="text-white text-sm font-medium truncate">{botName || 'My Bot'}</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-300 shrink-0" />
        </div>
        {/* Messages */}
        <div className="p-3 space-y-2.5 bg-[var(--bg)] min-h-[180px]">
          <div className="flex gap-2 items-end">
            <div className="w-5 h-5 rounded-full shrink-0 mb-0.5" style={{ backgroundColor: primaryColor }} />
            <div className="bg-[var(--surface)] border border-[var(--hairline)] text-[var(--ink)] text-xs rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
              {displayMessage}
            </div>
          </div>
          <div className="flex justify-end">
            <div
              className="text-white text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]"
              style={{ backgroundColor: primaryColor }}
            >
              Tell me about your services.
            </div>
          </div>
        </div>
        {/* Input bar */}
        <div className="px-3 py-2.5 border-t border-[var(--hairline)] flex items-center gap-2 bg-[var(--surface)]">
          <div className="flex-1 h-7 rounded-full bg-[var(--bg)] border border-[var(--hairline)]" />
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </div>
        </div>
      </div>
      <p className="text-xs text-[var(--ink-subtle)] mt-2">Updates as you change settings above.</p>
    </div>
  )
}
