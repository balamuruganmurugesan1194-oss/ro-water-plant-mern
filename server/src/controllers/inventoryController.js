import mongoose from "mongoose";
import Inventory from "../models/Inventory.js";
import StockMovement from "../models/StockMovement.js";
import Product from "../models/Product.js";

const userId = (req) => req.user?.id || req.user?._id || null;

export const getInventory = async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;

    const productFilter = {};
    if (search.trim()) {
      productFilter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { code: { $regex: search.trim(), $options: "i" } },
        { category: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const products = await Product.find(productFilter)
      .select("name code category unit rate active")
      .sort({ name: 1 })
      .limit(1000)
      .lean();

    const productIds = products.map((p) => p._id);
    const stocks = await Inventory.find({ product: { $in: productIds } })
      .lean();

    const stockMap = new Map(stocks.map((s) => [s.product.toString(), s]));

    let result = products.map((product) => {
      const stock = stockMap.get(product._id.toString());
      const quantity = Number(stock?.quantity || 0);
      const minimumStock = Number(stock?.minimumStock || 0);

      let stockStatus = "in-stock";
      if (quantity <= 0) stockStatus = "out-of-stock";
      else if (quantity <= minimumStock) stockStatus = "low-stock";

      return {
        ...product,
        quantity,
        minimumStock,
        stockStatus,
        inventoryId: stock?._id || null,
        updatedAt: stock?.updatedAt || null,
      };
    });

    if (status === "low") {
      result = result.filter((item) => item.stockStatus === "low-stock");
    } else if (status === "out") {
      result = result.filter((item) => item.stockStatus === "out-of-stock");
    } else if (status === "available") {
      result = result.filter((item) => item.quantity > 0);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("GET INVENTORY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getInventorySummary = async (req, res) => {
  try {
    const products = await Product.find({})
      .select("_id name code active")
      .lean();

    const stocks = await Inventory.find({}).lean();
    const map = new Map(stocks.map((s) => [s.product.toString(), s]));

    let totalProducts = products.length;
    let totalStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    for (const product of products) {
      const stock = map.get(product._id.toString());
      const quantity = Number(stock?.quantity || 0);
      const minimum = Number(stock?.minimumStock || 0);

      totalStock += quantity;
      if (quantity <= 0) outOfStock += 1;
      else if (quantity <= minimum) lowStock += 1;
    }

    res.status(200).json({
      totalProducts,
      totalStock,
      lowStock,
      outOfStock,
    });
  } catch (error) {
    console.error("GET INVENTORY SUMMARY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getStockMovements = async (req, res) => {
  try {
    const { productId, type, from, to, limit = 500 } = req.query;
    const filter = {};

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      filter.product = productId;
    }
    if (type) filter.type = type;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(`${from}T00:00:00`);
      if (to) filter.createdAt.$lte = new Date(`${to}T23:59:59.999`);
    }

    const movements = await StockMovement.find(filter)
      .populate("product", "name code unit category")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 500, 1000))
      .lean();

    res.status(200).json(movements);
  } catch (error) {
    console.error("GET STOCK MOVEMENTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const adjustStock = async (req, res) => {
  try {
    const { productId, quantity, minimumStock, reason = "" } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid product is required" });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newQuantity = Number(quantity);
    const newMinimum = Number(minimumStock ?? 0);

    if (!Number.isFinite(newQuantity) || newQuantity < 0) {
      return res.status(400).json({ message: "Stock quantity cannot be negative" });
    }

    if (!Number.isFinite(newMinimum) || newMinimum < 0) {
      return res.status(400).json({ message: "Minimum stock cannot be negative" });
    }

    const existing = await Inventory.findOne({ product: productId }).lean();
    const previousQuantity = Number(existing?.quantity || 0);
    const difference = newQuantity - previousQuantity;

    const inventory = await Inventory.findOneAndUpdate(
      { product: productId },
      {
        $set: {
          quantity: newQuantity,
          minimumStock: newMinimum,
          updatedBy: userId(req),
        },
        $setOnInsert: { product: productId },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    if (difference !== 0) {
      await StockMovement.create({
        product: productId,
        type: "adjustment",
        quantity: difference,
        balanceAfter: newQuantity,
        reason: reason.trim(),
        createdBy: userId(req),
      });
    }

    res.status(200).json({
      message: "Stock updated successfully",
      inventory,
    });
  } catch (error) {
    console.error("ADJUST STOCK ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};
