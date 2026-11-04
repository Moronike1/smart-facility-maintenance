
import { Router } from "express";
import { getTechnicians } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/technicians",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  getTechnicians
);

export default router;
