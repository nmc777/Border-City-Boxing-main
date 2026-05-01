// Mailchimp audience sync — stubbed until MAILCHIMP_API_KEY/AUDIENCE_ID/SERVER_PREFIX are set.
// Build the "expiring soon" / "expired" emails as a Customer Journey in the Mailchimp UI,
// triggered off the EXPIRES_AT merge field. This module just keeps the audience in sync.
import { logger } from "./logger";

type SyncMember = {
  email: string;
  firstName: string;
  lastName: string;
  plan: "single" | "family";
  termMonths: number;
  status: "pending" | "active" | "cancelled";
  expiresAt: Date | null;
};

const apiKey = process.env["MAILCHIMP_API_KEY"];
const audienceId = process.env["MAILCHIMP_AUDIENCE_ID"];
const serverPrefix = process.env["MAILCHIMP_SERVER_PREFIX"]; // e.g. "us21"
const enabled = Boolean(apiKey && audienceId && serverPrefix);

function md5LowerHex(input: string): Promise<string> {
  return import("node:crypto").then(({ createHash }) =>
    createHash("md5").update(input.toLowerCase()).digest("hex")
  );
}

export async function syncMemberToMailchimp(m: SyncMember): Promise<void> {
  if (!enabled) {
    logger.debug({ email: m.email }, "[mailchimp] sync skipped — env not configured");
    return;
  }
  try {
    const subscriberHash = await md5LowerHex(m.email);
    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`;
    const body = {
      email_address: m.email,
      status_if_new: "subscribed",
      merge_fields: {
        FNAME: m.firstName,
        LNAME: m.lastName,
        PLAN: m.plan,
        TERM: String(m.termMonths),
        STATUS: m.status,
        EXPIRES_AT: m.expiresAt ? m.expiresAt.toISOString().slice(0, 10) : "",
      },
    };
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      logger.warn({ status: res.status, text }, "[mailchimp] sync non-2xx");
    }
  } catch (err) {
    logger.error({ err }, "[mailchimp] sync failed");
  }
}

export const mailchimpEnabled = enabled;
