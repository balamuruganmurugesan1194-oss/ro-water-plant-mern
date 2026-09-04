import mongoose from "mongoose";

import Sale from "../models/Sale.js";
import SaleItem from "../models/SaleItem.js";
import Party from "../models/Party.js";
import Product from "../models/Product.js";
import Counter from "../models/Counter.js";
import { getNextNumber } from "../utils/getNextNumber.js";
// ==========================================
// GET SALES
// GET /api/sales
// ==========================================

export const getSales = async (req, res) => {
  try {
    const { month, type, search } = req.query;

    const filter = {
      isDeleted: false,
    };

    // ========================================
    // TYPE
    // ========================================

    if (type) {
      filter.type = type;
    }

    // ========================================
    // MONTH
    // ========================================

    if (month) {
      const [year, m] = month.split("-").map(Number);

      filter.date = {
        $gte: new Date(year, m - 1, 1),

        $lt: new Date(year, m, 1),
      };
    }

    // ========================================
    // SEARCH PARTY
    // ========================================

    if (search?.trim()) {
      const searchText = search.trim();

      const matchingParties = await Party.find({
        name: {
          $regex: searchText,
          $options: "i",
        },
      })
        .select("_id")
        .lean();

      const partyIds = matchingParties.map((party) => party._id);

      filter.$or = [
        {
          partyName: {
            $regex: searchText,
            $options: "i",
          },
        },

        {
          partyId: {
            $in: partyIds,
          },
        },
      ];
    }

    // ========================================
    // GET SALES
    // ========================================

    const sales = await Sale.find(filter)
      .populate("partyId", "name type")
      .sort({
        date: -1,
        createdAt: -1,
      })
      .limit(500)
      .lean();

    // ========================================
    // GET SALE ITEMS
    // ========================================

    const saleIds = sales.map((sale) => sale._id);

    const saleItems = await SaleItem.find({
      sale: {
        $in: saleIds,
      },
    })
      .populate("product")
      .lean();

    // ========================================
    // ATTACH ITEMS
    // ========================================

    const salesWithItems = sales.map((sale) => ({
      ...sale,

      items: saleItems.filter(
        (item) => item.sale.toString() === sale._id.toString(),
      ),
    }));

    res.status(200).json(salesWithItems);
  } catch (error) {
    console.error("GET SALES ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// CREATE SALE
// POST /api/sales
// ==========================================

export const createSale = async (req, res) => {
  try {
    const {
      date,
      partyId,
      partyName,
      type,
      items,
      paymentMode,
      paymentStatus,
      notes,
    } = req.body;

    // ========================================
    // DATE
    // ========================================

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    // ========================================
    // TYPE
    // ========================================

    if (!type) {
      return res.status(400).json({
        message: "Sale type is required",
      });
    }

    if (!["retail", "supplier", "other"].includes(type)) {
      return res.status(400).json({
        message: "Invalid sale type",
      });
    }

    // ========================================
    // PARTY
    // ========================================

    if (!partyName?.trim()) {
      return res.status(400).json({
        message: "Party name is required",
      });
    }

    let finalPartyId = null;

    let finalPartyName = partyName.trim();

    // ========================================
    // RETAIL
    // Customer Party
    // ========================================

    if (type === "retail") {
      if (!partyId || !mongoose.Types.ObjectId.isValid(partyId)) {
        return res.status(400).json({
          message: "Valid customer is required",
        });
      }

      const customer = await Party.findOne({
        _id: partyId,

        type: "customer",
      }).lean();

      if (!customer) {
        return res.status(400).json({
          message: "Customer not found",
        });
      }

      finalPartyId = customer._id;

      finalPartyName = customer.name;
    }

    // ========================================
    // SUPPLIER
    // ========================================

    if (type === "supplier") {
      if (!partyId || !mongoose.Types.ObjectId.isValid(partyId)) {
        return res.status(400).json({
          message: "Valid supplier is required",
        });
      }

      const supplier = await Party.findOne({
        _id: partyId,

        type: "supplier",
      }).lean();

      if (!supplier) {
        return res.status(400).json({
          message: "Supplier not found",
        });
      }

      finalPartyId = supplier._id;

      finalPartyName = supplier.name;
    }

    // ========================================
    // OTHER
    //
    // partyId remains null
    // partyName is entered manually
    // ========================================

    if (type === "other") {
      finalPartyId = null;

      finalPartyName = partyName.trim();
    }

    // ========================================
    // PAYMENT
    // ========================================

    if (!paymentMode) {
      return res.status(400).json({
        message: "Payment mode is required",
      });
    }

    if (!paymentStatus) {
      return res.status(400).json({
        message: "Payment status is required",
      });
    }

    // ========================================
    // ITEMS
    // ========================================

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one product is required",
      });
    }

    // ========================================
    // CLEAN ITEMS
    // ========================================

    const cleanedItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Product ID
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({
          message: `Valid product is required for item ${i + 1}`,
        });
      }

      // Check product
      const product = await Product.findById(item.product).lean();

      if (!product) {
        return res.status(400).json({
          message: `Product not found for item ${i + 1}`,
        });
      }

      // Quantity
      const quantity = Number(item.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: `Quantity must be greater than 0 for item ${i + 1}`,
        });
      }

      // Rate
      const rate = Number(item.rate);

      if (!Number.isFinite(rate) || rate <= 0) {
        return res.status(400).json({
          message: `Rate must be greater than 0 for item ${i + 1}`,
        });
      }

      const amount = quantity * rate;

      cleanedItems.push({
        product: item.product,

        quantity,

        rate,

        amount,
      });
    }

    // ========================================
    // TOTAL
    // ========================================

    const totalAmount = cleanedItems.reduce(
      (total, item) => total + item.amount,
      0,
    );

    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "Total amount must be greater than 0",
      });
    }
    // ==================================================
    // GENERATE SALE NUMBER
    // ==================================================

    const saleNumber = await getNextNumber("sales", "SAL-", 6);
    // ========================================
    // CREATE SALE
    // ========================================

    const sale = await Sale.create({
      saleNumber,
      type,

      date: new Date(date),

      partyId: finalPartyId,

      partyName: finalPartyName,

      amount: totalAmount,

      paymentMode,

      paymentStatus,

      notes: notes?.trim() || "",

      createdBy: req.user?.id || req.user?._id,

      isDeleted: false,

      deletedAt: null,

      deletedBy: null,
    });

    // ========================================
    // CREATE ITEMS
    // ========================================

    const saleItems = cleanedItems.map((item) => ({
      sale: sale._id,

      product: item.product,

      quantity: item.quantity,

      rate: item.rate,

      amount: item.amount,
    }));

    const createdItems = await SaleItem.insertMany(saleItems);

    // ========================================
    // RESPONSE
    // ========================================

    res.status(201).json({
      message: "Sale created successfully",

      sale: {
        ...sale.toObject(),

        items: createdItems,
      },
    });
  } catch (error) {
    console.error("CREATE SALE ERROR:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET SINGLE SALE
// GET /api/sales/:id
// ==========================================

export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid sale ID",
      });
    }

    const sale = await Sale.findOne({
      _id: id,

      isDeleted: false,
    })
      .populate("partyId", "name type")
      .populate("createdBy", "name email")
      .lean();

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    const items = await SaleItem.find({
      sale: sale._id,
    })
      .populate("product")
      .lean();

    res.status(200).json({
      ...sale,

      items,
    });
  } catch (error) {
    console.error("GET SALE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// SOFT DELETE SALE
// DELETE /api/sales/:id
// ==========================================

export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid sale ID",
      });
    }

    // ========================================
    // FIND ACTIVE SALE
    // ========================================

    const sale = await Sale.findOne({
      _id: id,

      isDeleted: false,
    });

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    // ========================================
    // SOFT DELETE
    // ========================================

    sale.isDeleted = true;

    sale.deletedAt = new Date();

    sale.deletedBy = req.user?.id || req.user?._id || null;

    await sale.save();

    // ========================================
    // DO NOT DELETE SALE ITEMS
    // ========================================
    //
    // SaleItems remain in DB.
    // This preserves history.
    //
    // ========================================

    res.status(200).json({
      ok: true,

      message: "Sale deleted successfully",

      sale: {
        _id: sale._id,

        isDeleted: sale.isDeleted,

        deletedAt: sale.deletedAt,

        deletedBy: sale.deletedBy,
      },
    });
  } catch (error) {
    console.error("SOFT DELETE SALE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
export const getNextSaleNumber = async (
  req,
  res
) => {
  try {
    const counter = await Counter.findOne({
      name: "sales",
    });

    const nextSequence =
      (counter?.seq || 0) + 1;

    const saleNumber = `SAL-${String(
      nextSequence
    ).padStart(6, "0")}`;

    return res.status(200).json({
      saleNumber,
    });
  } catch (error) {
    console.error(
      "NEXT SALE NUMBER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to generate next sale number",
    });
  }
};
