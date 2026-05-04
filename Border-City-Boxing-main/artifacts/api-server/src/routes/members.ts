import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { memberProfilesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/members/status", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const member = await db
      .select()
      .from(memberProfilesTable)
      .where(eq(memberProfilesTable.userId, req.user.id))
      .limit(1);
    res.json({ isMember: member.length > 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to check member status");
    res.status(500).json({ error: "Failed to check member status" });
  }
});

export default router;
