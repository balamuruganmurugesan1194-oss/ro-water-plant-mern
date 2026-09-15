import mongoose from "mongoose";
import Delivery from "../models/Delivery.js";
import JarMovement from "../models/JarMovement.js";
import Payment from "../models/Payment.js";
import { getNextNumber } from "../utils/getNextNumber.js";

const validId = (value) => mongoose.Types.ObjectId.isValid(value);

export const createDelivery = async (req, res) => {
  try {
    const { customer, sale = null, date, items, notes = "" } = req.body;
    if (!validId(customer) || !date || !Array.isArray(items) || !items.length) return res.status(400).json({ message: "Customer, date and items are required" });
    const delivery = await Delivery.create({ deliveryNumber: await getNextNumber("deliveries", "DEL-", 6), customer, sale: validId(sale) ? sale : null, date: new Date(date), items, notes: notes.trim(), createdBy: req.user?.id || req.user?._id });
    return res.status(201).json(delivery);
  } catch (error) { return res.status(400).json({ message: error.message }); }
};

export const getDeliveries = async (req, res) => {
  const deliveries = await Delivery.find().populate("customer", "name code").populate("items.product", "name code unit").sort({ date: -1 }).limit(500).lean();
  return res.json(deliveries);
};

export const createJarMovement = async (req, res) => {
  try {
    const { customer, sale = null, date, type, quantity, notes = "" } = req.body;
    if (!validId(customer) || !date || !["issued", "returned", "lost", "damaged"].includes(type) || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) return res.status(400).json({ message: "Valid customer, date, type and quantity are required" });
    const movement = await JarMovement.create({ customer, sale: validId(sale) ? sale : null, date: new Date(date), type, quantity: Number(quantity), notes: notes.trim(), createdBy: req.user?.id || req.user?._id });
    return res.status(201).json(movement);
  } catch (error) { return res.status(400).json({ message: error.message }); }
};

export const getJarBalances = async (req, res) => {
  const balances = await JarMovement.aggregate([
    { $group: { _id: "$customer", issued: { $sum: { $cond: [{ $eq: ["$type", "issued"] }, "$quantity", 0] } }, returned: { $sum: { $cond: [{ $in: ["$type", ["returned", "lost", "damaged"]] }, "$quantity", 0] } } } },
    { $addFields: { outstanding: { $subtract: ["$issued", "$returned"] } } },
    { $lookup: { from: "parties", localField: "_id", foreignField: "_id", as: "customer" } },
    { $unwind: "$customer" },
    { $project: { customer: "$customer.name", code: "$customer.code", issued: 1, returned: 1, outstanding: 1 } },
    { $sort: { outstanding: -1 } },
  ]);
  return res.json(balances);
};

export const createPayment = async (req, res) => {
  try {
    const { party, direction, date, amount, mode = "Cash", reference = "", notes = "" } = req.body;
    if (!validId(party) || !["received", "paid"].includes(direction) || !date || Number(amount) <= 0) return res.status(400).json({ message: "Party, direction, date and valid amount are required" });
    const payment = await Payment.create({ paymentNumber: await getNextNumber("payments", "PAY-", 6), party, direction, date: new Date(date), amount: Number(amount), mode, reference: reference.trim(), notes: notes.trim(), createdBy: req.user?.id || req.user?._id });
    return res.status(201).json(payment);
  } catch (error) { return res.status(400).json({ message: error.message }); }
};

export const getPayments = async (req, res) => {
  const payments = await Payment.find().populate("party", "name code type").sort({ date: -1 }).limit(500).lean();
  return res.json(payments);
};
