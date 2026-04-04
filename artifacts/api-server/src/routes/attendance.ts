import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { attendanceTable, bookingsTable, walkInsTable, classesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { CheckInToClassBody } from "@workspace/api-zod";
import { z } from "zod";

const WalkInBody = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  classId: z.number().int().positive(),
});

const router: IRouter = Router();

router.post("/attendance/checkin", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CheckInToClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { classId } = parsed.data;

  try {
    const booking = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.userId, req.user.id),
          eq(bookingsTable.classId, classId),
          eq(bookingsTable.status, "active"),
        ),
      )
      .limit(1);

    if (booking.length === 0) {
      res.status(400).json({ error: "No active booking found for this class" });
      return;
    }

    const existing = await db
      .select()
      .from(attendanceTable)
      .where(
        and(
          eq(attendanceTable.userId, req.user.id),
          eq(attendanceTable.classId, classId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Already checked in to this class" });
      return;
    }

    const [record] = await db
      .insert(attendanceTable)
      .values({ userId: req.user.id, classId })
      .returning();

    res.status(201).json({
      id: record.id,
      userId: record.userId,
      classId: record.classId,
      checkedInAt: record.checkedInAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Check-in failed");
    res.status(500).json({ error: "Check-in failed. Please try again." });
  }
});

router.get("/attendance/my", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const records = await db
      .select()
      .from(attendanceTable)
      .where(eq(attendanceTable.userId, req.user.id));

    res.json(
      records.map((r) => ({
        classId: r.classId,
        checkedInAt: r.checkedInAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get check-ins");
    res.status(500).json({ error: "Failed to fetch check-ins" });
  }
});

router.post("/attendance/walkin", async (req, res) => {
  const parsed = WalkInBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body. Provide firstName, lastName, email, and classId." });
    return;
  }

  const { firstName, lastName, email, classId } = parsed.data;

  try {
    const cls = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.id, classId))
      .limit(1);

    if (cls.length === 0) {
      res.status(404).json({ error: "Class not found" });
      return;
    }

    const [record] = await db
      .insert(walkInsTable)
      .values({ firstName, lastName, email, classId })
      .returning();

    res.status(201).json({
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      classId: record.classId,
      checkedInAt: record.checkedInAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Walk-in check-in failed");
    res.status(500).json({ error: "Check-in failed. Please try again." });
  }
});

export default router;
