import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const FROM = process.env.SES_FROM_EMAIL ?? "contact@bordercityboxingclub.com";

async function send(to: string, subject: string, html: string) {
  await ses.send(
    new SendEmailCommand({
      Source: `Border City Boxing <${FROM}>`,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: { Html: { Data: html, Charset: "UTF-8" } },
      },
    })
  );
}

export async function sendWelcomeEmail(to: string, firstName: string | null) {
  const name = firstName ?? "Member";
  await send(
    to,
    "Welcome to Border City Boxing Club!",
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h1 style="color:#e11d48;">Welcome to Border City Boxing, ${name}!</h1>
      <p>Your account has been created successfully.</p>
      <p>You can now browse classes and purchase a membership at
        <a href="https://bordercityboxingclub.com">bordercityboxingclub.com</a>.
      </p>
      <p>See you in the gym!</p>
      <p style="color:#6b7280;font-size:13px;">Border City Boxing Club &bull; 1072 Drouillard Rd, Windsor, ON N8Y 2P8</p>
    </div>
    `
  );
}

export async function sendRenewalReminderEmail(
  to: string,
  firstName: string | null,
  plan: string,
  expiresAt: Date
) {
  const name = firstName ?? "Member";
  const planLabel: Record<string, string> = {
    single: "Single",
    family: "Family",
    rock_steady: "Rock Steady",
    womens_only: "Women's Only",
  };
  const label = planLabel[plan] ?? plan;
  const expiry = expiresAt.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

  await send(
    to,
    "Your Border City Boxing Membership Expires Soon",
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h1 style="color:#e11d48;">Membership Renewal Reminder</h1>
      <p>Hi ${name},</p>
      <p>Your <strong>${label}</strong> membership expires on <strong>${expiry}</strong> — that's in 7 days.</p>
      <p>To keep your access to classes, please renew at:</p>
      <p><a href="https://bordercityboxingclub.com/membership" style="color:#e11d48;font-weight:bold;">bordercityboxingclub.com/membership</a></p>
      <p>See you in the gym!</p>
      <p style="color:#6b7280;font-size:13px;">Border City Boxing Club &bull; 1072 Drouillard Rd, Windsor, ON N8Y 2P8</p>
    </div>
    `
  );
}

export async function sendMembershipReceiptEmail(
  to: string,
  firstName: string | null,
  plan: string,
  amountCents: number
) {
  const name = firstName ?? "Member";
  const planLabel: Record<string, string> = {
    single: "Single",
    family: "Family",
    rock_steady: "Rock Steady",
    womens_only: "Women's Only",
  };
  const label = planLabel[plan] ?? plan;
  const amount = `$${(amountCents / 100).toFixed(2)}`;

  await send(
    to,
    "Your Border City Boxing Membership Receipt",
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h1 style="color:#e11d48;">Payment Received</h1>
      <p>Hi ${name}, thank you for joining Border City Boxing Club!</p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:8px 0;color:#6b7280;">Plan</td>
          <td style="padding:8px 0;font-weight:bold;">${label}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Amount Paid</td>
          <td style="padding:8px 0;font-weight:bold;">${amount}</td>
        </tr>
      </table>
      <p>Your membership is being activated. You'll hear from us shortly.</p>
      <p style="color:#6b7280;font-size:13px;">Border City Boxing Club &bull; 1072 Drouillard Rd, Windsor, ON N8Y 2P8</p>
    </div>
    `
  );
}
