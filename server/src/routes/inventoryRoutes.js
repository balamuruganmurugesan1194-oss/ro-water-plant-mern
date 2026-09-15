import express from "express";

import {
  getStockSummary,
  getStockLedger,
  createOpeningStock,
  createStockAdjustment,
} from "../controllers/inventoryController.js";
import { auth, requirePermission } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.get("/summary", requirePermission("products.view"), getStockSummary);
router.get(
  "/ledger/:productId",
  requirePermission("products.view"),
  getStockLedger,
);
router.post(
  "/opening",
  requirePermission("products.edit"),
  createOpeningStock,
);
router.post(
  "/adjustments",
  requirePermission("products.edit"),
  createStockAdjustment,
);

export default router;