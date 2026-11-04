
import { Router } from "express";
import { getMaintenanceHistory } from "../controllers/maintenanceHistory.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getMaintenanceHistory);

export default router;
