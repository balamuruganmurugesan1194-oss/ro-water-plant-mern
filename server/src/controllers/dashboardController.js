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

    // Aggregate only the values needed by the dashboard instead of loading
    // every sale and expense document into the Node.js process.
    const [salesSummary, expenseSummary] = await Promise.all([
      Sale.aggregate([
        {
          $match: {
            date: { $gte: start, $lt: end },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: { month: { $month: "$date" }, type: "$type" },
            amount: { $sum: "$amount" },
            pendingReceivables: {
              $sum: {
                $cond: [
                  { $ne: [{ $toLower: "$paymentStatus" }, "paid"] },
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
      ]),
      Expense.aggregate([
        {
          $match: {
            date: { $gte: start, $lt: end },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$date" } },
            amount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

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

    for (const summary of salesSummary) {
      const monthIndex = summary._id.month - 1;
      const saleType = String(summary._id.type || "").toLowerCase();
      const amount = Number(summary.amount) || 0;

      monthly[monthIndex].revenue += amount;

      if (["retail", "supplier", "other"].includes(saleType)) {
        monthly[monthIndex][saleType] += amount;
      }
    }

    for (const summary of expenseSummary) {
      monthly[summary._id.month - 1].expenses += Number(summary.amount) || 0;
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

    const pendingReceivables = salesSummary.reduce(
      (total, summary) => total + (Number(summary.pendingReceivables) || 0),
      0,
    );

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
