import express from "express";

import {
  getExpenses,
  createExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

import {
  auth,
  requireRole,
} from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

router.use(auth);

// ==========================================
// GET EXPENSES
// GET /api/expenses
// ==========================================

router.get(
  "/",
  getExpenses
);

// ==========================================
// CREATE EXPENSE
// POST /api/expenses
// ADMIN ONLY
// ==========================================

router.post(
  "/",
  requireRole("admin"),
  createExpense
);

// ==========================================
// DELETE EXPENSE
// DELETE /api/expenses/:id
// ADMIN ONLY
// ==========================================

router.delete(
  "/:id",
  requireRole("admin"),
  deleteExpense
);

export default router;