import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  coachesTable,
  coachClassSigninsTable,
  classesTable,
  usersTable,
  attendanceTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import {
  RegisterAsCoachBody,
  CoachSignInToClassParams,
  CoachSignOutFromClassParams,
  GetClassRosterParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const COACH_CODE = process.env.COACH_CODE ?? "BCB-COACH-2024";

router.get("/coaches/status", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const coach = await db
      .select()
      .from(coachesTable)
      .where(eq(coachesTable.userId, req.user.id))
      .limit(1);

    res.json({ isCoach: coach.length > 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to check coach status");
    res.status(500).json({ error: "Failed to check coach status" });
  }
});

router.post("/coaches/register", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = RegisterAsCoachBody.safeParse(req.body);
  if (!parsed.success || parsed.data.code !== COACH_CODE) {
    res.status(400).json({ error: "Invalid coach registration code" });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(coachesTable)
      .where(eq(coachesTable.userId, req.user.id))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Already registered as a coach" });
      return;
    }

    await db.insert(coachesTable).values({ userId: req.user.id });
    res.status(201).json({ isCoach: true });
  } catch (err) {
    req.log.error({ err }, "Failed to register coach");
    res.status(500).json({ error: "Failed to register as coach" });
  }
});

router.post("/classes/:classId/coach-signin", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CoachSignInToClassParams.safeParse({ classId: Number(req.params.classId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid class ID" });
    return;
  }

  const { classId } = parsed.data;

  try {
    const coach = await db
      .select()
      .from(coachesTable)
      .where(eq(coachesTable.userId, req.user.id))
      .limit(1);

    if (coach.length === 0) {
      res.status(403).json({ error: "Not a registered coach" });
      return;
    }

    const existing = await db
      .select()
      .from(coachClassSigninsTable)
      .where(
        and(
          eq(coachClassSigninsTable.classId, classId),
          eq(coachClassSigninsTable.userId, req.user.id)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Already signed in to this class" });
      return;
    }

    const [signin] = await db
      .insert(coachClassSigninsTable)
      .values({ classId, userId: req.user.id })
      .returning();

    res.status(201).json(signin);
  } catch (err) {
    req.log.error({ err }, "Failed to sign in as coach");
    res.status(500).json({ error: "Failed to sign in to class" });
  }
});

router.delete("/classes/:classId/coach-signin", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CoachSignOutFromClassParams.safeParse({ classId: Number(req.params.classId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid class ID" });
    return;
  }

  const { classId } = parsed.data;

  try {
    const coach = await db
      .select()
      .from(coachesTable)
      .where(eq(coachesTable.userId, req.user.id))
      .limit(1);

    if (coach.length === 0) {
      res.status(403).json({ error: "Not a registered coach" });
      return;
    }

    await db
      .delete(coachClassSigninsTable)
      .where(
        and(
          eq(coachClassSigninsTable.classId, classId),
          eq(coachClassSigninsTable.userId, req.user.id)
        )
      );

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to sign out from class");
    res.status(500).json({ error: "Failed to sign out from class" });
  }
});

router.get("/classes/:classId/roster", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = GetClassRosterParams.safeParse({ classId: Number(req.params.classId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid class ID" });
    return;
  }

  const { classId } = parsed.data;

  try {
    const coach = await db
      .select()
      .from(coachesTable)
      .where(eq(coachesTable.userId, req.user.id))
      .limit(1);

    if (coach.length === 0) {
      res.status(403).json({ error: "Not a registered coach" });
      return;
    }

    const [checkIns, coachSignins] = await Promise.all([
      db
        .select({
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          checkedInAt: attendanceTable.checkedInAt,
        })
        .from(attendanceTable)
        .innerJoin(usersTable, eq(attendanceTable.userId, usersTable.id))
        .where(eq(attendanceTable.classId, classId)),
      db
        .select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
        .from(coachClassSigninsTable)
        .innerJoin(usersTable, eq(coachClassSigninsTable.userId, usersTable.id))
        .where(eq(coachClassSigninsTable.classId, classId)),
    ]);

    const coachesSignedIn = coachSignins.map(
      (c) => `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Coach",
    );

    res.json({
      attendees: checkIns.map((c) => ({
        firstName: c.firstName,
        lastName: c.lastName,
        checkedInAt: c.checkedInAt.toISOString(),
      })),
      totalAttending: checkIns.length,
      coachesSignedIn,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get roster");
    res.status(500).json({ error: "Failed to fetch roster" });
  }
});

export default router;
