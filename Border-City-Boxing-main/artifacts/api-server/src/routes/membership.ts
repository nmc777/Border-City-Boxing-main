import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { membershipApplicationsTable, participantsTable } from "@workspace/db/schema";
import { z } from "zod";

const ParticipantSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  isUnder18: z.boolean(),
  guardianName: z.string().optional(),
  guardianConsent: z.boolean().optional(),
});

const CreateApplicationSchema = z.object({
  plan: z.enum(["single", "family", "rock_steady", "womens_only"]),
  durationMonths: z.union([z.literal(1), z.literal(3), z.literal(6)]).default(1),
  participants: z.array(ParticipantSchema).min(1).max(4),
  agreedToTerms: z.literal(true),
  agreedToWaiver: z.literal(true),
});

function calcAmountCents(plan: string, participantCount: number, durationMonths: number): number {
  let monthlyBase: number;
  if (plan === "rock_steady" || plan === "womens_only") monthlyBase = 7500;
  else if (plan === "single") monthlyBase = 12500;
  else if (participantCount <= 2) monthlyBase = 12500;
  else if (participantCount === 3) monthlyBase = 18500;
  else monthlyBase = 24500;
  return monthlyBase * durationMonths;
}

const router: IRouter = Router();

router.post("/membership/apply", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "You must be logged in to apply for membership." });
    return;
  }

  const parsed = CreateApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid application data.", details: parsed.error.issues });
    return;
  }

  const { plan, durationMonths, participants, agreedToTerms, agreedToWaiver } = parsed.data;
  const totalAmountCents = calcAmountCents(plan, participants.length, durationMonths);

  try {
    const [application] = await db
      .insert(membershipApplicationsTable)
      .values({
        userId: req.user.id,
        plan,
        durationMonths,
        participantCount: participants.length,
        totalAmountCents,
        agreedToTerms,
        agreedToWaiver,
        agreedAt: new Date(),
      })
      .returning();

    await db.insert(participantsTable).values(
      participants.map((p) => ({
        applicationId: application.id,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: p.dateOfBirth,
        isUnder18: p.isUnder18,
        guardianName: p.guardianName ?? null,
        guardianConsent: p.guardianConsent ?? false,
      }))
    );

    res.status(201).json({ applicationId: application.id, totalAmountCents });
  } catch (err) {
    req.log.error({ err }, "Failed to create membership application");
    res.status(500).json({ error: "Failed to save application. Please try again." });
  }
});

export default router;
