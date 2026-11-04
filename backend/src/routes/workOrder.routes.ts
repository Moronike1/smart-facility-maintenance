import { Router } from "express";
import {
  getWorkOrders,
  createWorkOrder,
  assignWorkOrder,
  updateWorkOrderStatus,
  completeWorkOrder,
} from "../controllers/workOrder.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getWorkOrders
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  createWorkOrder
);

router.put(
  "/:id/assign",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  assignWorkOrder
);

router.put(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER", "TECHNICIAN"),
  updateWorkOrderStatus
);

router.put(
  "/:id/complete",
  authenticate,
  authorize(
    "ADMIN",
    "FACILITY_MANAGER",
    "TECHNICIAN"
  ),
  completeWorkOrder
);

export default router;