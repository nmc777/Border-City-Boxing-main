// Email sender backed by AWS SES v2. Falls back to console logging when env vars are missing.
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { logger } from "./logger";

const region = process.env["AWS_REGION"] ?? "us-east-1";
const fromAddress = process.env["EMAIL_FROM"]; // e.g. "Border City Boxing <no-reply@bordercityboxing.ca>"
const accessKeyId = process.env["AWS_ACCESS_KEY_ID"];
const secretAccessKey = process.env["AWS_SECRET_ACCESS_KEY"];

const enabled = Boolean(fromAddress && accessKeyId && secretAccessKey);

const client = enabled
  ? new SESv2Client({
      region,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    })
  : null;

export type EmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(opts: EmailOptions): Promise<void> {
  if (!enabled || !client) {
    logger.info(
      { to: opts.to, subject: opts.subject, body: opts.text },
      "[email] SES not configured — logging email instead"
    );
    return;
  }
  try {
    await client.send(
      new SendEmailCommand({
        FromEmailAddress: fromAddress,
        Destination: { ToAddresses: [opts.to] },
        Content: {
          Simple: {
            Subject: { Data: opts.subject, Charset: "UTF-8" },
            Body: {
              Text: { Data: opts.text, Charset: "UTF-8" },
              ...(opts.html ? { Html: { Data: opts.html, Charset: "UTF-8" } } : {}),
            },
          },
        },
      })
    );
  } catch (err) {
    logger.error({ err, to: opts.to }, "[email] SES send failed");
    throw err;
  }
}

export const emailEnabled = enabled;
