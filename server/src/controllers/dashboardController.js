import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";

// ==========================================
// HELPERS
// ==========================================

const round2 = (value) => {
  return Number((Number(value) || 0).toFixed(2));
};

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const getMonthName = (year, monthIndex) => {
  return new Date(year, monthIndex, 1).toLocaleString("en-IN", {
    month: "short",
  });
};

const getStartOfDay = (date = new Date()) => {
  const value = new Date(date);

  value.setHours(0, 0, 0, 0);

  return value;
};

const getEndOfDay = (date = new Date()) => {
  const value = new Date(date);

  value.setHours(23, 59, 59, 999);

  return value;
};

// ==========================================
// GET DASHBOARD
//
// GET /api/dashboard?year=2026
//
// Permission:
// dashboard.view
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
    // TODAY RANGE
    // ======================================

    const todayStart = getStartOfDay();

    const todayEnd = getEndOfDay();

    // ======================================
    // MONTH RANGE
    // ======================================

    const currentMonthStart = new Date(year, new Date().getMonth(), 1);

    const currentMonthEnd = new Date(year, new Date().getMonth() + 1, 1);

    // ======================================
    // SALES AGGREGATION
    // ======================================

    const salesSummary = await Sale.aggregate([
      {
        $match: {
          date: {
            $gte: start,
            $lt: end,
          },

          isDeleted: false,
        },
      },

      {
        $group: {
          _id: {
            month: {
              $month: "$date",
            },

            type: "$type",
          },

          amount: {
            $sum: {
              $ifNull: ["$amount", 0],
            },
          },

          count: {
            $sum: 1,
          },

          pendingReceivables: {
            $sum: {
              $cond: [
                {
                  $ne: [
                    {
                      $toLower: {
                        $ifNull: ["$paymentStatus", ""],
                      },
                    },

                    "paid",
                  ],
                },

                {
                  $ifNull: ["$amount", 0],
                },

                0,
              ],
            },
          },
        },
      },
    ]);

    // ======================================
    // EXPENSE AGGREGATION
    // ======================================

    const expenseSummary = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: start,
            $lt: end,
          },
        },
      },

      {
        $group: {
          _id: {
            month: {
              $month: "$date",
            },
          },

          amount: {
            $sum: {
              $ifNull: ["$amount", 0],
            },
          },

          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // ======================================
    // MONTHLY DATA
    // ======================================

    const monthly = Array.from(
      {
        length: 12,
      },
      (_, index) => ({
        month: getMonthName(year, index),

        monthNumber: index + 1,

        revenue: 0,

        retail: 0,

        supplier: 0,

        other: 0,

        expenses: 0,

        profit: 0,

        margin: 0,

        salesCount: 0,
      }),
    );

    // ======================================
    // SALES -> MONTHLY
    // ======================================

    for (const summary of salesSummary) {
      const monthIndex = safeNumber(summary?._id?.month) - 1;

      if (monthIndex < 0 || monthIndex > 11) {
        continue;
      }

      const amount = safeNumber(summary.amount);

      const count = safeNumber(summary.count);

      const saleType = String(summary?._id?.type || "").toLowerCase();

      monthly[monthIndex].revenue += amount;

      monthly[monthIndex].salesCount += count;

      if (["retail", "supplier", "other"].includes(saleType)) {
        monthly[monthIndex][saleType] += amount;
      }
    }

    // ======================================
    // EXPENSES -> MONTHLY
    // ======================================

    for (const summary of expenseSummary) {
      const monthIndex = safeNumber(summary?._id?.month) - 1;

      if (monthIndex < 0 || monthIndex > 11) {
        continue;
      }

      monthly[monthIndex].expenses += safeNumber(summary.amount);
    }

    // ======================================
    // MONTHLY PROFIT
    // ======================================

    for (const month of monthly) {
      month.profit = month.revenue - month.expenses;

      month.margin =
        month.revenue > 0 ? (month.profit / month.revenue) * 100 : 0;

      month.revenue = round2(month.revenue);

      month.retail = round2(month.retail);

      month.supplier = round2(month.supplier);

      month.other = round2(month.other);

      month.expenses = round2(month.expenses);

      month.profit = round2(month.profit);

      month.margin = round2(month.margin);
    }

    // ======================================
    // TOTALS
    // ======================================

    const totals = monthly.reduce(
      (accumulator, month) => {
        accumulator.revenue += month.revenue;

        accumulator.expenses += month.expenses;

        accumulator.profit += month.profit;

        accumulator.salesCount += month.salesCount;

        return accumulator;
      },

      {
        revenue: 0,

        expenses: 0,

        profit: 0,

        salesCount: 0,
      },
    );

    // ======================================
    // PENDING RECEIVABLES
    // ======================================

    const pendingReceivables = salesSummary.reduce(
      (total, summary) => {
        return total + safeNumber(summary.pendingReceivables);
      },

      0,
    );

    // ======================================
    // PROFIT MARGIN
    // ======================================

    const margin =
      totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;

    // ======================================
    // TODAY'S SALES
    // ======================================

    const todaySalesSummary = await Sale.aggregate([
      {
        $match: {
          date: {
            $gte: todayStart,

            $lte: todayEnd,
          },

          isDeleted: false,
        },
      },

      {
        $group: {
          _id: null,

          revenue: {
            $sum: {
              $ifNull: ["$amount", 0],
            },
          },

          salesCount: {
            $sum: 1,
          },
        },
      },
    ]);

    const todayRevenue = safeNumber(todaySalesSummary[0]?.revenue);

    const todaySalesCount = safeNumber(todaySalesSummary[0]?.salesCount);

    // ======================================
    // CURRENT MONTH SALES
    // ======================================

    let monthlyRevenue = 0;

    let monthlySalesCount = 0;

    if (year === new Date().getFullYear()) {
      const currentMonthSummary = await Sale.aggregate([
        {
          $match: {
            date: {
              $gte: currentMonthStart,

              $lt: currentMonthEnd,
            },

            isDeleted: false,
          },
        },

        {
          $group: {
            _id: null,

            revenue: {
              $sum: {
                $ifNull: ["$amount", 0],
              },
            },

            count: {
              $sum: 1,
            },
          },
        },
      ]);

      monthlyRevenue = safeNumber(currentMonthSummary[0]?.revenue);

      monthlySalesCount = safeNumber(currentMonthSummary[0]?.count);
    }

    // ======================================
    // RECENT SALES
    // ======================================

    const recentSales = await Sale.find({
      date: {
        $gte: start,
        $lt: end,
      },

      isDeleted: false,
    })
      .sort({
        date: -1,
        createdAt: -1,
      })
      .limit(10)
      .lean();

    // ======================================
    // PRODUCT SALES
    //
    // Handles common Sale item structures.
    // ======================================

    const productSales = await Sale.aggregate([
      {
        $match: {
          date: {
            $gte: start,
            $lt: end,
          },

          isDeleted: false,
        },
      },

      {
        $unwind: {
          path: "$items",
          preserveNullAndEmptyArrays: false,
        },
      },

      {
        $group: {
          _id: {
            product: "$items.product",

            productName: "$items.productName",

            name: "$items.name",
          },

          quantity: {
            $sum: {
              $ifNull: ["$items.quantity", 0],
            },
          },

          amount: {
            $sum: {
              $ifNull: [
                "$items.amount",
                {
                  $multiply: [
                    {
                      $ifNull: ["$items.quantity", 0],
                    },

                    {
                      $ifNull: ["$items.rate", 0],
                    },
                  ],
                },
              ],
            },
          },
        },
      },

      {
        $sort: {
          amount: -1,
        },
      },

      {
        $limit: 10,
      },
    ]);

    // ======================================
    // FORMAT PRODUCT SALES
    // ======================================

    const formattedProductSales = productSales.map((item) => ({
      productId: item?._id?.product || null,

      name: item?._id?.productName || item?._id?.name || "Product",

      quantity: safeNumber(item.quantity),

      amount: round2(item.amount),
    }));

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,

      year,

      // ====================================
      // FINANCIAL
      // ====================================

      totals: {
        revenue: round2(totals.revenue),

        expenses: round2(totals.expenses),

        profit: round2(totals.profit),

        salesCount: totals.salesCount,
      },

      margin: round2(margin),

      pendingReceivables: round2(pendingReceivables),

      // ====================================
      // TODAY
      // ====================================

      today: {
        revenue: round2(todayRevenue),

        salesCount: todaySalesCount,
      },

      // ====================================
      // CURRENT MONTH
      // ====================================

      sales: {
        monthlyRevenue: round2(monthlyRevenue),

        monthlySalesCount: monthlySalesCount,
      },

      // ====================================
      // EXPENSES
      // ====================================

      expenses: {
        monthly:
          year === new Date().getFullYear()
            ? round2(monthly[new Date().getMonth()]?.expenses || 0)
            : 0,

        yearly: round2(totals.expenses),
      },

      // ====================================
      // INVENTORY PLACEHOLDER
      //
      // These values should later come
      // from Inventory/Stock collections.
      // ====================================

      inventory: {
        currentStock: 0,

        stockValue: 0,

        lowStockCount: 0,
      },

      // ====================================
      // PRODUCTION PLACEHOLDER
      //
      // Connect to Production module later.
      // ====================================

      production: {
        today: 0,

        month: 0,
      },

      // ====================================
      // JARS PLACEHOLDER
      //
      // Connect to Empty Jar module later.
      // ====================================

      jars: {
        filled: 0,

        empty: 0,
      },

      // ====================================
      // MONTHLY
      // ====================================

      monthly,

      // ====================================
      // PRODUCT SALES
      // ====================================

      productSales: formattedProductSales,

      // ====================================
      // LOW STOCK
      // ====================================

      lowStockProducts: [],

      // ====================================
      // RECENT SALES
      // ====================================

      recentSales,
    });
  } catch (error) {
    console.error("GET DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,

      message: error.message || "Failed to load dashboard",
    });
  }
};
