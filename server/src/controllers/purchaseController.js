import mongoose from "mongoose";

import Purchase from "../models/Purchase.js";
import PurchaseItem from "../models/PurchaseItem.js";
import Party from "../models/Party.js";
import Product from "../models/Product.js";
import Counter from "../models/counter.js";
import changeStock from "../services/inventoryService.js";

const getNextPurchaseNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "purchase" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  return `PUR-${String(counter.seq).padStart(5, "0")}`;
};

export const getPurchases = async (req, res) => {
  try {
    const { month, search } = req.query;

    const filter = { isDeleted: false };

    if (month) {
      const [year, m] = month.split("-").map(Number);

      if (Number.isInteger(year) && Number.isInteger(m) && m >= 1 && m <= 12) {
        filter.date = {
          $gte: new Date(year, m - 1, 1),
          $lt: new Date(year, m, 1),
        };
      }
    }

    if (search?.trim()) {
      const searchText = search.trim();

      const matchingSuppliers = await Party.find({
        type: "supplier",
        name: { $regex: searchText, $options: "i" },
      })
        .select("_id")
        .lean();

      const supplierIds = matchingSuppliers.map((item) => item._id);

      const matchingProducts = await Product.find({
        $or: [
          { name: { $regex: searchText, $options: "i" } },
          { code: { $regex: searchText, $options: "i" } },
        ],
      })
        .select("_id")
        .lean();

      const productIds = matchingProducts.map((item) => item._id);

      const matchingItemPurchases = await PurchaseItem.find({
        product: { $in: productIds },
      })
        .select("purchase")
        .lean();

      const purchaseIdsByProduct = matchingItemPurchases.map(
        (item) => item.purchase,
      );

      filter.$or = [
        { purchaseNumber: { $regex: searchText, $options: "i" } },
        { supplierName: { $regex: searchText, $options: "i" } },
        { supplierId: { $in: supplierIds } },
        { _id: { $in: purchaseIdsByProduct } },
      ];
    }

    const purchases = await Purchase.find(filter)
      .populate("supplierId", "name type code contactNumber")
      .sort({ date: -1, createdAt: -1 })
      .limit(500)
      .lean();

    const purchaseIds = purchases.map((item) => item._id);

    const items = await PurchaseItem.find({
      purchase: { $in: purchaseIds },
    })
      .populate("product", "name code category unit rate active")
      .lean();

    const result = purchases.map((purchase) => ({
      ...purchase,
      items: items.filter(
        (item) => item.purchase.toString() === purchase._id.toString(),
      ),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("GET PURCHASES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid purchase ID" });
    }

    const purchase = await Purchase.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("supplierId", "name type code contactNumber address")
      .populate("createdBy", "name email")
      .lean();

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    const items = await PurchaseItem.find({ purchase: purchase._id })
      .populate("product", "name code category unit rate active")
      .lean();

    res.status(200).json({ ...purchase, items });
  } catch (error) {
    console.error("GET PURCHASE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { date, supplierId, items, paymentMode, paymentStatus, notes } =
      req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    if (!supplierId || !mongoose.Types.ObjectId.isValid(supplierId)) {
      return res.status(400).json({ message: "Valid supplier is required" });
    }

    const supplier = await Party.findOne({
      _id: supplierId,
      type: "supplier",
    }).lean();

    if (!supplier) {
      return res.status(400).json({ message: "Supplier not found" });
    }

    if (!paymentMode) {
      return res.status(400).json({ message: "Payment mode is required" });
    }

    if (!paymentStatus) {
      return res.status(400).json({ message: "Payment status is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one product is required",
      });
    }

    const cleanedItems = [];

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];

      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({
          message: `Valid product is required for item ${index + 1}`,
        });
      }

      const product = await Product.findById(item.product).lean();

      if (!product) {
        return res.status(400).json({
          message: `Product not found for item ${index + 1}`,
        });
      }

      const quantity = Number(item.quantity);
      const rate = Number(item.rate);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: `Quantity must be greater than 0 for item ${index + 1}`,
        });
      }

      if (!Number.isFinite(rate) || rate < 0) {
        return res.status(400).json({
          message: `Rate cannot be negative for item ${index + 1}`,
        });
      }

      cleanedItems.push({
        product: product._id,
        quantity,
        rate,
        amount: quantity * rate,
      });
    }

    const totalAmount = cleanedItems.reduce(
      (total, item) => total + item.amount,
      0,
    );

    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "Total amount must be greater than 0",
      });
    }

    const purchaseNumber = await getNextPurchaseNumber();

    const purchase = await Purchase.create({
      purchaseNumber,
      date: new Date(date),
      supplierId: supplier._id,
      supplierName: supplier.name,
      amount: totalAmount,
      paymentMode,
      paymentStatus,
      notes: notes?.trim() || "",
      createdBy: req.user?.id || req.user?._id || null,
    });

    const purchaseItems = cleanedItems.map((item) => ({
      purchase: purchase._id,
      ...item,
    }));

    const createdItems = await PurchaseItem.insertMany(purchaseItems);

    for (const item of createdItems) {
      await changeStock({
        productId: item.product,
        quantity: item.quantity,
        type: "purchase",
        referenceId: purchase._id,
        referenceNumber: purchase.purchaseNumber,
        reason: "Purchase",
        req,
      });
    }

    res.status(201).json({
      message: "Purchase created successfully",
      purchase: {
        ...purchase.toObject(),
        items: createdItems,
      },
    });
  } catch (error) {
    console.error("CREATE PURCHASE ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid purchase ID" });
    }
    const purchaseItems = await PurchaseItem.find({
      purchase: purchase._id,
    }).lean();

    for (const item of purchaseItems) {
      await changeStock({
        productId: item.product,
        quantity: -Number(item.quantity),
        type: "purchase-reversal",
        referenceId: purchase._id,
        referenceNumber: purchase.purchaseNumber,
        reason: "Purchase deleted",
        req,
      });
    }

    const purchase = await Purchase.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    purchase.isDeleted = true;
    purchase.deletedAt = new Date();
    purchase.deletedBy = req.user?.id || req.user?._id || null;

    await purchase.save();

    res.status(200).json({
      ok: true,
      message: "Purchase deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PURCHASE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
