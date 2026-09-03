import Expense from "../models/Expense.js";
import Counter from "../models/Counter.js";
import { getNextNumber } from "../utils/getNextNumber.js";
// ==========================================
// GET EXPENSES
// GET /api/expenses
// ==========================================

export const getExpenses = async (req, res) => {
  try {
    const { month, category } = req.query;

    const filter = {};

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Month filter
    if (month) {
      const [year, m] = month.split("-").map(Number);

      filter.date = {
        $gte: new Date(year, m - 1, 1),
        $lt: new Date(year, m, 1),
      };
    }

    const expenses = await Expense.find(filter)
      .sort({ createdAt: -1 })
      .limit(500);

    res.status(200).json(expenses);
  } catch (error) {
    console.error("GET EXPENSES ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
// ======================================================
// CREATE EXPENSE
// ======================================================

export const createExpense = async (req, res) => {
  try {
    const { amount, date, category, vendor, notes } = req.body;

    // ================================================
    // AMOUNT
    // ================================================

    if (amount === undefined || amount === null || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    // ================================================
    // DATE
    // ================================================

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    // ================================================
    // CATEGORY
    // ================================================

    if (!category?.trim()) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    // ================================================
    // GENERATE EXPENSE NUMBER
    // ================================================

    const expenseNumber = await getNextNumber("expenses", "EXP-", 6);

    // ================================================
    // CREATE EXPENSE
    // ================================================

    const expense = await Expense.create({
      expenseNumber,

      amount: Number(amount),

      date: new Date(date),

      category: category.trim(),

      vendor: vendor?.trim() || "",

      notes: notes?.trim() || "",

      createdBy: req.user.id,
    });

    // ================================================
    // RESPONSE
    // ================================================

    return res.status(201).json({
      message: "Expense created successfully",

      expense,
    });
  } catch (error) {
    console.error("CREATE EXPENSE ERROR:", error);

    return res.status(400).json({
      message: error.message,
    });
  }
};

// ==========================================
// DELETE EXPENSE
// DELETE /api/expenses/:id
// ==========================================

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      ok: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("DELETE EXPENSE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
export const getNextExpenseNumber = async (req, res) => {
  try {
    const counter = await Counter.findOne({
      name: "expenses",
    });

    const nextSequence = (counter?.seq || 0) + 1;

    const expenseNumber = `EXP-${String(nextSequence).padStart(6, "0")}`;

    return res.status(200).json({
      expenseNumber,
    });
  } catch (error) {
    console.error("NEXT EXPENSE NUMBER ERROR:", error);

    return res.status(500).json({
      message: "Failed to get next expense number",
    });
  }
};
