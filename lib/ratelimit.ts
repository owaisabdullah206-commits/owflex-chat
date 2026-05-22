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
