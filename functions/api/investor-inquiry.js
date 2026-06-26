/**
 * Cloudflare Pages Function — POST /api/investor-inquiry
 *
 * Same env vars as waitlist.js (shared Airtable base, shared Resend key).
 * Investor records go to a separate "Investors" table.
 * Admin gets an email immediately. NO auto-reply to investor — review first.
 */

const AIRTABLE_TABLE = 'Investors';

export async function onRequestPost({ request, env }) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { name, email, firm, why, ts } = body;

  /* ── 1. Save to Airtable ── */
  const atRes = await fetch(
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Name:       name,
          Email:      email,
          Firm:       firm,
          'Why KOFA?': why,
          Status:     'New',
          Priority:   'Medium',
        },
      }),
    }
  );

  if (!atRes.ok) {
    const err = await atRes.text();
    console.error('Airtable error:', err);
    return new Response(JSON.stringify({ error: 'Airtable save failed' }), { status: 502, headers });
  }

  /* ── 2. Notify getkofa@gmail.com — admin reviews before any reply ── */
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    env.FROM_EMAIL,
      to:      env.NOTIFY_EMAIL,
      subject: `Investor inquiry — ${name} @ ${firm}`,
      html: `
        <h2 style="font-family:sans-serif">New Investor Inquiry</h2>
        <table style="font-family:sans-serif;border-collapse:collapse">
          <tr><td style="padding:4px 12px 4px 0;color:#6B7178">Name</td><td><strong>${name}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6B7178">Email</td><td>${email}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6B7178">Firm</td><td>${firm}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6B7178">Submitted</td><td>${ts}</td></tr>
        </table>
        <h3 style="font-family:sans-serif;margin-top:24px">Why KOFA?</h3>
        <p style="font-family:sans-serif;color:#1F2328;line-height:1.6;background:#F9FAFB;padding:16px;border-radius:4px">${why}</p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #E5E7EB">
        <p style="font-family:sans-serif;font-size:12px;color:#9CA3AF">
          Review in Airtable before replying. Update Status → "Qualified" to engage,
          or "Pass" to trigger the polite decline automation.
        </p>`,
    }),
  });

  /* No auto-reply to investor — human reviews first per CLAUDE.md workflow */

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
