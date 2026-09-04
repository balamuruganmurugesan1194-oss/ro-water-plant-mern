import express from "express";

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getNextExpenseNumber,
} from "../controllers/expenseController.js";

import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// ALL EXPENSE ROUTES REQUIRE LOGIN
// ==========================================

router.use(auth);

// ==========================================
// NEXT EXPENSE NUMBER
// GET /api/expenses/next-number
// AUTHENTICATED USERS
// ==========================================

router.get("/next-number", getNextExpenseNumber);

// ==========================================
// GET EXPENSES
// GET /api/expenses
// AUTHENTICATED USERS
// ==========================================

router.get("/", getExpenses);

// ==========================================
// CREATE EXPENSE
// POST /api/expenses
// ADMIN ONLY
// ==========================================

router.post("/", requireRole("admin"), createExpense);

// ==========================================
// UPDATE EXPENSE
// PUT /api/expenses/:id
// ADMIN ONLY
// ==========================================

router.put("/:id", requireRole("admin"), updateExpense);

// ==========================================
// DELETE EXPENSE
// DELETE /api/expenses/:id
// ADMIN ONLY
// ==========================================

router.delete("/:id", requireRole("admin"), deleteExpense);

export default router;
