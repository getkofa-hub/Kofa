 I see the issue — the old `CLAUDE.md` you pasted still has the **Investor Stage** and **Check Size** fields that we removed, and the **Waitlist table** only has Name/Email instead of the full Company/Position/Sector fields we just defined.

Let me generate the corrected, merged version that only changes what we discussed:

---

## Updated `CLAUDE.md` (Merged & Corrected)

```markdown
# KOFA — Coming Soon Page (Sahara AI Style)

## Brand
- Name: KOFA (root: Sankofa — "go back and get it")
- Philosophy: Learn from the past to build the future
- Audience: SMBs seeking AI operational systems
- Reference: Sahara AI — dark, grid background, one interactive centerpiece, hover life, generous spacing

## Color Palette (Strict)

| Name | Hex | Usage |
|------|-----|-------|
| Charcoal | `#1F2328` | Background |
| White | `#FFFFFF` | Header/footer bars, logo text, modal cards |
| Cool Gray | `#A7ADB3` | Tagline, LEARN stage, grid lines |
| Slate Gray | `#6B7178` | Footer hint text, muted elements |
| Coral Orange | `#FF6A3D` | VALIDATE + BUILD stages, logo underline, investor link hover |
| Energy Yellow | `#FFC20E` | IMPROVE stage |
| **Lime Accent** | `#D7EB3B` | **CTA ONLY — never decorative** |

## Layout (Framed, Single Viewport)

```
┌─────────────────────────────┐
│  KOFA              Investors│  ← White header, charcoal logo left, investor link right
├─────────────────────────────┤
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  │  ← Faint grid on charcoal
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  │
│                             │
│         [LEARN]             │  ← Centerpiece: cycling word
│      (hover → 3D tilt)      │
│                             │
│   We learn your business.   │  ← Tagline, Cool Gray
│   We build your system.     │
│                             │
│    ┌───────────────┐        │
│    │ JOIN WAITLIST │        │  ← Lime CTA
│    └───────────────┘        │
│                             │
├─────────────────────────────┤
│                             │  ← White footer (empty/minimal)
└─────────────────────────────┘
```

## Animation Spec

| Element | Behavior | Timing |
|---------|----------|--------|
| **Grid** | Static CSS, faint white lines | No animation |
| **Cycling word** | Crossfade + 10px upward drift | 2.5s per word, 10s loop |
| **Word colors** | LEARN (Cool Gray) → VALIDATE (Coral) → BUILD (Coral) → IMPROVE (Energy Yellow) |
| **3D hover tilt** | CSS `perspective: 1000px`, rotate toward cursor, max ±8deg | Mousemove-driven |
| **Tagline** | Fade in on load | 0.5s delay |
| **CTA border** | Subtle glow pulse | 2s loop, `box-shadow` |
| **CTA hover** | Fill → Lime, text → Charcoal | 0.2s ease |

## Technical

- Single `index.html`, embedded CSS + JS
- No frameworks, no build step, no CDN
- Grid: CSS `repeating-linear-gradient` only
- 3D tilt: vanilla JS mousemove + CSS `transform`
- Deploy: GitHub Pages

## Rules

- Lime (`#D7EB3B`) appears exactly once: the CTA button
- One interactive centerpiece (the word), not many
- Generous spacing — Sahara-style breathing room
- No particles, no canvas, no WebGL, no video

## Forms

### Waitlist Form
- Trigger: JOIN WAITLIST CTA button (center of hero)
- Style: White modal card, max-width 480px, centered
- Success message: "You're on the list. We'll be in touch."

#### Waitlist Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Company** * | Text | ✅ Yes | |
| **Name** * | Text | ✅ Yes | Full name |
| **Position** * | Dropdown | ✅ Yes | Standard Canadian job titles |
| **Business Sector** * | Dropdown | ✅ Yes | Standard Canadian/NS industry sectors |
| **Email** * | Email | ✅ Yes | |
| Phone | Tel | ❌ No | Optional |
| Comments | Textarea | ❌ No | Optional, 3 rows |

**Position dropdown options:**
- Owner / Founder
- CEO / President
- COO
- CFO
- CTO
- VP / Director
- Manager
- Operations Lead
- Business Analyst
- Consultant
- Other

**Business Sector dropdown options:**
- Agriculture, Forestry, Fishing
- Construction
- Manufacturing
- Wholesale Trade
- Retail Trade
- Transportation & Warehousing
- Information & Technology
- Finance & Insurance
- Real Estate
- Professional Services
- Administrative Support
- Education
- Health Care
- Accommodation & Food Services
- Arts, Entertainment, Recreation
- Public Administration
- Other Services

### Investor Form
- Trigger: "Investors" link in top-right of header
- Style: White modal card, max-width 480px, centered
- Success message: "Thank you. We'll review your inquiry and be in touch within 48 hours."

#### Investor Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| **Full Name** * | Text | ✅ Yes | |
| **Email** * | Email | ✅ Yes | |
| **Firm / Organization** * | Text | ✅ Yes | |
| **Why KOFA?** * | Textarea | ✅ Yes | 3 rows, placeholder: "What interests you about KOFA's approach to AI operations for SMBs?" |

**The "Why KOFA?" field is the quality filter.** 2+ specific sentences = real interest. Empty/generic = not serious.

#### Investor Validation Flow

```
Investor submits form
        ↓
Airtable record created (tagged "Investor", Status = "New")
        ↓
Airtable automation → Email YOU with investor details
        ↓
You manually review: check Firm + "Why KOFA?" answer
        ↓
    ┌───┴───┐
  REAL        TOURIST
    ↓           ↓
Send exec      Ignore / polite decline
summary +
deck link
    ↓
Schedule pitch
if they engage
```

## Airtable Workflow (Both Forms)

### Base Structure: "KOFA Contacts"

| Table | Purpose | Fields |
|-------|---------|--------|
| **Waitlist** | SMB prospects | Company, Name, Position, Sector, Email, Phone, Comments, Date, Status |
| **Investors** | Investor inquiries | Name, Email, Firm, Why KOFA?, Date, Status, Priority |

### Automation Flow

**For Waitlist:**
1. Form submit → Create record in "Waitlist" table, Status = "New"
2. Airtable automation → Send branded confirmation email to user
3. Airtable automation → POST email to ESP (Mailchimp/Kit/Beehiiv) for broadcast list
4. You review → Tag as "Qualified Lead" or "Nurture"

**For Investors:**
1. Form submit → Create record in "Investors" table, Status = "New"
2. Airtable automation → Email YOU with investor details (not the investor)
3. You manually review → Update Status: "Qualified" or "Pass"
4. If "Qualified" → You manually send exec summary + Calendly link
5. If "Pass" → Airtable sends polite "not the right fit" auto-reply

### Airtable Setup

**Waitlist Table:**
- Company (Single line text)
- Name (Single line text)
- Position (Single select: Owner/Founder, CEO/President, COO, CFO, CTO, VP/Director, Manager, Operations Lead, Business Analyst, Consultant, Other)
- Business Sector (Single select: Agriculture/Forestry/Fishing, Construction, Manufacturing, Wholesale Trade, Retail Trade, Transportation/Warehousing, Information/Technology, Finance/Insurance, Real Estate, Professional Services, Administrative Support, Education, Health Care, Accommodation/Food Services, Arts/Entertainment/Recreation, Public Administration, Other Services)
- Email (Email)
- Phone (Phone)
- Comments (Long text)
- Date (Created time)
- Status (Single select: New → Qualified Lead → Nurture → Churned)

**Investors Table:**
- Name (Single line text)
- Email (Email)
- Firm (Single line text)
- Why KOFA? (Long text)
- Date (Created time)
- Status (Single select: New → Qualified → Pitched → Pass)
- Priority (Single select: High / Medium / Low)

### Automation Triggers

| Trigger | Action | When |
|---------|--------|------|
| New Waitlist record | Send email to submitter | Instant |
| New Waitlist record | POST to ESP API | Instant |
| New Investor record | Send email to YOU (admin) | Instant |
| Investor Status → "Pass" | Send polite decline email | On status change |

**Note:** Never let AI send external communications without human approval. For waitlist auto-reply (low-stakes), static template is fine. For investor pass/decline, review before sending.

### Practical Limits
- Airtable free tier: 1,000 records per base, limited automation runs/month
- Fine for coming-soon waitlist + investor pipeline
- Don't build full CRM here long-term
```

---

## What Changed vs. Your Old Version

| Section | Old | New | Why |
|---------|-----|-----|-----|
| **Waitlist fields** | Name, Email only | Company, Name, Position, Sector, Email, Phone, Comments | You requested full SMB prospect fields |
| **Waitlist required markers** | Not specified | `*` on Company, Name, Position, Sector, Email | You requested mandatory fields marked |
| **Position dropdown** | Not listed | 11 Canadian job titles | You requested standard Canadian positions |
| **Business Sector dropdown** | Not listed | 17 Canadian/NS industry sectors | You requested standard Canadian sectors |
| **Investor fields** | Included Investment Stage + Check Size | **Removed** — only Name, Email, Firm, Why KOFA? | You said these aren't standard |
| **Investors Airtable table** | Had Stage, Check Size | **Removed** those fields | Matches simplified form |
| **Waitlist Airtable table** | Name, Email, Source, Date, Status | Company, Name, Position, Sector, Email, Phone, Comments, Date, Status | Matches new form fields |

**Everything else (animation, colors, layout, technical stack, rules) is unchanged.**

---

## The Prompt for Claude Code

> **"Read `CLAUDE.md` for the full design spec, then build a single `index.html` coming-soon page for KOFA. No frameworks. No build step. GitHub Pages ready.**
>
> **Layout (unchanged from spec):**
> - White header bar: `KOFA` logo left (charcoal, bold serif), `"Investors"` link right (charcoal, small caps, coral underline on hover)
> - White footer bar: empty
> - Hero: centered cycling word, tagline, `JOIN WAITLIST` CTA
> - Faint CSS grid background on charcoal
>
> **Two modals:**
>
> | | Waitlist | Investors |
> |---|---|---|
> | **Trigger** | Center CTA button | Top-right header link |
> | **Style** | White card, max-width 480px, centered | Same |
> | **Close** | × button, outside click, Escape key | Same |
> | **Validation** | Honeypot + 3s timing check | Same |
> | **Success** | Card swaps to confirmation message | Same |
> | **Action** | `POST /api/waitlist` | `POST /api/investor-inquiry` |
>
> **Waitlist form fields (required marked with *):**
> - Company * (text)
> - Name * (text)
> - Position * (dropdown: Owner/Founder, CEO/President, COO, CFO, CTO, VP/Director, Manager, Operations Lead, Business Analyst, Consultant, Other)
> - Business Sector * (dropdown: Agriculture/Forestry/Fishing, Construction, Manufacturing, Wholesale Trade, Retail Trade, Transportation/Warehousing, Information/Technology, Finance/Insurance, Real Estate, Professional Services, Administrative Support, Education, Health Care, Accommodation/Food Services, Arts/Entertainment/Recreation, Public Administration, Other Services)
> - Email * (email)
> - Phone (tel, optional)
> - Comments (textarea, 3 rows, optional)
> - Success message: `"You're on the list. We'll be in touch."`
>
> **Investor form fields (all required, marked with *):**
> - Full Name * (text)
> - Email * (email)
> - Firm / Organization * (text)
> - Why KOFA? * (textarea, 3 rows, placeholder: `"What interests you about KOFA's approach to AI operations for SMBs?"`)
> - Success message: `"Thank you. We'll review your inquiry and be in touch within 48 hours."`
>
> **Accessibility:** `aria-label` on both triggers, focus trap in modals, `prefers-reduced-motion`
>
> **Responsive:** Modal becomes bottom sheet on mobile
>
> **One file. No external dependencies."**

---

## Quick Copy-Paste

```
Read CLAUDE.md. Build single index.html. White header: KOFA left, Investors link right. Hero unchanged: cycling word, tagline, JOIN WAITLIST CTA. Two modals: Waitlist (Company, Name, Position dropdown, Business Sector dropdown, Email, Phone optional, Comments optional, required fields marked *) and Investors (Name, Email, Firm, Why KOFA textarea). Same card style, close behavior, honeypot, timing check. Waitlist posts to /api/waitlist, Investors to /api/investor-inquiry. One file, no dependencies.
```