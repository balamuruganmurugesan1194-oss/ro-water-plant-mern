import mongoose from "mongoose";
import Production from "../models/Production.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { getNextNumber } from "../utils/getNextNumber.js";

export const getProductions = async (req, res) => {
  try {
    const productions = await Production.find()
      .populate("output.product", "name code unit")
      .populate("inputs.product", "name code unit")
      .sort({ date: -1, createdAt: -1 })
      .limit(500)
      .lean();

    return res.json(productions);
  } catch (error) {
    console.error("GET PRODUCTIONS ERROR:", error);
    return res.status(500).json({ message: "Failed to load production records" });
  }
};

export const createProduction = async (req, res) => {
  try {
    const { date, output, inputs, notes = "" } = req.body;

    if (!date || !output?.product || !Array.isArray(inputs) || inputs.length === 0) {
      return res.status(400).json({ message: "Date, output, and inputs are required" });
    }

    const outputQuantity = Number(output.quantity);
    const cleanedInputs = inputs.map((item) => ({
      product: String(item.product || ""),
      quantity: Number(item.quantity),
    }));
    const productIds = [...new Set([String(output.product), ...cleanedInputs.map((item) => item.product)])];
    const products = await Product.find({
      _id: { $in: productIds.filter((id) => mongoose.Types.ObjectId.isValid(id)) },
    }).select("_id currentStock").lean();
    const byId = new Map(products.map((product) => [product._id.toString(), product]));

    if (!byId.has(String(output.product)) || !Number.isFinite(outputQuantity) || outputQuantity <= 0) {
      return res.status(400).json({ message: "Invalid production output" });
    }

    const required = {};
    for (const item of cleanedInputs) {
      if (!byId.has(item.product) || !Number.isFinite(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ message: "Invalid production input" });
      }
      required[item.product] = (required[item.product] || 0) + item.quantity;
    }

    for (const [productId, quantity] of Object.entries(required)) {
      if ((byId.get(productId).currentStock || 0) < quantity) {
        return res.status(400).json({ message: `Insufficient stock for input ${productId}` });
      }
    }

    const productionNumber = await getNextNumber("productions", "PRO-", 6);
    const production = await Production.create({
      productionNumber,
      date: new Date(date),
      output: { product: output.product, quantity: outputQuantity },
      inputs: cleanedInputs,
      notes: notes.trim(),
      createdBy: req.user?.id || req.user?._id,
    });
    const movements = [];

    for (const [productId, quantity] of Object.entries(required)) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, currentStock: { $gte: quantity } },
        { $inc: { currentStock: -quantity } },
        { new: true },
      ).select("currentStock");
      if (!product) throw new Error("Stock changed while creating production. Please retry.");
      movements.push({ product: productId, type: "production_out", quantity: -quantity, balanceAfter: product.currentStock, referenceType: "manual", referenceId: production._id, createdBy: req.user?.id || req.user?._id });
    }

    const outputProduct = await Product.findByIdAndUpdate(
      output.product,
      { $inc: { currentStock: outputQuantity } },
      { new: true },
    ).select("currentStock");
    movements.push({ product: output.product, type: "production_in", quantity: outputQuantity, balanceAfter: outputProduct.currentStock, referenceType: "manual", referenceId: production._id, createdBy: req.user?.id || req.user?._id });

    await StockMovement.insertMany(movements);
    return res.status(201).json(production);
  } catch (error) {
    console.error("CREATE PRODUCTION ERROR:", error);
    return res.status(400).json({ message: error.message || "Failed to create production" });
  }
};
