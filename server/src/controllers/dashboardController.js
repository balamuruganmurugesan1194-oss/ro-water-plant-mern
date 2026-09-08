import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";

// ==========================================
// GET DASHBOARD
// GET /api/dashboard?year=2026
// Permission: dashboard.view
// ==========================================

export const getDashboard = async (req, res) => {
  try {
    // ======================================
    // YEAR
    // ======================================

    const requestedYear = Number(req.query.year || new Date().getFullYear());

    const year =
      Number.isInteger(requestedYear) &&
      requestedYear >= 2000 &&
      requestedYear <= 2100
        ? requestedYear
        : new Date().getFullYear();

    // ======================================
    // DATE RANGE
    // ======================================

    const start = new Date(year, 0, 1);

    const end = new Date(year + 1, 0, 1);

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

    const expenses = await Expense.find({
      date: {
        $gte: start,
        $lt: end,
      },
    }).lean();

    // ======================================
    // MONTHLY DATA
    // ======================================

    const monthly = Array.from({ length: 12 }, (_, index) => ({
      month: new Date(year, index, 1).toLocaleString("en-IN", {
        month: "short",
      }),

      monthNumber: index + 1,

      revenue: 0,

      retail: 0,

      supplier: 0,

      other: 0,

      expenses: 0,

      profit: 0,

      margin: 0,
    }));

    // ======================================
    // PROCESS SALES
    // ======================================

    for (const sale of sales) {
      if (!sale.date) {
        continue;
      }

      const date = new Date(sale.date);

      const monthIndex = date.getMonth();

      if (monthIndex < 0 || monthIndex > 11) {
        continue;
      }

      const amount = Number(sale.amount) || 0;

      monthly[monthIndex].revenue += amount;

      // ====================================
      // SALE TYPE
      // ====================================

      const saleType = String(sale.type || "").toLowerCase();

      if (["retail", "supplier", "other"].includes(saleType)) {
        monthly[monthIndex][saleType] += amount;
      }
    }

    // ======================================
    // PROCESS EXPENSES
    // ======================================

    for (const expense of expenses) {
      if (!expense.date) {
        continue;
      }

      const date = new Date(expense.date);

      const monthIndex = date.getMonth();

      if (monthIndex < 0 || monthIndex > 11) {
        continue;
      }

      monthly[monthIndex].expenses += Number(expense.amount) || 0;
    }

    // ======================================
    // CALCULATE MONTHLY PROFIT
    // ======================================

    for (const month of monthly) {
      month.profit = month.revenue - month.expenses;

      month.margin =
        month.revenue > 0 ? (month.profit / month.revenue) * 100 : 0;
    }

    // ======================================
    // TOTALS
    // ======================================

    const totals = monthly.reduce(
      (accumulator, month) => {
        accumulator.revenue += month.revenue;

        accumulator.expenses += month.expenses;

        accumulator.profit += month.profit;

        return accumulator;
      },
      {
        revenue: 0,
        expenses: 0,
        profit: 0,
      },
    );

    // ======================================
    // PENDING RECEIVABLES
    // ======================================

    const pendingReceivables = sales
      .filter((sale) => {
        const status = String(sale.paymentStatus || "").toLowerCase();

        return status !== "paid";
      })
      .reduce((total, sale) => {
        return total + (Number(sale.amount) || 0);
      }, 0);

    // ======================================
    // PROFIT MARGIN
    // ======================================

    const margin =
      totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,

      year,

      totals: {
        revenue: Number(totals.revenue.toFixed(2)),

        expenses: Number(totals.expenses.toFixed(2)),

        profit: Number(totals.profit.toFixed(2)),
      },

      margin: Number(margin.toFixed(2)),

      pendingReceivables: Number(pendingReceivables.toFixed(2)),

      monthly,
    });
  } catch (error) {
    console.error("GET DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load dashboard",
    });
  }
};
