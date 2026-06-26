import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { passwordResetTokensTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendEmail } from "../lib/email";
import {
  createSession,
  clearSession,
  getSessionId,
  deleteSession,
  SESSION_COOKIE,
  SESSION_TTL,
  type SessionData,
} from "../lib/auth";
import { authLimiter } from "../middlewares/rateLimit";

const router: IRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const e = raw.trim().toLowerCase();
  if (!EMAIL_RE.test(e) || e.length > 254) return null;
  return e;
}

function validatePassword(pw: unknown): string | null {
  if (typeof pw !== "string") return "Password is required";
  if (pw.length < 10) return "Password must be at least 10 characters";
  if (pw.length > 200) return "Password is too long";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) {
    return "Password must contain both letters and numbers";
  }
  return null;
}

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

router.get("/auth/user", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

router.post("/auth/register", authLimiter, async (req: Request, res: Response) => {
  const { password, firstName, lastName } = req.body ?? {};
  const email = normalizeEmail(req.body?.email);

  if (!email) {
    res.status(400).json({ error: "A valid email is required" });
    return;
  }
  const pwErr = validatePassword(password);
  if (pwErr) {
    res.status(400).json({ error: pwErr });
    return;
  }

  const cleanFirst = typeof firstName === "string" ? firstName.trim().slice(0, 80) : null;
  const cleanLast = typeof lastName === "string" ? lastName.trim().slice(0, 80) : null;

  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let user;
    try {
      [user] = await db
        .insert(usersTable)
        .values({
          email,
          firstName: cleanFirst || null,
          lastName: cleanLast || null,
          passwordHash,
        })
        .returning();
    } catch (e: any) {
      // Unique-constraint race: another request inserted the same email between our check and insert.
      if (e?.code === "23505") {
        res.status(409).json({ error: "An account with this email already exists" });
        return;
      }
      throw e;
    }

    const sessionData: SessionData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
    };

    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);

    // Send welcome email
    try {
      const name = cleanFirst || "there";
      const appUrl = process.env["APP_URL"] ?? "http://localhost:5000";
      await sendEmail({
        to: email,
        subject: "Welcome to Border City Boxing!",
        text: `Hi ${name},\n\nWelcome to Border City Boxing! Your account has been created successfully.\n\nStart exploring our classes, memberships, and community.\n\nVisit us: ${appUrl}\n\n— Border City Boxing Team`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: #1a1a1a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <img src="https://bordercityboxingclub.com/images/border-city-boxing-club-logo-windsor-ontario.png" alt="Border City Boxing Club" style="max-width: 200px; height: auto;" />
          </div>
          <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your account has been created successfully! We're excited to have you join our community.</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Start exploring our classes, memberships, and meet other members.</p>
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${appUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Get Started</a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Questions? We're here to help!</p>
            <p style="font-size: 14px; color: #666; margin: 0;">— Border City Boxing Team</p>
          </div>
        </div>`,
      });
    } catch (err) {
      req.log.error({ err }, "Failed to send welcome email");
    }

    res.status(201).json({ user: sessionData.user });
  } catch (err) {
    req.log.error({ err }, "Registration failed");
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

router.post("/auth/login", authLimiter, async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body?.email);
  const { password } = req.body ?? {};

  if (!email || typeof password !== "string" || password.length === 0) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const sessionData: SessionData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
    };

    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);
    res.json({ user: sessionData.user });
  } catch (err) {
    req.log.error({ err }, "Login failed");
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

router.post("/auth/forgot-password", authLimiter, async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body?.email);
  // Always respond the same to prevent email enumeration.
  const genericResponse = { ok: true };

  if (!email) {
    res.json(genericResponse);
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      res.json(genericResponse);
      return;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const appUrl = process.env["APP_URL"] ?? "http://localhost:5000";
    const link = `${appUrl}/reset-password?token=${rawToken}`;

    try {
      const name = user.firstName || "there";
      await sendEmail({
        to: email,
        subject: "Reset your Border City Boxing password",
        text: `Hi ${name},\n\nWe received a request to reset your Border City Boxing account password.\n\nClick the link below within 30 minutes to set a new password:\n\n${link}\n\nIf you didn't request this, you can safely ignore this email — your password will not change.\n\n— Border City Boxing Team`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: #1a1a1a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <img src="https://bordercityboxingclub.com/images/border-city-boxing-club-logo-windsor-ontario.png" alt="Border City Boxing Club" style="max-width: 200px; height: auto;" />
          </div>
          <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 8px 8px;">
            <h2 style="margin: 0 0 20px 0; font-size: 22px; color: #1a1a1a;">Password Reset Request</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We received a request to reset your Border City Boxing account password. Click the button below within <strong>30 minutes</strong> to set a new one.</p>
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${link}" style="background: #1a1a1a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset My Password</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 13px; color: #888; word-break: break-all; margin-bottom: 20px;">${link}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 14px; color: #666; margin: 0;">If you didn't request a password reset, you can safely ignore this email — your password will not change.</p>
            <p style="font-size: 14px; color: #666; margin-top: 10px;">— Border City Boxing Team</p>
          </div>
        </div>`,
      });
    } catch (err) {
      req.log.error({ err }, "Failed to send reset email");
    }

    res.json(genericResponse);
  } catch (err) {
    req.log.error({ err }, "forgot-password failed");
    res.json(genericResponse);
  }
});

router.post("/auth/reset-password", authLimiter, async (req: Request, res: Response) => {
  const { token, password } = req.body ?? {};

  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Reset token is required" });
    return;
  }
  const pwErr = validatePassword(password);
  if (pwErr) {
    res.status(400).json({ error: pwErr });
    return;
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const [record] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.tokenHash, tokenHash))
      .limit(1);

    if (!record || record.usedAt || new Date(record.expiresAt) <= new Date()) {
      res.status(400).json({ error: "Reset link is invalid or expired" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, record.userId));

    await db
      .update(passwordResetTokensTable)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokensTable.id, record.id));

    // Invalidate all existing sessions for this user.
    await db.execute(
      sql`DELETE FROM ${sessionsTable} WHERE sess->'user'->>'id' = ${record.userId}`
    );

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "reset-password failed");
    res.status(500).json({ error: "Failed to reset password" });
  }
});

router.post("/auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.json({ success: true });
});

export default router;
