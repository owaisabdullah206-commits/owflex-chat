# Dokploy Cron Setup (do this at launch)

The app has two scheduled jobs. On Vercel they run from `vercel.json`, but the
**primary deploy is Dokploy on Hetzner, where `vercel.json` crons do NOT run.**
So you must trigger them from Dokploy.

| Job | Endpoint | Schedule | Needed? |
|-----|----------|----------|---------|
| **Monthly reset** | `GET /api/cron/monthly-reset` | `0 0 1 * *` (00:00 on the 1st) | **Required.** Resets `conversationsThisMonth` / `leadsThisMonth` and replenishes free-tier credits. Without it, free orgs hit their cap forever and the "permanent free" plan breaks. |
| Weekly digest | `GET /api/cron/weekly-digest` | `0 3 * * 1` (Mon 03:00) | Optional. Sends the weekly summary email. Skip until you want it. |

> **Not needed until you have users.** With 0 users these jobs do nothing. Set them up on launch day.

---

## Step 0 — Make sure `CRON_SECRET` is set

Both endpoints require a bearer token. In Dokploy → your app → **Environment**, confirm:

```
CRON_SECRET=<a long random string>
```

If it's missing, add it (any long random value, e.g. `openssl rand -hex 32`) and redeploy.
This is the same secret the endpoints check, so the schedule and the app must share it.

---

## Step 1 — Add the monthly-reset schedule in Dokploy

1. Open Dokploy → select your **application** (the Octively Next.js app).
2. Go to the **Schedules** tab → **Create Schedule**.
3. Fill in:
   - **Name:** `monthly-reset`
   - **Schedule (cron):** `0 0 1 * *`
   - **Shell type:** the container shell (e.g. `/bin/sh`)
   - **Service / container:** the app container (so it runs where `CRON_SECRET` lives)
   - **Command:**
     ```bash
     node -e "fetch('http://localhost:3000/api/cron/monthly-reset',{headers:{Authorization:'Bearer '+process.env.CRON_SECRET}}).then(r=>r.text()).then(t=>console.log('monthly-reset:',t))"
     ```
4. **Save.**

Why this command: `node` + global `fetch` already exist in the container (Node 18+), so
no `curl` install is required, and hitting `localhost` keeps the cron **off the public
internet** — only the app itself ever calls the endpoint.

> If your app listens on a different internal port, change `3000` to match (check the
> app's `PORT` env / Dokploy port mapping).

---

## Step 2 — (Optional) Add the weekly-digest schedule

Repeat Step 1 with:
- **Name:** `weekly-digest`
- **Schedule:** `0 3 * * 1`
- **Command:**
  ```bash
  node -e "fetch('http://localhost:3000/api/cron/weekly-digest',{headers:{Authorization:'Bearer '+process.env.CRON_SECRET}}).then(r=>r.text()).then(t=>console.log('weekly-digest:',t))"
  ```

---

## Step 3 — Test it once, manually

Don't wait until the 1st to find out it's broken. From your machine (replace the secret):

```bash
curl -i -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://admin.octively.com/api/cron/monthly-reset
```

Expected: **HTTP 200** with a body like `{"orgsReset": 0}` (or the number of free orgs).
- `401 Unauthorized` → the secret in the header doesn't match `CRON_SECRET` in Dokploy env.
- `404` → wrong URL / app not deployed.

You can also run the schedule on-demand from the Dokploy Schedules tab (a "Run now" / manual
trigger) and check its logs for the `monthly-reset: {...}` output.

---

## Fallback — external cron (only if Dokploy's scheduler misbehaves)

[cron-job.org](https://cron-job.org) (free) → create a cronjob:
- **URL:** `https://admin.octively.com/api/cron/monthly-reset`
- **Schedule:** 1st of the month, 00:00
- **Request header:** `Authorization: Bearer YOUR_CRON_SECRET`

This hits the **public** URL (slightly less private than the localhost method, but the
bearer still protects it). Use it as a backup, not the primary.

---

## Why not GitHub Actions?

GitHub's scheduled workflows are best-effort: they're routinely **delayed (5–30+ min) or
silently skipped** under load. Fine for non-critical pings, wrong for a billing/limit reset
that must not miss a month. Dokploy uses a real cron — prefer it.
