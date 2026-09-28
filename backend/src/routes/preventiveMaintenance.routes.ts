import { Router } from "express";
import {
  createPreventiveMaintenance,
  getPreventiveMaintenances,
  getPreventiveMaintenanceById,
  updatePreventiveMaintenanceStatus,
  checkOverduePreventiveMaintenance,
} from "../controllers/preventiveMaintenance.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getPreventiveMaintenances
);

router.get(
  "/:id",
  authenticate,
  getPreventiveMaintenanceById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  createPreventiveMaintenance
);

router.put(
  "/:id/status",
  authenticate,
  authorize(
    "ADMIN",
    "FACILITY_MANAGER",
    "TECHNICIAN"
  ),
  updatePreventiveMaintenanceStatus
);

router.post(
  "/check-overdue",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  checkOverduePreventiveMaintenance
);
export default router;