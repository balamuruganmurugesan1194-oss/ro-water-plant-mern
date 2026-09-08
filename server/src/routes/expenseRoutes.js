import express from "express";

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getNextExpenseNumber,
} from "../controllers/expenseController.js";

import { auth, requirePermission } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// ALL EXPENSE ROUTES REQUIRE LOGIN
// ==========================================

router.use(auth);

// ==========================================
// NEXT EXPENSE NUMBER
// GET /api/expenses/next-number
// ==========================================

router.get(
  "/next-number",
  requirePermission("expenses.create"),
  getNextExpenseNumber,
);

// ==========================================
// GET EXPENSES
// GET /api/expenses
// ==========================================

router.get("/", requirePermission("expenses.view"), getExpenses);

// ==========================================
// CREATE EXPENSE
// POST /api/expenses
// ==========================================

router.post("/", requirePermission("expenses.create"), createExpense);

// ==========================================
// UPDATE EXPENSE
// PUT /api/expenses/:id
// ==========================================

router.put("/:id", requirePermission("expenses.edit"), updateExpense);

// ==========================================
// DELETE EXPENSE
// DELETE /api/expenses/:id
// ==========================================

router.delete("/:id", requirePermission("expenses.delete"), deleteExpense);

export default router;
