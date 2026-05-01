import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  adminsTable,
  memberProfilesTable,
  coachesTable,
  classesTable,
  coachClassSigninsTable,
  usersTable,
  membershipsTable,
  attendanceTable,
  walkInsTable,
} from "@workspace/db/schema";
import { eq, and, count, inArray, desc, gte, lt } from "drizzle-orm";
import {
  RegisterAsAdminBody,
  AdminToggleMembershipParams,
  AdminToggleMembershipBody,
  AdminToggleCoachParams,
  AdminToggleCoachBody,
  AdminDeleteClassParams,
  AdminCreateClassBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const ADMIN_CODE = process.env.ADMIN_CODE ?? "BCB-ADMIN-2024";

async function requireAdmin(req: any, res: any): Promise<boolean> {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  const admin = await db
    .select()
    .from(adminsTable)
    .where(eq(adminsTable.userId, req.user.id))
    .limit(1);
  if (admin.length === 0) {
    res.status(403).json({ error: "Forbidden: Admin access required" });
    return false;
  }
  return true;
}

async function buildAdminUser(user: typeof usersTable.$inferSelect) {
  const [coach, member, admin] = await Promise.all([
    db.select().from(coachesTable).where(eq(coachesTable.userId, user.id)).limit(1),
    db.select().from(memberProfilesTable).where(eq(memberProfilesTable.userId, user.id)).limit(1),
    db.select().from(adminsTable).where(eq(adminsTable.userId, user.id)).limit(1),
  ]);
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    isCoach: coach.length > 0,
    isMember: member.length > 0,
    isAdmin: admin.length > 0,
    createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

router.get("/admin/status", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const admin = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.userId, req.user.id))
      .limit(1);
    res.json({ isAdmin: admin.length > 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to check admin status");
    res.status(500).json({ error: "Failed to check admin status" });
  }
});

router.post("/admin/register", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = RegisterAsAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  if (parsed.data.code !== ADMIN_CODE) {
    // Diagnostic: log what bytes arrived vs what we expect, without exposing
    // the actual code in logs. Codepoints flag mojibake / autocorrected dashes.
    req.log.warn(
      {
        receivedLen: parsed.data.code.length,
        expectedLen: ADMIN_CODE.length,
        receivedCodepoints: Array.from(parsed.data.code).map((c) => c.charCodeAt(0)),
        expectedCodepoints: Array.from(ADMIN_CODE).map((c) => c.charCodeAt(0)),
      },
      "admin code mismatch",
    );
    res.status(400).json({ error: "Invalid admin code" });
    return;
  }
  try {
    const existing = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.userId, req.user.id))
      .limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Already registered as admin" });
      return;
    }
    await db.insert(adminsTable).values({ userId: req.user.id });
    res.status(201).json({ isAdmin: true });
  } catch (err) {
    req.log.error({ err }, "Failed to register as admin");
    res.status(500).json({ error: "Failed to register as admin" });
  }
});

router.get("/admin/users", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const users = await db.select().from(usersTable);
    const enriched = await Promise.all(users.map(buildAdminUser));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to list users");
    res.status(500).json({ error: "Failed to list users" });
  }
});

router.patch("/admin/users/:userId/membership", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  const paramsResult = AdminToggleMembershipParams.safeParse(req.params);
  const bodyResult = AdminToggleMembershipBody.safeParse(req.body);
  if (!paramsResult.success || !bodyResult.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { userId } = paramsResult.data;
  const { enabled } = bodyResult.data;
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (user.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const existing = await db
      .select()
      .from(memberProfilesTable)
      .where(eq(memberProfilesTable.userId, userId))
      .limit(1);
    if (enabled && existing.length === 0) {
      await db.insert(memberProfilesTable).values({ userId, status: "active" });
    } else if (!enabled && existing.length > 0) {
      await db.delete(memberProfilesTable).where(eq(memberProfilesTable.userId, userId));
    }
    const updated = await buildAdminUser(user[0]);
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to toggle membership");
    res.status(500).json({ error: "Failed to toggle membership" });
  }
});

router.patch("/admin/users/:userId/coach", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  const paramsResult = AdminToggleCoachParams.safeParse(req.params);
  const bodyResult = AdminToggleCoachBody.safeParse(req.body);
  if (!paramsResult.success || !bodyResult.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { userId } = paramsResult.data;
  const { enabled } = bodyResult.data;
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (user.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const existing = await db
      .select()
      .from(coachesTable)
      .where(eq(coachesTable.userId, userId))
      .limit(1);
    if (enabled && existing.length === 0) {
      await db.insert(coachesTable).values({ userId });
    } else if (!enabled && existing.length > 0) {
      await db.delete(coachesTable).where(eq(coachesTable.userId, userId));
    }
    const updated = await buildAdminUser(user[0]);
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to toggle coach role");
    res.status(500).json({ error: "Failed to toggle coach role" });
  }
});

router.get("/admin/classes", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const classes = await db.select().from(classesTable);
    const enriched = await Promise.all(
      classes.map(async (cls) => {
        const signinRows = await db
          .select({ userId: coachClassSigninsTable.coachUserId })
          .from(coachClassSigninsTable)
          .where(eq(coachClassSigninsTable.classId, cls.id));

        let coachNames: string[] = [];
        if (signinRows.length > 0) {
          const coachUsers = await db
            .select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
            .from(usersTable)
            .where(
              inArray(
                usersTable.id,
                signinRows.map((r) => r.userId)
              )
            );
          coachNames = coachUsers.map(
            (u) => `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Coach"
          );
        }
        return {
          id: cls.id,
          name: cls.name,
          category: cls.category,
          instructor: cls.instructor,
          description: cls.description,
          schedule: cls.schedule,
          duration: cls.duration,
          capacity: cls.capacity,
          location: cls.location ?? "",
          coachesSignedIn: coachNames,
        };
      })
    );
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to list admin classes");
    res.status(500).json({ error: "Failed to list classes" });
  }
});

router.post("/admin/classes", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  const parsed = AdminCreateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid class data", details: parsed.error.flatten() });
    return;
  }
  const { name, category, instructor, description, schedule, duration, capacity, location } =
    parsed.data;
  try {
    const [created] = await db
      .insert(classesTable)
      .values({
        name,
        category: category as any,
        instructor,
        description,
        schedule,
        duration,
        capacity,
        location: location ?? "Main Gym",
      })
      .returning();
    res.status(201).json({
      id: created.id,
      name: created.name,
      category: created.category,
      instructor: created.instructor,
      description: created.description,
      schedule: created.schedule,
      duration: created.duration,
      capacity: created.capacity,
      location: created.location ?? "",
      enrollmentCount: 0,
      coachesSignedIn: [],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create class");
    res.status(500).json({ error: "Failed to create class" });
  }
});

router.delete("/admin/classes/:classId", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  const parsed = AdminDeleteClassParams.safeParse({ classId: Number(req.params.classId) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid class ID" });
    return;
  }
  try {
    await db
      .delete(coachClassSigninsTable)
      .where(eq(coachClassSigninsTable.classId, parsed.data.classId));
    await db.delete(classesTable).where(eq(classesTable.id, parsed.data.classId));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete class");
    res.status(500).json({ error: "Failed to delete class" });
  }
});

router.get("/admin/memberships", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const rows = await db
      .select({
        id: membershipsTable.id,
        userId: membershipsTable.userId,
        plan: membershipsTable.plan,
        rawStatus: membershipsTable.status,
        termMonths: membershipsTable.termMonths,
        priceCents: membershipsTable.priceCents,
        firstName: membershipsTable.firstName,
        lastName: membershipsTable.lastName,
        startedAt: membershipsTable.startedAt,
        expiresAt: membershipsTable.expiresAt,
        createdAt: membershipsTable.createdAt,
        userEmail: usersTable.email,
      })
      .from(membershipsTable)
      .innerJoin(usersTable, eq(usersTable.id, membershipsTable.userId))
      .orderBy(desc(membershipsTable.createdAt));

    const now = Date.now();
    const enriched = rows.map((r) => {
      // Effective status: cancelled stays cancelled; active becomes "expired"
      // when expires_at is in the past. Memberships with no expires_at stay
      // labeled as their raw status.
      let status: "active" | "expired" | "cancelled" | "pending" = r.rawStatus as any;
      if (r.rawStatus === "active" && r.expiresAt && r.expiresAt.getTime() <= now) {
        status = "expired";
      }
      return {
        id: r.id,
        userId: r.userId,
        userEmail: r.userEmail ?? "",
        firstName: r.firstName,
        lastName: r.lastName,
        plan: r.plan,
        termMonths: r.termMonths,
        priceCents: r.priceCents,
        status,
        startedAt: r.startedAt ? r.startedAt.toISOString() : null,
        expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
      };
    });

    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to list memberships");
    res.status(500).json({ error: "Failed to list memberships" });
  }
});

router.get("/admin/attendance", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;

  // Date is YYYY-MM-DD. Defaults to today in the server's timezone.
  // We compute UTC day boundaries from the local-day string for the date filter.
  const dateStr = typeof req.query.date === "string" ? req.query.date : "";
  const baseDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
    ? new Date(dateStr + "T00:00:00")
    : new Date();
  const startOfDay = new Date(baseDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  try {
    // 1. All active classes
    const classes = await db.select().from(classesTable);

    // 2. Authenticated check-ins for this date (members who showed up).
    const attendanceRaw = await db
      .select({
        classId: attendanceTable.classId,
        userId: attendanceTable.userId,
        checkedInAt: attendanceTable.checkedInAt,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
      })
      .from(attendanceTable)
      .innerJoin(usersTable, eq(usersTable.id, attendanceTable.userId))
      .where(
        and(
          gte(attendanceTable.checkedInAt, startOfDay),
          lt(attendanceTable.checkedInAt, endOfDay),
        ),
      );

    // 3. Walk-in sign-ins for this date.
    const walkInsRaw = await db
      .select({
        classId: walkInsTable.classId,
        firstName: walkInsTable.firstName,
        lastName: walkInsTable.lastName,
        email: walkInsTable.email,
        checkedInAt: walkInsTable.checkedInAt,
      })
      .from(walkInsTable)
      .where(
        and(
          gte(walkInsTable.checkedInAt, startOfDay),
          lt(walkInsTable.checkedInAt, endOfDay),
        ),
      );

    // Bucket everything by classId.
    const byClass = new Map<
      number,
      {
        attendance: Array<{ firstName: string | null; lastName: string | null; email: string | null; checkedInAt: string }>;
        walkIns: Array<{ firstName: string; lastName: string; email: string; checkedInAt: string }>;
      }
    >();
    const ensure = (cid: number) => {
      let bucket = byClass.get(cid);
      if (!bucket) {
        bucket = { attendance: [], walkIns: [] };
        byClass.set(cid, bucket);
      }
      return bucket;
    };
    for (const a of attendanceRaw) {
      ensure(a.classId).attendance.push({
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        checkedInAt: a.checkedInAt.toISOString(),
      });
    }
    for (const w of walkInsRaw) {
      ensure(w.classId).walkIns.push({
        firstName: w.firstName,
        lastName: w.lastName,
        email: w.email,
        checkedInAt: w.checkedInAt.toISOString(),
      });
    }

    const result = classes.map((c) => {
      const bucket = byClass.get(c.id) ?? { attendance: [], walkIns: [] };
      return {
        classId: c.id,
        className: c.name,
        schedule: c.schedule,
        capacity: c.capacity,
        // Members who showed up on this date
        attendanceCount: bucket.attendance.length,
        attendance: bucket.attendance,
        // Walk-ins on this date
        walkInsCount: bucket.walkIns.length,
        walkIns: bucket.walkIns,
      };
    });

    res.json({
      date: startOfDay.toISOString().slice(0, 10),
      classes: result,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to load attendance");
    res.status(500).json({ error: "Failed to load attendance" });
  }
});

router.get("/admin/overview", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  try {
    const [membersRes, coachesRes, adminsRes, classesRes] = await Promise.all([
      db.select({ count: count() }).from(memberProfilesTable),
      db.select({ count: count() }).from(coachesTable),
      db.select({ count: count() }).from(adminsTable),
      db.select({ count: count() }).from(classesTable),
    ]);
    res.json({
      totalMembers: membersRes[0]?.count ?? 0,
      totalCoaches: coachesRes[0]?.count ?? 0,
      totalAdmins: adminsRes[0]?.count ?? 0,
      totalClasses: classesRes[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get overview");
    res.status(500).json({ error: "Failed to get overview" });
  }
});

export default router;
