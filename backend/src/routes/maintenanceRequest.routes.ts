import { Router } from "express";
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
} from "../controllers/maintenanceRequest.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getMaintenanceRequests
);

router.get(
  "/:id",
  authenticate,
  getMaintenanceRequestById
);

router.post(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "FACILITY_MANAGER",
    "FACILITY_USER"
  ),
  createMaintenanceRequest
);

router.put(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "FACILITY_MANAGER"
  ),
  updateMaintenanceRequest
);

export default router;