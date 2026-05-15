import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

let _chatRatelimit: Ratelimit | undefined
let _leadsRatelimit: Ratelimit | undefined

export function getChatRatelimit(): Ratelimit {
  if (!_chatRatelimit) {
    _chatRatelimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      prefix: 'owflex:chat',
    })
  }
  return _chatRatelimit
}

export function getLeadsRatelimit(): Ratelimit {
  if (!_leadsRatelimit) {
    _leadsRatelimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      prefix: 'owflex:leads',
    })
  }
  return _leadsRatelimit
}
