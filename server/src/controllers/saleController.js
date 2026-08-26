import Sale from "../models/Sale.js";

// ==========================================
// GET SALES
// GET /api/sales
// ==========================================

export const getSales = async (req, res) => {
  try {
    const {
      month,
      type,
      search,
    } = req.query;

    const filter = {};

    // ------------------------------
    // Type filter
    // ------------------------------

    if (type) {
      filter.type = type;
    }

    // ------------------------------
    // Month filter
    // ------------------------------

    if (month) {
      const [year, m] = month
        .split("-")
        .map(Number);

      filter.date = {
        $gte: new Date(
          year,
          m - 1,
          1
        ),

        $lt: new Date(
          year,
          m,
          1
        ),
      };
    }

    // ------------------------------
    // Search
    // ------------------------------

    if (search?.trim()) {
      filter.$or = [
        {
          customerName: {
            $regex: search.trim(),
            $options: "i",
          },
        },

        {
          product: {
            $regex: search.trim(),
            $options: "i",
          },
        },

        {
          area: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // ------------------------------
    // Get sales
    // ------------------------------

    const sales = await Sale.find(filter)
      .sort({
        date: -1,
        createdAt: -1,
      })
      .limit(500);

    res.status(200).json(sales);
  } catch (error) {
    console.error(
      "GET SALES ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ==========================================
// CREATE SALE
// POST /api/sales
// ==========================================

export const createSale = async (
  req,
  res
) => {
  try {
    const b = req.body;

    // ------------------------------
    // Basic validation
    // ------------------------------

    if (!b.date) {
      return res.status(400).json({
        message: "Date is required",
      });
    }

    if (!b.customerName?.trim()) {
      return res.status(400).json({
        message:
          "Customer name is required",
      });
    }

    if (!b.type) {
      return res.status(400).json({
        message: "Sale type is required",
      });
    }

    if (!b.paymentMode) {
      return res.status(400).json({
        message:
          "Payment mode is required",
      });
    }

    if (!b.paymentStatus) {
      return res.status(400).json({
        message:
          "Payment status is required",
      });
    }

    // ------------------------------
    // Quantity & rate
    // ------------------------------

    const quantity = Number(
      b.quantity || 0
    );

    const rate = Number(
      b.rate || 0
    );

    // ------------------------------
    // Amount
    // ------------------------------

    const amount =
      b.type === "other"
        ? Number(b.amount || 0)
        : quantity * rate;

    // ------------------------------
    // Jar tracking
    // ------------------------------

    const jarsDelivered = Number(
      b.jarsDelivered || 0
    );

    const jarsReturned = Number(
      b.jarsReturned || 0
    );

    const jarsOutstanding =
      Math.max(
        0,
        jarsDelivered -
          jarsReturned
      );

    // ------------------------------
    // Create sale
    // ------------------------------

    const sale = await Sale.create({
      ...b,

      customerName:
        b.customerName.trim(),

      quantity,

      rate,

      amount,

      date: new Date(b.date),

      jarsDelivered,

      jarsReturned,

      jarsOutstanding,

      createdBy:
        req.user.id,
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error(
      "CREATE SALE ERROR:",
      error
    );

    res.status(400).json({
      message: error.message,
    });
  }
};


// ==========================================
// DELETE SALE
// DELETE /api/sales/:id
// ==========================================

export const deleteSale = async (
  req,
  res
) => {
  try {
    const sale =
      await Sale.findByIdAndDelete(
        req.params.id
      );

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    res.status(200).json({
      ok: true,
      message:
        "Sale deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE SALE ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};