# KOFA — Integration Setup Guide

Three services to wire up. Do them in order — each takes ~10 minutes.

---

## 1. Airtable — Create the Base & Tables

### Create base
1. Go to airtable.com → **+ Add a base** → name it **"KOFA Contacts"**

### Waitlist table

Rename "Table 1" to **Waitlist** and add these fields:

| Field name | Field type | Notes |
|------------|-----------|-------|
| Name | Single line text | Primary field (rename from "Name") |
| Email | Email | |
| Company | Single line text | |
| Position | Single line text | |
| Sector | Single line text | |
| Phone | Phone number | |
| Comments | Long text | |
| Source | Single select | Add option: **Website** |
| Status | Single select | Options: **New · Qualified Lead · Nurture · Churned** |
| Date | Created time | Auto-fills on record creation |

### Investors table

Click **+ Add a table** → name it **Investors**:

| Field name | Field type | Notes |
|------------|-----------|-------|
| Name | Single line text | Primary field |
| Email | Email | |
| Firm | Single line text | |
| Why KOFA? | Long text | |
| Status | Single select | Options: **New · Qualified · Pitched · Pass** |
| Priority | Single select | Options: **High · Medium · Low** |
| Date | Created time | |

### Get your credentials
- **Base ID**: Open the base → Help → API docs → copy `appXXXXXXXXXX` from the URL
- **Personal Access Token (PAT)**:
  - airtable.com → Account → Developer Hub → Personal access tokens → **+ Create token**
  - Scopes: `data.records:write`, `data.records:read`
  - Access: select **KOFA Contacts** base
  - Copy the token (shown once)

---

## 2. Resend — Transactional Email

Resend handles the notification emails sent by the Cloudflare Functions. Free tier = 3 000 emails/month.

1. Go to **resend.com** → Sign up
2. **Domains** → Add Domain → verify your domain (add the DNS records it gives you)
   - If you don't have a domain yet, use `onboarding@resend.dev` as `FROM_EMAIL` for testing only
3. **API Keys** → Create API Key → copy it

---

## 3. EmailJS — Frontend Email (GitHub Pages compatible)

EmailJS sends the notification email directly from the browser. No backend required. Free = 200 emails/month.

1. Go to **emailjs.com** → Sign up free
2. **Email Services** → Add Service → choose **Gmail** → connect `getkofa@gmail.com` → copy the **Service ID**
3. **Email Templates** → Create template × 2:

### Template: Waitlist notification (name it `kofa_waitlist`)
Subject: `New Waitlist signup — {{from_name}} @ {{company}}`

Body:
```
New waitlist signup:

Name:     {{from_name}}
Email:    {{from_email}}
Company:  {{company}}
Position: {{position}}
Sector:   {{sector}}
Phone:    {{phone}}
Comments: {{comments}}
```

### Template: Investor notification (name it `kofa_investor`)
Subject: `Investor inquiry — {{from_name}} @ {{firm}}`

Body:
```
New investor inquiry:

Name:  {{from_name}}
Email: {{from_email}}
Firm:  {{firm}}

Why KOFA?
{{why_kofa}}
```

4. **Account → API Keys** → copy your **Public Key**

### Fill in index.html

Open `index.html` and update these 4 constants near the top of the `<script>` block:

```js
var EMAILJS_PUBLIC_KEY    = 'your_public_key_here';
var EMAILJS_SERVICE_ID    = 'your_service_id_here';   // e.g. service_xxxxxxx
var EMAILJS_TPL_WAITLIST  = 'kofa_waitlist';
var EMAILJS_TPL_INVESTOR  = 'kofa_investor';
```

---

## 4. Cloudflare Pages — Deploy & Set Env Vars

The `functions/api/` folder is auto-detected by Cloudflare Pages as serverless functions.

### Deploy
1. Push this repo to GitHub
2. Cloudflare Dashboard → **Pages** → Create project → Connect GitHub repo
3. Build settings: leave blank (static site)
4. Deploy

### Environment variables
Pages → your project → **Settings → Environment variables → Add variable**:

| Variable | Value |
|----------|-------|
| `AIRTABLE_PAT` | Your Airtable Personal Access Token |
| `AIRTABLE_BASE_ID` | e.g. `appXXXXXXXXXXXXXX` |
| `RESEND_API_KEY` | Your Resend API key |
| `FROM_EMAIL` | `noreply@yourdomain.com` (verified in Resend) |
| `NOTIFY_EMAIL` | `getkofa@gmail.com` |

Add to both **Production** and **Preview** environments.

---

## 5. Airtable Automations

Set these up in Airtable → **Automations** tab.

### Automation 1 — Waitlist auto-reply
- **Trigger**: When record created in **Waitlist**
- **Action**: Send email
  - To: `{Email}` field
  - Subject: `You're on the KOFA waitlist`
  - Body: *(paste the HTML auto-reply from `functions/api/waitlist.js` or write your own)*

### Automation 2 — Investor pass decline
- **Trigger**: When record updated in **Investors**, field **Status** → **Pass**
- **Action**: Send email
  - To: `{Email}` field
  - Subject: `Re: Your KOFA investor inquiry`
  - Body:
    > Hi `{Name}`, thank you for reaching out about KOFA. After reviewing your inquiry, we don't think we're the right fit at this stage — but we appreciate your interest and wish you well. Feel free to reconnect in the future.

> ⚠️ Per CLAUDE.md: never let automation send investor replies without human review. Enable this automation only after you've manually set Status → Pass for each record.

---

## Data Flow Summary

```
Form submit
  │
  ├─ EmailJS (browser) ──────────────────► getkofa@gmail.com notification
  │
  └─ POST /api/waitlist or /api/investor-inquiry (Cloudflare Function)
       │
       ├─ Airtable REST API ─────────────► Record saved (Status: New)
       │
       ├─ Resend ───────────────────────► getkofa@gmail.com notification (server copy)
       │
       └─ Resend ───────────────────────► Auto-reply to submitter (waitlist only)
                                          (investor: manual review first)
```
