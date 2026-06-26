/**
 * Cloudflare Pages Function — POST /api/waitlist
 *
 * Required environment variables (set in CF Pages → Settings → Variables):
 *   AIRTABLE_PAT       Personal Access Token (scopes: data.records:write)
 *   AIRTABLE_BASE_ID   e.g. appXXXXXXXXXXXXXX
 *   RESEND_API_KEY     From resend.com (free: 3 000 emails/mo)
 *   NOTIFY_EMAIL       getkofa@gmail.com
 *   FROM_EMAIL         noreply@yourdomain.com (must be verified in Resend)
 */

const AIRTABLE_TABLE = 'Waitlist';

export async function onRequestPost({ request, env }) {
  /* CORS preflight */
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

  const { name, email, company, position, sector, phone, comments, source, ts } = body;

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
          Name:     name,
          Email:    email,
          Company:  company  || '',
          Position: position || '',
          Sector:   sector   || '',
          Phone:    phone    || '',
          Comments: comments || '',
          Source:   source   || 'Website',
          Status:   'New',
        },
      }),
    }
  );

  if (!atRes.ok) {
    const err = await atRes.text();
    console.error('Airtable error:', err);
    return new Response(JSON.stringify({ error: 'Airtable save failed' }), { status: 502, headers });
  }

  /* ── 2. Notify getkofa@gmail.com (admin) ── */
  await sendEmail(env, {
    to:      env.NOTIFY_EMAIL,
    subject: `New Waitlist signup — ${name} @ ${company}`,
    html: `
      <h2 style="font-family:sans-serif">New Waitlist Signup</h2>
      <table style="font-family:sans-serif;border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#6B7178">Name</td><td><strong>${name}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6B7178">Email</td><td>${email}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6B7178">Company</td><td>${company}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6B7178">Position</td><td>${position}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6B7178">Sector</td><td>${sector}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6B7178">Phone</td><td>${phone || '—'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6B7178">Comments</td><td>${comments || '—'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#6B7178">Submitted</td><td>${ts}</td></tr>
      </table>`,
  });

  /* ── 3. Auto-reply to submitter ── */
  await sendEmail(env, {
    to:      email,
    subject: 'You\'re on the KOFA waitlist',
    html: `
      <div style="font-family:sans-serif;max-width:560px">
        <h2 style="color:#1F2328">Hi ${name},</h2>
        <p style="color:#6B7178;line-height:1.6">
          Thank you for joining the KOFA waitlist. We're building AI operational systems
          for SMBs and we'll reach out personally when we're ready — no automated blasts,
          just a real conversation.
        </p>
        <p style="color:#6B7178;line-height:1.6">Talk soon,<br><strong style="color:#1F2328">The KOFA Team</strong></p>
        <p style="font-size:12px;color:#A7ADB3;margin-top:32px">We don't do spam — ever.</p>
      </div>`,
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

async function sendEmail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.FROM_EMAIL, to, subject, html }),
  });
}
