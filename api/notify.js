/**
 * /api/notify.js  —  EC-ERP Assignment Email Sender
 * Vercel Serverless Function (Node.js runtime)
 *
 * ── HOW TO SWAP EMAIL PROVIDER ──
 *
 * Currently wired to Resend (free tier, zero config).
 * When IT approves corporate SMTP, replace the SEND block below
 * with nodemailer + your SMTP credentials. Nothing else changes.
 *
 * ── VERCEL ENV VARS NEEDED ──
 *   RESEND_API_KEY   → get from resend.com (free)
 *   EMAIL_FROM       → e.g. "EC-ERP <noreply@enevo-group.com>"
 *
 * When switching to corporate SMTP, replace with:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
 */

export const config = { runtime: "edge" };

const BRAND_COLOR  = "#0ea5e9";
const COMPANY_NAME = "ENEVO Group";

// ── Email HTML template ──
function buildHtml({ recipientName, assignedBy, type, projectName, itemName, dueDate, notes }) {
  const typeLabel = {
    activity:   "Task Activity",
    subproject: "Sub-Project",
    project:    "Project",
  }[type] || "Assignment";

  const itemLabel = {
    activity:   "Activity",
    subproject: "Sub-Project",
    project:    "Project",
  }[type] || "Item";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>New Assignment — EC-ERP</title></head>
<body style="margin:0;padding:0;background:#f0f4f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f2a50,#0ea5e9);padding:28px 36px;">
            <div style="font-family:'Segoe UI',monospace;font-size:11px;color:#7dd3fc;letter-spacing:.2em;font-weight:600;margin-bottom:6px;">ENEVO GROUP · EC-ERP</div>
            <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-.02em;">New ${typeLabel} Assigned</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px;">
            <p style="margin:0 0 20px;font-size:15px;color:#1e293b;">
              Hi <strong>${recipientName}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
              You have been assigned to a new ${typeLabel.toLowerCase()} in <strong>${COMPANY_NAME} EC-ERP</strong>
              ${assignedBy ? ` by <strong>${assignedBy}</strong>` : ""}.
            </p>

            <!-- Assignment card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border-radius:8px;border:1px solid #bfdbfe;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <div style="font-size:10px;font-weight:700;color:${BRAND_COLOR};letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;">${itemLabel} Details</div>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:5px 0;font-size:12px;color:#64748b;width:110px;font-weight:600;">Project</td>
                      <td style="padding:5px 0;font-size:13px;color:#0f172a;font-weight:700;">${projectName}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;font-size:12px;color:#64748b;font-weight:600;">${itemLabel}</td>
                      <td style="padding:5px 0;font-size:13px;color:#0f172a;font-weight:700;">${itemName}</td>
                    </tr>
                    ${dueDate ? `<tr>
                      <td style="padding:5px 0;font-size:12px;color:#64748b;font-weight:600;">Due Date</td>
                      <td style="padding:5px 0;font-size:13px;color:#0f172a;">${dueDate}</td>
                    </tr>` : ""}
                    ${notes ? `<tr>
                      <td style="padding:5px 0;font-size:12px;color:#64748b;font-weight:600;vertical-align:top;">Notes</td>
                      <td style="padding:5px 0;font-size:13px;color:#475569;font-style:italic;">${notes}</td>
                    </tr>` : ""}
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 24px;font-size:13px;color:#64748b;line-height:1.6;">
              Please log in to EC-ERP to review your assignment, update progress, and post your hours.
            </p>

            <!-- CTA button -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:linear-gradient(135deg,#0ea5e9,#0369a1);border-radius:7px;">
                  <a href="https://ec-erp-egypt.vercel.app" style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:.03em;">
                    Open EC-ERP →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#94a3b8;">
              This is an automated message from EC-ERP. Do not reply to this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:16px 36px;border-top:1px solid #e2e8f0;">
            <div style="font-size:11px;color:#94a3b8;text-align:center;">
              ${COMPANY_NAME} · EC-ERP System · Confidential
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Main handler ──
export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const { to, recipientName, assignedBy, type, projectName, itemName, dueDate, notes } = body;

  if (!to || !recipientName || !type || !projectName || !itemName) {
    return new Response("Missing required fields", { status: 400 });
  }

  const subject = `[EC-ERP] You've been assigned to: ${itemName} — ${projectName}`;
  const html    = buildHtml({ recipientName, assignedBy, type, projectName, itemName, dueDate, notes });

  // ══════════════════════════════════════════════════
  // SEND BLOCK — swap this section for corporate SMTP
  // ══════════════════════════════════════════════════
  const apiKey  = process.env.RESEND_API_KEY;
  const from    = process.env.EMAIL_FROM || `EC-ERP <noreply@enevo-group.com>`;

  if (!apiKey) {
    // No key configured yet — log and return success so app doesn't break
    console.warn("[notify] RESEND_API_KEY not set — email not sent to:", to);
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[notify] Resend error:", err);
    return new Response(JSON.stringify({ ok: false, error: err }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }
  // ══════════════════════════════════════════════════

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
}
