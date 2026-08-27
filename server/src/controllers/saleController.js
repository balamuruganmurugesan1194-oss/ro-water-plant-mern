import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import SaleItem from "../models/SaleItem.js";

// ==========================================
// GET SALES
// GET /api/sales
// ==========================================

export const getSales = async (req, res) => {
  try {
    const { month, type, search } = req.query;

    const filter = {};

    // ------------------------------------------
    // Type filter
    // ------------------------------------------

    if (type) {
      filter.type = type;
    }

    // ------------------------------------------
    // Month filter
    // ------------------------------------------

    if (month) {
      const [year, m] = month.split("-").map(Number);

      filter.date = {
        $gte: new Date(year, m - 1, 1),
        $lt: new Date(year, m, 1),
      };
    }

    // ------------------------------------------
    // Search
    // ------------------------------------------

    if (search?.trim()) {
      const searchText = search.trim();

      filter.$or = [
        {
          customerName: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    // ------------------------------------------
    // Get sales
    // ------------------------------------------

    const sales = await Sale.find(filter)
      .sort({
        date: -1,
        createdAt: -1,
      })
      .limit(500)
      .lean();

    // ------------------------------------------
    // Get sale items
    // ------------------------------------------

    const saleIds = sales.map((sale) => sale._id);

    const saleItems = await SaleItem.find({
      sale: { $in: saleIds },
    })
      .populate("product")
      .lean();

    // ------------------------------------------
    // Attach items to each sale
    // ------------------------------------------

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
      customerName,
      type,
      items,
      paymentMode,
      paymentStatus,
      notes,
    } = req.body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    if (!customerName?.trim()) {
      return res.status(400).json({
        message: "Customer name is required",
      });
    }

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

    // ==========================================
    // ITEMS VALIDATION
    // ==========================================

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one product is required",
      });
    }

    // ==========================================
    // VALIDATE ITEMS
    // ==========================================

    const cleanedItems = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.product?.trim()) {
        return res.status(400).json({
          message: `Product is required for item ${i + 1}`,
        });
      }

      const quantity = Number(item.quantity);

      const rate = Number(item.rate);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: `Quantity must be greater than 0 for item ${i + 1}`,
        });
      }

      if (!Number.isFinite(rate) || rate <= 0) {
        return res.status(400).json({
          message: `Rate must be greater than 0 for item ${i + 1}`,
        });
      }

      const amount = quantity * rate;

      cleanedItems.push({
        product: item.product.trim(),
        quantity,
        rate,
        amount,
      });
    }

    // ==========================================
    // CALCULATE TOTAL
    // ==========================================

    const totalAmount = cleanedItems.reduce(
      (total, item) => total + item.amount,
      0,
    );

    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "Total amount must be greater than 0",
      });
    }

    // ==========================================
    // CREATE SALE
    // ==========================================

    const sale = await Sale.create({
      type,

      date: new Date(date),

      customerName: customerName.trim(),

      amount: totalAmount,

      paymentMode,

      paymentStatus,

      notes: notes?.trim() || "",

      createdBy: req.user?.id,
    });

    // ==========================================
    // CREATE SALE ITEMS
    // ==========================================

    const saleItems = cleanedItems.map((item) => ({
      sale: sale._id,

      product: item.product,

      quantity: item.quantity,

      rate: item.rate,

      amount: item.amount,
    }));

    const createdItems = await SaleItem.insertMany(saleItems);

    // ==========================================
    // RESPONSE
    // ==========================================

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

    const sale = await Sale.findById(id).lean();

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    const items = await SaleItem.find({
      sale: sale._id,
    }).lean();

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
// DELETE SALE
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

    // ------------------------------------------
    // Find sale
    // ------------------------------------------

    const sale = await Sale.findById(id);

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    // ------------------------------------------
    // Delete sale items
    // ------------------------------------------

    await SaleItem.deleteMany({
      sale: sale._id,
    });

    // ------------------------------------------
    // Delete sale
    // ------------------------------------------

    await Sale.findByIdAndDelete(id);

    // ------------------------------------------
    // Response
    // ------------------------------------------

    res.status(200).json({
      ok: true,
      message: "Sale deleted successfully",
    });
  } catch (error) {
    console.error("DELETE SALE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
