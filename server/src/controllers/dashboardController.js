import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";

// ==========================================
// GET DASHBOARD
// GET /api/dashboard?year=2026
// ==========================================

export const getDashboard = async (req, res) => {
  try {
    const year = Number(
      req.query.year ||
        new Date().getFullYear()
    );

    const start = new Date(
      year,
      0,
      1
    );

    const end = new Date(
      year + 1,
      0,
      1
    );

    // ======================================
    // GET SALES
    // ======================================

    const sales = await Sale.find({
      date: {
        $gte: start,
        $lt: end,
      },
    }).lean();

    // ======================================
    // GET EXPENSES
    // ======================================

    const expenses =
      await Expense.find({
        date: {
          $gte: start,
          $lt: end,
        },
      }).lean();

    // ======================================
    // MONTHLY DATA
    // ======================================

    const monthly = Array.from(
      { length: 12 },
      (_, i) => ({
        month: new Date(
          year,
          i,
          1
        ).toLocaleString(
          "en-IN",
          {
            month: "short",
          }
        ),

        revenue: 0,

        retail: 0,

        supplier: 0,

        other: 0,

        expenses: 0,

        profit: 0,
      })
    );

    // ======================================
    // PROCESS SALES
    // ======================================

    for (const sale of sales) {
      const date = new Date(
        sale.date
      );

      const monthIndex =
        date.getMonth();

      const amount =
        Number(sale.amount) || 0;

      monthly[
        monthIndex
      ].revenue += amount;

      // Avoid undefined property
      if (
        ["retail", "supplier", "other"].includes(
          sale.type
        )
      ) {
        monthly[
          monthIndex
        ][sale.type] += amount;
      }
    }

    // ======================================
    // PROCESS EXPENSES
    // ======================================

    for (const expense of expenses) {
      const date = new Date(
        expense.date
      );

      const monthIndex =
        date.getMonth();

      monthly[
        monthIndex
      ].expenses +=
        Number(expense.amount) || 0;
    }

    // ======================================
    // CALCULATE PROFIT
    // ======================================

    for (const month of monthly) {
      month.profit =
        month.revenue -
        month.expenses;
    }

    // ======================================
    // TOTALS
    // ======================================

    const totals = monthly.reduce(
      (acc, month) => ({
        revenue:
          acc.revenue +
          month.revenue,

        expenses:
          acc.expenses +
          month.expenses,

        profit:
          acc.profit +
          month.profit,
      }),
      {
        revenue: 0,
        expenses: 0,
        profit: 0,
      }
    );

    // ======================================
    // PENDING RECEIVABLES
    // ======================================

    const pendingReceivables =
      sales
        .filter(
          (sale) =>
            sale.paymentStatus !==
            "Paid"
        )
        .reduce(
          (total, sale) =>
            total +
            (Number(
              sale.amount
            ) || 0),
          0
        );

    // ======================================
    // PROFIT MARGIN
    // ======================================

    const margin =
      totals.revenue > 0
        ? (totals.profit /
            totals.revenue) *
          100
        : 0;

    // ======================================
    // RESPONSE
    // ======================================

    res.status(200).json({
      year,

      monthly,

      totals,

      margin,

      pendingReceivables,
    });
  } catch (error) {
    console.error(
      "GET DASHBOARD ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};