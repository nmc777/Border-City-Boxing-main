import { sendEmail } from "./email";
import { logger } from "./logger";

const APP_URL = process.env["APP_URL"] ?? "http://localhost:5000";
const LOGO_URL = "https://bordercityboxingclub.com/images/border-city-boxing-club-logo-windsor-ontario.png";

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function planLabel(plan: "single" | "family"): string {
  return plan === "family" ? "Family" : "Single";
}

function emailShell(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#1a1a1a;padding:28px 40px;text-align:center;">
            <img src="${LOGO_URL}" alt="Border City Boxing Club" style="max-width:180px;height:auto;" />
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:40px;color:#333333;">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;border-top:1px solid #eeeeee;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999999;">Border City Boxing Club &bull; 1072 Drouillard Rd, Windsor, ON N8Y 2P8</p>
            <p style="margin:6px 0 0;font-size:12px;color:#999999;">
              <a href="${APP_URL}" style="color:#e53e3e;text-decoration:none;">bordercityboxingclub.com</a>
              &bull; <a href="tel:+12267573988" style="color:#999999;text-decoration:none;">(226) 757-3988</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------- Welcome / membership receipt ----------------

export type WelcomeContext = {
  email: string;
  firstName: string | null;
  plan: "single" | "family";
  termMonths: number;
  priceCents: number;
  startedAt: Date | null;
  expiresAt: Date | null;
  familyMembers: Array<{ firstName: string; lastName: string }>;
};

export async function sendWelcomeEmail(ctx: WelcomeContext): Promise<void> {
  const name = ctx.firstName ?? "there";
  const planName = planLabel(ctx.plan);

  const familyRows =
    ctx.plan === "family" && ctx.familyMembers.length > 0
      ? ctx.familyMembers
          .map(
            (fm) =>
              `<tr>
                <td style="padding:8px 12px;font-size:14px;border-bottom:1px solid #eeeeee;">
                  ${fm.firstName} ${fm.lastName}
                </td>
              </tr>`,
          )
          .join("")
      : "";

  const familySection =
    familyRows
      ? `<div style="margin-top:24px;">
          <p style="font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;color:#666666;margin:0 0 8px;">Family Members on Plan</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eeeeee;border-radius:6px;overflow:hidden;">
            ${familyRows}
          </table>
        </div>`
      : "";

  const html = emailShell(`
    <h2 style="margin:0 0 6px;font-size:24px;color:#1a1a1a;">Welcome to the Club!</h2>
    <p style="margin:0 0 24px;font-size:16px;color:#555555;">Hi ${name}, your membership is now <strong style="color:#22c55e;">active</strong>. Here's your receipt.</p>

    <!-- Receipt box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border:1px solid #eeeeee;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 16px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;color:#666666;">Membership Summary</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#555555;">Plan</td>
              <td style="padding:6px 0;font-size:14px;color:#1a1a1a;font-weight:bold;text-align:right;">${planName} &mdash; ${ctx.termMonths} Month${ctx.termMonths > 1 ? "s" : ""}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#555555;">Amount Paid</td>
              <td style="padding:6px 0;font-size:14px;color:#1a1a1a;font-weight:bold;text-align:right;">CA${dollars(ctx.priceCents)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#555555;">Started</td>
              <td style="padding:6px 0;font-size:14px;color:#1a1a1a;font-weight:bold;text-align:right;">${fmtDate(ctx.startedAt)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#555555;border-top:1px solid #eeeeee;padding-top:12px;">Expires</td>
              <td style="padding:6px 0;font-size:14px;color:#e53e3e;font-weight:bold;text-align:right;border-top:1px solid #eeeeee;padding-top:12px;">${fmtDate(ctx.expiresAt)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${familySection}

    <p style="font-size:15px;color:#555555;margin:24px 0;">Your membership includes <strong>unlimited access</strong> to all classes — Youth Rec, Recreation, and Rock Steady. Drop in anytime.</p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:#e53e3e;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 32px;border-radius:6px;">View My Dashboard</a>
    </div>

    <p style="font-size:13px;color:#999999;margin:0;">Questions? Reply to this email or call us at <a href="tel:+12267573988" style="color:#e53e3e;">(226) 757-3988</a>.</p>
    <p style="font-size:13px;color:#999999;margin:8px 0 0;">See you in the gym &mdash; <strong style="color:#1a1a1a;">Border City Boxing Club</strong></p>
  `);

  const text =
    `Hi ${name},\n\nYour ${planName} membership is now active!\n\n` +
    `Plan:    ${planName} — ${ctx.termMonths} month${ctx.termMonths > 1 ? "s" : ""}\n` +
    `Paid:    CA${dollars(ctx.priceCents)}\n` +
    `Started: ${fmtDate(ctx.startedAt)}\n` +
    `Expires: ${fmtDate(ctx.expiresAt)}\n` +
    (ctx.familyMembers.length > 0
      ? `\nFamily members:\n${ctx.familyMembers.map((fm, i) => `  ${i + 1}. ${fm.firstName} ${fm.lastName}`).join("\n")}\n`
      : "") +
    `\nView your dashboard: ${APP_URL}/dashboard\n\n— Border City Boxing Club\n`;

  try {
    await sendEmail({
      to: ctx.email,
      subject: `Your Border City Boxing membership is active — receipt inside`,
      text,
      html,
    });
  } catch (err) {
    logger.error({ err, to: ctx.email }, "[notifications] welcome email failed");
  }
}

// ---------------- Membership expiry reminder ----------------

export type ExpiryContext = {
  email: string;
  firstName: string | null;
  plan: "single" | "family";
  expiresAt: Date;
  daysLeft: 14 | 7 | 3 | 1;
};

export async function sendExpiryReminder(ctx: ExpiryContext): Promise<void> {
  const name = ctx.firstName ?? "there";
  const planName = planLabel(ctx.plan);
  const dayWord = ctx.daysLeft === 1 ? "tomorrow" : `in ${ctx.daysLeft} days`;
  const urgencyColor = ctx.daysLeft <= 3 ? "#e53e3e" : "#f59e0b";
  const urgencyText =
    ctx.daysLeft === 1
      ? "Don't lose your spot — renew today to avoid any gap."
      : ctx.daysLeft <= 3
        ? "Renew now to keep your access without interruption."
        : "Heads up — your membership is coming up for renewal.";

  const html = emailShell(`
    <h2 style="margin:0 0 6px;font-size:24px;color:#1a1a1a;">Your membership expires ${dayWord}</h2>
    <p style="margin:0 0 24px;font-size:16px;color:#555555;">Hi ${name},</p>

    <div style="background:${urgencyColor}15;border-left:4px solid ${urgencyColor};border-radius:4px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:15px;color:#1a1a1a;"><strong>${urgencyText}</strong></p>
      <p style="margin:6px 0 0;font-size:14px;color:#555555;">
        Your <strong>${planName}</strong> membership expires on <strong>${fmtDate(ctx.expiresAt)}</strong>.
      </p>
    </div>

    <p style="font-size:15px;color:#555555;margin:0 0 28px;">
      Renew to keep unlimited access to all classes — Youth Rec, Recreation, and Rock Steady.
    </p>

    <div style="text-align:center;margin:0 0 28px;">
      <a href="${APP_URL}/membership" style="display:inline-block;background:#e53e3e;color:#ffffff;text-decoration:none;font-weight:bold;font-size:16px;padding:16px 40px;border-radius:6px;">Renew Now</a>
    </div>

    <p style="font-size:13px;color:#999999;margin:0;">Questions? Call us at <a href="tel:+12267573988" style="color:#e53e3e;">(226) 757-3988</a>.</p>
    <p style="font-size:13px;color:#999999;margin:8px 0 0;">— <strong style="color:#1a1a1a;">Border City Boxing Club</strong></p>
  `);

  const text =
    `Hi ${name},\n\nYour ${planName} membership expires ${dayWord} — on ${fmtDate(ctx.expiresAt)}.\n\n` +
    `${urgencyText}\n\nRenew here: ${APP_URL}/membership\n\n— Border City Boxing Club\n`;

  try {
    await sendEmail({
      to: ctx.email,
      subject: `Your Border City Boxing membership expires ${dayWord} — renew now`,
      text,
      html,
    });
  } catch (err) {
    logger.error({ err, to: ctx.email }, "[notifications] expiry reminder failed");
  }
}
