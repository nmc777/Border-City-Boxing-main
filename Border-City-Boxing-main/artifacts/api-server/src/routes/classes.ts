import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { classesTable, bookingsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/classes", async (req, res) => {
  try {
    const classes = await db.select().from(classesTable);

    const classesWithSpots = await Promise.all(
      classes.map(async (cls) => {
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(bookingsTable)
          .where(
            sql`${bookingsTable.classId} = ${cls.id} AND ${bookingsTable.status} = 'active'`
          );
        return {
          ...cls,
          spotsRemaining: Math.max(0, cls.capacity - count),
        };
      })
    );

    res.json(classesWithSpots);
  } catch (err) {
    req.log.error({ err }, "Failed to list classes");
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

export default router;
