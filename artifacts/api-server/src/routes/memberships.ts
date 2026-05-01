import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { membershipsTable, familyMembersTable } from "@workspace/db/schema";
import { getMembershipPriceCents, type MembershipPlan, type MembershipTerm } from "@workspace/db/pricing";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { sendEmail } from "../lib/email";
import { sendWelcomeEmail } from "../lib/notifications";

const router: IRouter = Router();

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .refine((v) => {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return false;
    const year = d.getUTCFullYear();
    const currentYear = new Date().getUTCFullYear();
    // Reject pre-1900 (unrealistic) and future dates.
    return year >= 1900 && year <= currentYear && d.getTime() <= Date.now();
  }, "Date of birth must be between 1900 and today");

const familyMemberSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  dob: isoDate,
});

const intakeSchema = z
  .object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    dob: isoDate,
    phone: z.string().min(7).max(30).optional().nullable(),
    addressLine1: z.string().min(1).max(200).optional().nullable(),
    addressLine2: z.string().max(200).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    province: z.string().max(50).optional().nullable(),
    postalCode: z.string().max(20).optional().nullable(),
    country: z.string().min(2).max(3).default("CA"),
    plan: z.enum(["single", "family"]),
    termMonths: z.union([z.literal(1), z.literal(3), z.literal(6)]),
    acceptedTerms: z.boolean(),
    acceptedWaiver: z.boolean(),
    paymentId: z.string().min(1),
    familyMembers: z.array(familyMemberSchema).max(4).optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.acceptedTerms) {
      ctx.addIssue({ code: "custom", path: ["acceptedTerms"], message: "Terms must be accepted" });
    }
    if (!v.acceptedWaiver) {
      ctx.addIssue({ code: "custom", path: ["acceptedWaiver"], message: "Waiver must be accepted" });
    }
    if (v.plan === "family") {
      const n = v.familyMembers?.length ?? 0;
      if (n < 2 || n > 4) {
        ctx.addIssue({
          code: "custom",
          path: ["familyMembers"],
          message: "Family plan requires 2 to 4 family members",
        });
      }
    }
  });

function addMonths(start: Date, months: number): Date {
  const d = new Date(start);
  d.setMonth(d.getMonth() + months);
  return d;
}

function effectiveStatus(m: typeof membershipsTable.$inferSelect | undefined) {
  if (!m) return { isActive: false, status: "none", expiresAt: null as string | null };
  const expiresAt = m.expiresAt ? m.expiresAt.toISOString() : null;
  const isActive = m.status === "active" && !!m.expiresAt && m.expiresAt.getTime() > Date.now();
  return { isActive, status: m.status, expiresAt };
}

function serializeMembership(m: typeof membershipsTable.$inferSelect) {
  return {
    id: m.id,
    plan: m.plan,
    status: m.status,
    termMonths: m.termMonths,
    priceCents: m.priceCents,
    firstName: m.firstName,
    lastName: m.lastName,
    dob: m.dob,
    phone: m.phone,
    addressLine1: m.addressLine1,
    addressLine2: m.addressLine2,
    city: m.city,
    province: m.province,
    postalCode: m.postalCode,
    country: m.country,
    startedAt: m.startedAt ? m.startedAt.toISOString() : null,
    expiresAt: m.expiresAt ? m.expiresAt.toISOString() : null,
  };
}

router.post("/memberships", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = intakeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid membership data", details: parsed.error.flatten() });
    return;
  }

  const data = parsed.data;
  const now = new Date();
  const expiresAt = addMonths(now, data.termMonths);
  const priceCents = getMembershipPriceCents(
    data.termMonths as MembershipTerm,
    data.plan as MembershipPlan,
  );

  try {
    const membership = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(membershipsTable)
        .values({
          userId: req.user.id,
          plan: data.plan,
          status: "active",
          termMonths: data.termMonths,
          priceCents,
          firstName: data.firstName,
          lastName: data.lastName,
          dob: data.dob,
          phone: data.phone ?? null,
          addressLine1: data.addressLine1 ?? null,
          addressLine2: data.addressLine2 ?? null,
          city: data.city ?? null,
          province: data.province ?? null,
          postalCode: data.postalCode ?? null,
          country: data.country,
          paymentId: data.paymentId,
          termsAcceptedAt: now,
          waiverAcceptedAt: now,
          startedAt: now,
          expiresAt,
        })
        .onConflictDoUpdate({
          target: membershipsTable.userId,
          set: {
            plan: data.plan,
            status: "active",
            termMonths: data.termMonths,
            priceCents,
            firstName: data.firstName,
            lastName: data.lastName,
            dob: data.dob,
            phone: data.phone ?? null,
            addressLine1: data.addressLine1 ?? null,
            addressLine2: data.addressLine2 ?? null,
            city: data.city ?? null,
            province: data.province ?? null,
            postalCode: data.postalCode ?? null,
            country: data.country,
            paymentId: data.paymentId,
            termsAcceptedAt: now,
            waiverAcceptedAt: now,
            startedAt: now,
            expiresAt,
          },
        })
        .returning();

      // Replace family members. Cascade on FK ensures clean state.
      await tx.delete(familyMembersTable).where(eq(familyMembersTable.membershipId, row.id));
      if (data.plan === "family" && data.familyMembers && data.familyMembers.length > 0) {
        await tx.insert(familyMembersTable).values(
          data.familyMembers.map((fm) => ({
            membershipId: row.id,
            firstName: fm.firstName,
            lastName: fm.lastName,
            dob: fm.dob,
          })),
        );
      }

      return row;
    });

    const familyMembers =
      membership.plan === "family"
        ? await db
            .select({
              id: familyMembersTable.id,
              firstName: familyMembersTable.firstName,
              lastName: familyMembersTable.lastName,
              dob: familyMembersTable.dob,
            })
            .from(familyMembersTable)
            .where(eq(familyMembersTable.membershipId, membership.id))
        : [];

    // Notify the gym owner that a new membership was activated. Fire-and-forget;
    // failure here must not break the buyer's success path. The sendEmail helper
    // no-ops when SES env vars are missing, so this is safe in dev too.
    const adminEmail = process.env["ADMIN_EMAIL"];
    if (adminEmail) {
      const buyer = req.user as { email?: string | null; firstName?: string | null; lastName?: string | null };
      const buyerName = `${buyer.firstName ?? ""} ${buyer.lastName ?? ""}`.trim() || "Unknown";
      const dollars = (membership.priceCents / 100).toFixed(2);
      const planLabel = membership.plan === "family" ? "Family" : "Single";
      const familyLines = familyMembers
        .map((fm, i) => `  ${i + 1}. ${fm.firstName} ${fm.lastName} (DOB ${fm.dob})`)
        .join("\n");
      const text =
        `New ${planLabel} plan signup\n` +
        `\n` +
        `Buyer:        ${buyerName} <${buyer.email ?? "no email"}>\n` +
        `Plan:         ${planLabel} — ${membership.termMonths} month${membership.termMonths > 1 ? "s" : ""}\n` +
        `Amount:       CA$${dollars}\n` +
        `Started:      ${membership.startedAt?.toISOString() ?? "unknown"}\n` +
        `Expires:      ${membership.expiresAt?.toISOString() ?? "unknown"}\n` +
        `Square Pmt:   ${membership.paymentId ?? "(none)"}\n` +
        (familyMembers.length > 0
          ? `\nFamily members on plan:\n${familyLines}\n`
          : "") +
        `\nView in dashboard: ${process.env["APP_URL"] ?? "http://localhost:5000"}/admin\n`;
      sendEmail({
        to: adminEmail,
        subject: `New ${planLabel} membership: ${buyerName} (CA$${dollars})`,
        text,
      }).catch((err) => {
        req.log.error({ err }, "Failed to send admin signup notification");
      });
    }

    // Welcome email to the buyer. Fire-and-forget; failures are logged inside.
    const buyerForWelcome = req.user as { email?: string | null; firstName?: string | null };
    if (buyerForWelcome.email) {
      sendWelcomeEmail({
        email: buyerForWelcome.email,
        firstName: buyerForWelcome.firstName ?? null,
        plan: membership.plan,
        termMonths: membership.termMonths,
        priceCents: membership.priceCents,
        startedAt: membership.startedAt,
        expiresAt: membership.expiresAt,
        familyMembers: familyMembers.map((fm) => ({ firstName: fm.firstName, lastName: fm.lastName })),
      }).catch(() => {
        // sendWelcomeEmail already logs; nothing else to do here.
      });
    }

    res.status(201).json({
      membership: serializeMembership(membership),
      familyMembers,
      ...effectiveStatus(membership),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to activate membership");
    res.status(500).json({ error: "Failed to activate membership" });
  }
});

router.get("/me/membership", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(membershipsTable)
      .where(eq(membershipsTable.userId, req.user.id))
      .limit(1);

    const m = rows[0];
    if (!m) {
      res.json({
        membership: null,
        familyMembers: [],
        isActive: false,
        status: "none",
        expiresAt: null,
      });
      return;
    }

    const familyMembers =
      m.plan === "family"
        ? await db
            .select({
              id: familyMembersTable.id,
              firstName: familyMembersTable.firstName,
              lastName: familyMembersTable.lastName,
              dob: familyMembersTable.dob,
            })
            .from(familyMembersTable)
            .where(eq(familyMembersTable.membershipId, m.id))
        : [];

    res.json({
      membership: serializeMembership(m),
      familyMembers,
      ...effectiveStatus(m),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to load membership");
    res.status(500).json({ error: "Failed to load membership" });
  }
});

export default router;
