// High-level notification helpers. These compose plain-English emails for the
// customer-facing flows we care about (membership activation, expiry reminder)
// and forward them to the SES-backed sendEmail.
//
// Every function here is fire-and-forget at the call site — failures must not
// break the underlying business action (e.g. a paid signup). Callers should
// `.catch()` so a bad SES send is logged but ignored.

import { sendEmail } from "./email";
import { logger } from "./logger";

const APP_URL = process.env["APP_URL"] ?? "http://localhost:5000";

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function planLabel(plan: "single" | "family"): string {
  return plan === "family" ? "Family" : "Single";
}

// ---------------- Welcome / membership activated ----------------

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
  const greeting = ctx.firstName ? `Hi ${ctx.firstName},` : "Hi,";
  const family =
    ctx.plan === "family" && ctx.familyMembers.length > 0
      ? `\nFamily members on plan:\n` +
        ctx.familyMembers
          .map((fm, i) => `  ${i + 1}. ${fm.firstName} ${fm.lastName}`)
          .join("\n") +
        `\n`
      : "";
  const text =
    `${greeting}\n` +
    `\n` +
    `Welcome to Border City Boxing! Your ${planLabel(ctx.plan)} membership is now active.\n` +
    `\n` +
    `Plan:    ${planLabel(ctx.plan)} — ${ctx.termMonths} month${ctx.termMonths > 1 ? "s" : ""}\n` +
    `Paid:    CA${dollars(ctx.priceCents)}\n` +
    `Started: ${fmtDate(ctx.startedAt)}\n` +
    `Expires: ${fmtDate(ctx.expiresAt)}\n` +
    family +
    `\n` +
    `You're signed up for unlimited classes — Youth Rec, Rec, and Rock Steady. Drop in anytime.\n` +
    `\n` +
    `Browse and book classes: ${APP_URL}/classes\n` +
    `\n` +
    `See you in the gym.\n` +
    `\n` +
    `— Border City Boxing\n`;
  try {
    await sendEmail({
      to: ctx.email,
      subject: `Welcome to Border City Boxing — ${planLabel(ctx.plan)} membership active`,
      text,
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
  const greeting = ctx.firstName ? `Hi ${ctx.firstName},` : "Hi,";
  const dayWord = ctx.daysLeft === 1 ? "tomorrow" : `in ${ctx.daysLeft} days`;
  const urgency =
    ctx.daysLeft === 1
      ? "Don't lose your spot — renew today to avoid a gap in your membership."
      : ctx.daysLeft <= 3
        ? "Renew now to keep your spot without interruption."
        : "Plenty of time to renew, but heads up so it doesn't sneak up on you.";
  const text =
    `${greeting}\n` +
    `\n` +
    `Your ${planLabel(ctx.plan)} membership expires ${dayWord} — on ${fmtDate(ctx.expiresAt)}.\n` +
    `\n` +
    `${urgency}\n` +
    `\n` +
    `Renew here: ${APP_URL}/membership\n` +
    `\n` +
    `— Border City Boxing\n`;
  try {
    await sendEmail({
      to: ctx.email,
      subject: `Your membership expires ${dayWord}`,
      text,
    });
  } catch (err) {
    logger.error({ err, to: ctx.email }, "[notifications] expiry reminder failed");
  }
}
