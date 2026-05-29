import type { NextConfig } from "next";

// Content-Security-Policy
// - default-src 'self': only our own origin by default
// - script-src 'self' 'unsafe-inline': Next.js inline hydration scripts require unsafe-inline
// - style-src 'self' 'unsafe-inline': Tailwind/shadcn inject inline styles
// - img-src 'self' data: blob: https:: allow CDN images in product cards + OG images
// - connect-src 'self' https:: allow API calls + Upstash/Resend/LiteLLM in browser
// - frame-src 'none': no iframes served from our domain
// - object-src 'none': block Flash and plugins
// - base-uri 'self': prevent base-tag hijacking
// - form-action 'self': form submissions only to same origin
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  {
    key:   "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy",   value: CSP },
]

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    // Include the built embed widget so the /embed.js route handler can readFileSync it on Vercel
    '/embed.js': ['./public/embed.js'],
  },
  async headers() {
    return [
      // Security headers on all routes
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // CORS for embed widget public endpoints — these must be reachable from any
      // third-party site that embeds the widget, so we allow all origins.
      // Authenticated endpoints (documents, bots) are NOT listed here — they rely
      // on the browser's cookie+credentials rules which already block cross-origin.
      {
        source: "/api/v1/chat",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      {
        source: "/api/v1/widget-config",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      {
        source: "/api/v1/leads",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      {
        source: "/api/v1/rating",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      {
        source: "/api/v1/feedback",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default nextConfig;
