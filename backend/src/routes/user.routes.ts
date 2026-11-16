
import { Router } from "express";
import {
  getTechnicians,
  getPendingResidents,
  approveResident,
  rejectResident,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Retrieve active technicians
router.get(
  "/technicians",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  getTechnicians
);

// Retrieve pending resident registrations
router.get(
  "/pending-residents",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  getPendingResidents
);

// Approve a resident registration
router.put(
  "/:id/approve",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  approveResident
);

// Reject a resident registration
router.put(
  "/:id/reject",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  rejectResident
);

export default router;
