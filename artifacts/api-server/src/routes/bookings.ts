import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookingsTable, classesTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { CreateBookingBody, CancelBookingParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/bookings", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const bookings = await db
      .select({
        id: bookingsTable.id,
        classId: bookingsTable.classId,
        userId: bookingsTable.userId,
        bookedAt: bookingsTable.bookedAt,
        status: bookingsTable.status,
        class: {
          id: classesTable.id,
          name: classesTable.name,
          category: classesTable.category,
          instructor: classesTable.instructor,
          description: classesTable.description,
          schedule: classesTable.schedule,
          duration: classesTable.duration,
          capacity: classesTable.capacity,
          location: classesTable.location,
        },
      })
      .from(bookingsTable)
      .innerJoin(classesTable, eq(bookingsTable.classId, classesTable.id))
      .where(eq(bookingsTable.userId, req.user.id));

    const withSpots = await Promise.all(
      bookings.map(async (b) => {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(bookingsTable)
          .where(
            sql`${bookingsTable.classId} = ${b.classId} AND ${bookingsTable.status} = 'active'`
          );
        return {
          ...b,
          class: {
            ...b.class,
            spotsRemaining: Math.max(0, b.class.capacity - count),
          },
        };
      })
    );

    res.json(withSpots);
  } catch (err) {
    req.log.error({ err }, "Failed to list bookings");
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.post("/bookings", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { classId } = parsed.data;

  try {
    const existing = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.classId, classId),
          eq(bookingsTable.userId, req.user.id),
          eq(bookingsTable.status, "active")
        )
      );

    if (existing.length > 0) {
      res.status(409).json({ error: "Already booked for this class" });
      return;
    }

    const cls = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.id, classId))
      .limit(1);

    if (cls.length === 0) {
      res.status(400).json({ error: "Class not found" });
      return;
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookingsTable)
      .where(
        sql`${bookingsTable.classId} = ${classId} AND ${bookingsTable.status} = 'active'`
      );

    if (count >= cls[0].capacity) {
      res.status(400).json({ error: "Class is full" });
      return;
    }

    const [booking] = await db
      .insert(bookingsTable)
      .values({ classId, userId: req.user.id })
      .returning();

    res.status(201).json(booking);
  } catch (err) {
    req.log.error({ err }, "Failed to create booking");
    res.status(500).json({ error: "Failed to create booking" });
  }
});

router.delete("/bookings/:bookingId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CancelBookingParams.safeParse({ bookingId: Number(req.params.bookingId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid booking ID" });
    return;
  }

  const { bookingId } = parsed.data;

  try {
    const existing = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.id, bookingId),
          eq(bookingsTable.userId, req.user.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    await db
      .update(bookingsTable)
      .set({ status: "cancelled" })
      .where(eq(bookingsTable.id, bookingId));

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to cancel booking");
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

export default router;
