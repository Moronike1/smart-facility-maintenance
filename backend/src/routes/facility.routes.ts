import { Router } from "express";
import {
  createFacility,
  getFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility,
} from "../controllers/facility.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  createFacility
);

router.get(
  "/",
  authenticate,
  getFacilities
);

router.get(
  "/:id",
  authenticate,
  getFacilityById
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  updateFacility
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  deleteFacility
);

export default router;