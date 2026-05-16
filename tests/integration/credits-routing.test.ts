import { describe, it, expect, vi, beforeEach } from 'vitest'
import { routeMessage } from '@/lib/ai/router'

// Mock the credits module — getBalance returns 0 (depleted org)
vi.mock('@/lib/credits', () => ({
  getBalance: vi.fn().mockResolvedValue(0),
  debit: vi.fn().mockResolvedValue({ ok: false, balance: 0 }),
  refund: vi.fn().mockResolvedValue(undefined),
}))

describe('routeMessage — credit-based fallback (FR-029)', () => {
  beforeEach(() => {
    // Ensure kill-switch is off so the router actually runs
    delete process.env.SMART_ROUTING_FORCE_OFF

    // Stub fetch so classifier returns 'complex' without hitting OpenRouter
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"label":"complex"}' } }],
        }),
      }),
    )
  })

  it('falls back to default model when org balance is 0', async () => {
    const result = await routeMessage({
      text: 'Compare these three distributed system architectures with code examples and tradeoffs',
      botDefaultModel: 'deepseek/deepseek-v4-flash',
      orgId: 'test-org-zero-balance',
      baseEstimate: 100,
    })

    expect(result.fallbackUsed).toBe(true)
    expect(result.modelToUse).toBe('deepseek/deepseek-v4-flash')
    expect(result.classification).toBe('complex')
  })

  it('uses default model for non-complex classifications regardless of balance', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"label":"greeting"}' } }],
        }),
      }),
    )

    const result = await routeMessage({
      text: 'Hello!',
      botDefaultModel: 'deepseek/deepseek-v4-flash',
      orgId: 'test-org-zero-balance',
      baseEstimate: 100,
    })

    expect(result.fallbackUsed).toBe(false)
    expect(result.modelToUse).toBe('deepseek/deepseek-v4-flash')
    expect(result.classification).toBe('greeting')
  })

  it('short-circuits to default model when SMART_ROUTING_FORCE_OFF is set', async () => {
    process.env.SMART_ROUTING_FORCE_OFF = 'true'

    const result = await routeMessage({
      text: 'Complex multi-step reasoning question',
      botDefaultModel: 'deepseek/deepseek-v4-flash',
      orgId: 'test-org',
      baseEstimate: 100,
    })

    expect(result.fallbackUsed).toBe(false)
    expect(result.modelToUse).toBe('deepseek/deepseek-v4-flash')
    expect(result.classification).toBe('knowledge') // force-off returns 'knowledge'
    // fetch should NOT have been called (no classifier call)
    expect(fetch).not.toHaveBeenCalled()
  })
})
