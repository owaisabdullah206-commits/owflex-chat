/**
 * WSL networking preload for Node scripts that hit Neon / other dual-stack hosts.
 *
 * WSL2 advertises IPv6 (AAAA) records but has no working IPv6 route, so Node's
 * undici "Happy Eyeballs" (autoSelectFamily) races IPv6 + IPv4 and fails with
 * ENETUNREACH / ETIMEDOUT — even though IPv4 works fine (curl connects). Disabling
 * autoSelectFamily makes undici use the first resolved address; pair with
 * `--dns-result-order=ipv4first` so that address is IPv4.
 *
 * Usage:
 *   NODE_OPTIONS="--dns-result-order=ipv4first --import ./scripts/wsl-net-fix.mjs" npx tsx scripts/seed-demo.ts
 */
import { Agent, setGlobalDispatcher } from 'undici'

setGlobalDispatcher(new Agent({ connect: { autoSelectFamily: false } }))
