import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

function makeRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

let _chatRatelimit: Ratelimit | null | undefined
let _leadsRatelimit: Ratelimit | null | undefined
let _toolsAiRatelimit: Ratelimit | null | undefined

export function getChatRatelimit(): Ratelimit | null {
  if (_chatRatelimit === undefined) {
    const redis = makeRedis()
    _chatRatelimit = redis
      ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 m'), prefix: 'Octively:chat' })
      : null
  }
  return _chatRatelimit
}

export function getLeadsRatelimit(): Ratelimit | null {
  if (_leadsRatelimit === undefined) {
    const redis = makeRedis()
    _leadsRatelimit = redis
      ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m'), prefix: 'Octively:leads' })
      : null
  }
  return _leadsRatelimit
}

// Guards the optional "Generate with AI" buttons on the public free tools.
// These call the LLM, so cap each IP to keep cost and abuse in check. The
// static banks behind every tool are unaffected and stay open.
export function getToolsAiRatelimit(): Ratelimit | null {
  if (_toolsAiRatelimit === undefined) {
    const redis = makeRedis()
    _toolsAiRatelimit = redis
      ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 m'), prefix: 'Octively:tools-ai' })
      : null
  }
  return _toolsAiRatelimit
}
