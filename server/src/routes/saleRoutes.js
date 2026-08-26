import express from "express";

import {
  getSales,
  createSale,
  deleteSale,
} from "../controllers/saleController.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

router.use(auth);

// ==========================================
// GET SALES
// GET /api/sales
// ==========================================

router.get(
  "/",
  getSales
);

// ==========================================
// CREATE SALE
// POST /api/sales
// ==========================================

router.post(
  "/",
  createSale
);

// ==========================================
// DELETE SALE
// DELETE /api/sales/:id
// ==========================================

router.delete(
  "/:id",
  deleteSale
);

export default router;