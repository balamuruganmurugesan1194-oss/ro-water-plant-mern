import mongoose from "mongoose";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { getNextNumber } from "../utils/getNextNumber.js";

export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplier", "name code")
      .populate("items.product", "name code unit")
      .sort({ date: -1, createdAt: -1 })
      .limit(500)
      .lean();

    return res.json(purchases);
  } catch (error) {
    console.error("GET PURCHASES ERROR:", error);
    return res.status(500).json({ message: "Failed to load purchases" });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { date, supplier = null, items, notes = "" } = req.body;

    if (!date || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Date and at least one item are required" });
    }

    const productIds = [...new Set(items.map((item) => String(item.product || "")))];
    const products = await Product.find({
      _id: { $in: productIds.filter((id) => mongoose.Types.ObjectId.isValid(id)) },
    }).select("_id").lean();
    const validProducts = new Set(products.map((product) => product._id.toString()));

    const cleanedItems = items.map((item, index) => {
      const productId = String(item.product || "");
      const quantity = Number(item.quantity);
      const rate = Number(item.rate || 0);

      if (!validProducts.has(productId) || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(rate) || rate < 0) {
        throw new Error(`Invalid purchase item ${index + 1}`);
      }

      return { product: productId, quantity, rate, amount: quantity * rate };
    });

    const totalAmount = cleanedItems.reduce((total, item) => total + item.amount, 0);
    const purchaseNumber = await getNextNumber("purchases", "PUR-", 6);
    const purchase = await Purchase.create({
      purchaseNumber,
      supplier: supplier && mongoose.Types.ObjectId.isValid(supplier) ? supplier : null,
      date: new Date(date),
      items: cleanedItems,
      totalAmount,
      notes: notes.trim(),
      createdBy: req.user?.id || req.user?._id,
    });

    const quantities = cleanedItems.reduce((result, item) => {
      result[item.product] = (result[item.product] || 0) + item.quantity;
      return result;
    }, {});
    const movements = [];

    for (const [productId, quantity] of Object.entries(quantities)) {
      const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { currentStock: quantity } },
        { new: true },
      ).select("currentStock");
      movements.push({ product: productId, type: "purchase", quantity, balanceAfter: product.currentStock, referenceType: "manual", referenceId: purchase._id, createdBy: req.user?.id || req.user?._id });
    }

    await StockMovement.insertMany(movements);
    return res.status(201).json(purchase);
  } catch (error) {
    console.error("CREATE PURCHASE ERROR:", error);
    return res.status(400).json({ message: error.message || "Failed to create purchase" });
  }
};
