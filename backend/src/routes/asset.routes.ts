import { Router } from "express";
import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  assessAssetRisk,
} from "../controllers/asset.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";



const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  createAsset
);

router.get(
  "/",
  authenticate,
  getAssets
);

router.get(
  "/:id",
  authenticate,
  getAssetById
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  updateAsset
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  deleteAsset
);

router.post(
  "/:id/assess-risk",
  authenticate,
  authorize("ADMIN", "FACILITY_MANAGER"),
  assessAssetRisk
);

export default router;