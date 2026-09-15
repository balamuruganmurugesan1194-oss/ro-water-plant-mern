import mongoose from "mongoose";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";

const loadProduct = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return null;
  }

  return Product.findById(productId).select("name code unit currentStock reorderLevel");
};

export const getStockSummary = async (req, res) => {
  try {
    const filter = { active: true };

    if (req.query.lowStock === "true") {
      filter.$expr = { $lte: ["$currentStock", "$reorderLevel"] };
    }

    const products = await Product.find(filter)
      .select("name code category unit currentStock reorderLevel active")
      .sort({ name: 1 })
      .lean();

    return res.json(products);
  } catch (error) {
    console.error("GET STOCK SUMMARY ERROR:", error);
    return res.status(500).json({ message: "Failed to load stock summary" });
  }
};

export const getStockLedger = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await loadProduct(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const movements = await StockMovement.find({ product: productId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.json({ product, movements });
  } catch (error) {
    console.error("GET STOCK LEDGER ERROR:", error);
    return res.status(500).json({ message: "Failed to load stock ledger" });
  }
};

const applyMovement = async ({ productId, quantity, type, notes, userId }) => {
  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      ...(quantity < 0 ? { currentStock: { $gte: Math.abs(quantity) } } : {}),
    },
    { $inc: { currentStock: quantity } },
    { new: true },
  ).select("name code unit currentStock reorderLevel");

  if (!product) {
    throw new Error(quantity < 0 ? "Insufficient stock" : "Product not found");
  }

  await StockMovement.create({
    product: productId,
    type,
    quantity,
    balanceAfter: product.currentStock,
    referenceType: type === "opening" ? "opening" : "manual",
    notes: notes?.trim() || "",
    createdBy: userId,
  });

  return product;
};

export const createOpeningStock = async (req, res) => {
  try {
    const { productId, quantity, notes } = req.body;
    const amount = Number(quantity);

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ message: "Opening stock must be 0 or greater" });
    }

    const product = await applyMovement({
      productId,
      quantity: amount,
      type: "opening",
      notes,
      userId: req.user?.id || req.user?._id,
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("CREATE OPENING STOCK ERROR:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const createStockAdjustment = async (req, res) => {
  try {
    const { productId, quantity, notes } = req.body;
    const amount = Number(quantity);

    if (!Number.isFinite(amount) || amount === 0) {
      return res.status(400).json({ message: "Adjustment quantity cannot be 0" });
    }

    const product = await applyMovement({
      productId,
      quantity: amount,
      type: "adjustment",
      notes,
      userId: req.user?.id || req.user?._id,
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("CREATE STOCK ADJUSTMENT ERROR:", error);
    return res.status(400).json({ message: error.message });
  }
};
