// Compass Burst SVG + Octively wordmark — reused across all email templates.
// Light variant: dark wordmark on white/cream background (most emails).
// Dark variant: light wordmark on near-black background (digest email).

const COMPASS_SVG = `<svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 44,36 L 50,4 L 56,36 Z" fill="#0EA5E9"/>
  <path d="M 64,44 L 96,50 L 64,56 Z" fill="#0EA5E9"/>
  <path d="M 56,64 L 50,96 L 44,64 Z" fill="#0EA5E9"/>
  <path d="M 36,56 L 4,50 L 36,44 Z" fill="#0EA5E9"/>
  <path d="M 55.66,35.86 L 82.53,17.47 L 64.14,44.34 Z" fill="#0EA5E9" fill-opacity="0.55"/>
  <path d="M 64.14,55.66 L 82.53,82.53 L 55.66,64.14 Z" fill="#0EA5E9" fill-opacity="0.55"/>
  <path d="M 44.34,64.14 L 17.47,82.53 L 35.86,55.66 Z" fill="#0EA5E9" fill-opacity="0.55"/>
  <path d="M 35.86,44.34 L 17.47,17.47 L 44.34,35.86 Z" fill="#0EA5E9" fill-opacity="0.55"/>
  <circle cx="50" cy="50" r="6" fill="#0EA5E9"/>
</svg>`

export const LOGO_LIGHT = `
<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
  <tr>
    <td style="vertical-align:middle;padding-right:9px;line-height:0;">${COMPASS_SVG}</td>
    <td style="vertical-align:middle;">
      <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:17px;font-weight:700;letter-spacing:-0.02em;color:#0C0A09;">Octively</span>
    </td>
  </tr>
</table>`

export const LOGO_DARK = `
<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
  <tr>
    <td style="vertical-align:middle;padding-right:9px;line-height:0;">${COMPASS_SVG}</td>
    <td style="vertical-align:middle;">
      <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:17px;font-weight:700;letter-spacing:-0.02em;color:#e5e5e5;">Octively</span>
    </td>
  </tr>
</table>`
