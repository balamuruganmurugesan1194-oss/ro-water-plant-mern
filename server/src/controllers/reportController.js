import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import Expense from "../models/Expense.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";

const range = (query) => {
  const start = query.from ? new Date(query.from) : new Date(new Date().getFullYear(), 0, 1);
  const end = query.to ? new Date(query.to) : new Date();
  end.setDate(end.getDate() + 1);
  return { $gte: start, $lt: end };
};

export const salesReport = async (req, res) => res.json(await Sale.aggregate([{ $match: { date: range(req.query), isDeleted: false } }, { $group: { _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, type: "$type" }, total: { $sum: "$amount" }, count: { $sum: 1 } } }, { $sort: { "_id.day": 1 } }]));
export const purchaseReport = async (req, res) => {
  try {
    const purchases = await Purchase.aggregate([
      { $match: { date: range(req.query) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: { $ifNull: ["$totalAmount", 0] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json(purchases);
  } catch (error) {
    console.error("PURCHASE REPORT ERROR:", error);
    return res.status(500).json({ message: "Failed to load purchase report" });
  }
};
export const expenseReport = async (req, res) => res.json(await Expense.aggregate([{ $match: { date: range(req.query) } }, { $group: { _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, category: "$category" }, total: { $sum: "$amount" }, count: { $sum: 1 } } }, { $sort: { "_id.day": 1 } }]));
export const profitLossReport = async (req, res) => {
  const [sales, purchases, expenses] = await Promise.all([
    Sale.aggregate([{ $match: { date: range(req.query), isDeleted: false } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Purchase.aggregate([{ $match: { date: range(req.query) } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Expense.aggregate([{ $match: { date: range(req.query) } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);
  const revenue = sales[0]?.total || 0;
  const cost = (purchases[0]?.total || 0) + (expenses[0]?.total || 0);
  return res.json({ revenue, purchases: purchases[0]?.total || 0, expenses: expenses[0]?.total || 0, profit: revenue - cost });
};
export const stockReport = async (req, res) => res.json(await Product.find({ active: true }).select("name code category unit currentStock reorderLevel").sort({ name: 1 }).lean());
export const customerOutstanding = async (req, res) => res.json(await outstanding("customer", "retail", "received"));
export const supplierOutstanding = async (req, res) => res.json(await outstanding("supplier", null, "paid"));

const outstanding = async (partyType, saleType, paymentDirection) => {
  const [debts, payments] = await Promise.all([
    saleType ? Sale.aggregate([{ $match: { type: saleType, isDeleted: false, partyId: { $ne: null } } }, { $group: { _id: "$partyId", billed: { $sum: "$amount" } } }]) : Purchase.aggregate([{ $match: { supplier: { $ne: null } } }, { $group: { _id: "$supplier", billed: { $sum: "$totalAmount" } } }]),
    Payment.aggregate([{ $match: { direction: paymentDirection } }, { $group: { _id: "$party", paid: { $sum: "$amount" } } }]),
  ]);
  const paidByParty = new Map(payments.map((item) => [item._id.toString(), item.paid]));
  const ids = debts.map((item) => item._id);
  const parties = await (await import("../models/Party.js")).default.find({ _id: { $in: ids }, type: partyType }).select("name code type").lean();
  const partyById = new Map(parties.map((party) => [party._id.toString(), party]));
  return debts.map((item) => ({ party: partyById.get(item._id.toString()), billed: item.billed, paid: paidByParty.get(item._id.toString()) || 0, outstanding: item.billed - (paidByParty.get(item._id.toString()) || 0) })).filter((item) => item.party);
};
export const dailyCollection = async (req, res) => res.json(await Payment.aggregate([{ $match: { direction: "received", date: range(req.query) } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, total: { $sum: "$amount" }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]));
