import Expense from "../models/Expense.js";

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
      const [year, m] = month
        .split("-")
        .map(Number);

      filter.date = {
        $gte: new Date(year, m - 1, 1),
        $lt: new Date(year, m, 1),
      };
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .limit(500);

    res.status(200).json(expenses);
  } catch (error) {
    console.error(
      "GET EXPENSES ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ==========================================
// CREATE EXPENSE
// POST /api/expenses
// ==========================================

export const createExpense = async (
  req,
  res
) => {
  try {
    const {
      amount,
      date,
      ...otherData
    } = req.body;

    if (
      amount === undefined ||
      amount === null ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        message:
          "Amount must be greater than 0",
      });
    }

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    const expense = await Expense.create({
      ...otherData,

      amount: Number(amount),

      date: new Date(date),

      createdBy: req.user.id,
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error(
      "CREATE EXPENSE ERROR:",
      error
    );

    res.status(400).json({
      message: error.message,
    });
  }
};


// ==========================================
// DELETE EXPENSE
// DELETE /api/expenses/:id
// ==========================================

export const deleteExpense = async (
  req,
  res
) => {
  try {
    const expense =
      await Expense.findByIdAndDelete(
        req.params.id
      );

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      ok: true,
      message:
        "Expense deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};