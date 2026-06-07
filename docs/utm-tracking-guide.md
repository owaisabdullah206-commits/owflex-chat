# UTM Tracking Guide for Octively

How to track where every signup comes from, so you know which channel to double down on.

---

## What UTM parameters are

UTM parameters are tags you append to any URL you share. When a visitor clicks the link, the tags travel to your site and Google Analytics 4 records them. You can then see exactly which Facebook group, LinkedIn post, or WhatsApp message drove each signup.

There are five tags. Three matter most:

| Parameter | Answers | Example value |
|---|---|---|
| `utm_source` | Where is the link posted? | `facebook`, `linkedin`, `whatsapp`, `x` |
| `utm_medium` | What type of channel is it? | `community`, `social`, `direct`, `email` |
| `utm_campaign` | Which initiative or message? | `pk-freelancers`, `founder-story`, `ph-launch` |
| `utm_term` | What keyword (paid ads) | usually blank |
| `utm_content` | Which version of a post? | `post-1`, `video-link`, `cta-button` |

**Rules:**
- Lowercase only, no spaces. Use hyphens.
- Be consistent. If you write `facebook` once and `Facebook` another time, GA4 treats them as two different sources.
- Every link you share publicly should have at least `utm_source`, `utm_medium`, and `utm_campaign`.

---

## The naming conventions we use

```
# Facebook group posts (Pakistani freelancer communities)
?utm_source=facebook&utm_medium=community&utm_campaign=pk-freelancers

# LinkedIn personal posts (founder story / build-in-public)
?utm_source=linkedin&utm_medium=social&utm_campaign=founder-story

# X / Twitter (Claude Code thread)
?utm_source=x&utm_medium=social&utm_campaign=build-thread

# WhatsApp outreach (personal DMs and group shares)
?utm_source=whatsapp&utm_medium=direct&utm_campaign=outreach

# Product Hunt launch
?utm_source=producthunt&utm_medium=launch&utm_campaign=2026-ph-launch

# Bio links (LinkedIn bio, X bio, Instagram bio)
?utm_source=bio&utm_medium=social&utm_campaign=profile

# Paid tools/calculators (people who used the free tools)
?utm_source=octively-tools&utm_medium=referral&utm_campaign=tool-cta
```

---

## How it works in Octively's codebase

`lib/utm.ts` reads UTM params off the URL on page load and stores them in `localStorage` under the key `oct_utm`. They persist across page views for the session.

When a user completes signup (`signup_complete` event), the GA4 event includes the stored UTM data as custom dimensions. This means GA4 knows the original source even if the user navigated several pages before signing up.

The implementation is already live — you do not need to do anything in the code.

---

## Building short links (admin only)

Instead of sharing a long URL with UTM params, use the Short Links tool in the admin dashboard:

`admin.octively.com/dashboard/admin/links`

1. Paste the destination URL (e.g. `https://octively.com`)
2. Fill in the UTM fields
3. Optionally set a custom code (e.g. `fb-pk-1` gives you `octively.com/r/fb-pk-1`)
4. Copy the short link and share it

The redirect appends the UTM params automatically. Click count is tracked in the dashboard so you can compare link performance without opening GA4.

---

## Reading the results in GA4

1. Open GA4 for `octively.com`
2. Go to **Reports > Acquisition > Traffic acquisition**
3. Change the primary dimension to **Session source / medium**
4. Filter by date range (weekly is most useful for community posts)

The `signup_complete` event also shows up under **Reports > Engagement > Events**. Click it and add **Session source** as a secondary dimension to see which sources drove actual signups (not just visits).

---

## Quick checklist before sharing any link

- [ ] URL has `utm_source`, `utm_medium`, and `utm_campaign`
- [ ] All values are lowercase with hyphens, no spaces
- [ ] You used the naming convention above (so channels group consistently in GA4)
- [ ] If the link will appear in multiple places, use `utm_content` to tell them apart
- [ ] Consider creating a short link via the admin tool so you get click counts too
