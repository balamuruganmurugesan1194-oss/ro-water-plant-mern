import express from "express";

import {
  getSales,
  createSale,
  deleteSale,
  getNextSaleNumber,
} from "../controllers/saleController.js";

import { auth, requirePermission } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

router.use(auth);

// ==========================================
// GET NEXT SALE NUMBER
// ==========================================

router.get(
  "/next-number",
  requirePermission("sales.create"),
  getNextSaleNumber,
);

// ==========================================
// GET SALES
// ==========================================

router.get("/", requirePermission("sales.view"), getSales);

// ==========================================
// CREATE SALE
// ==========================================

router.post("/", requirePermission("sales.create"), createSale);

// ==========================================
// DELETE SALE
// ==========================================

router.delete("/:id", requirePermission("sales.delete"), deleteSale);

export default router;
