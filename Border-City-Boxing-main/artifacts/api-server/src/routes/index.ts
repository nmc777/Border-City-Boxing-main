import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import classesRouter from "./classes";
import bookingsRouter from "./bookings";
import coachesRouter from "./coaches";
import adminRouter from "./admin";
import membersRouter from "./members";
import attendanceRouter from "./attendance";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(classesRouter);
router.use(bookingsRouter);
router.use(coachesRouter);
router.use(adminRouter);
router.use(membersRouter);
router.use(attendanceRouter);

export default router;
