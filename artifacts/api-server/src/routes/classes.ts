import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { classesTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.get("/classes", async (req, res) => {
  try {
    const classes = await db.select().from(classesTable);
    res.json(classes);
  } catch (err) {
    req.log.error({ err }, "Failed to list classes");
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

export default router;
