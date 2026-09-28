import { Router } from "express";
import {
  authenticate,
  AuthenticatedRequest,
} from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/protected",
  authenticate,
  authorize("ADMIN"),
  (req: AuthenticatedRequest, res) => {
    res.json({
      message: "You have access to this ADMIN protected route",
      user: req.user,
    });
  }
);

export default router;