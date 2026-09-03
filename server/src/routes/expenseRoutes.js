import express from "express";

import {
  getExpenses,
  createExpense,
  deleteExpense,
  getNextExpenseNumber
} from "../controllers/expenseController.js";

import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

router.use(auth);
router.get("/next-number", getNextExpenseNumber);
// ==========================================
// GET EXPENSES
// GET /api/expenses
// ==========================================

router.get("/", getExpenses);

// ==========================================
// CREATE EXPENSE
// POST /api/expenses
// ADMIN ONLY
// ==========================================

router.post("/", requireRole("admin"), createExpense);

// ==========================================
// DELETE EXPENSE
// DELETE /api/expenses/:id
// ADMIN ONLY
// ==========================================

router.delete("/:id", requireRole("admin"), deleteExpense);

export default router;
