import Product from "../models/Product.js";
import Counter from "../models/Counter.js";
import { getNextNumber } from "../utils/getNextNumber.js";
export const getProducts = async (req, res) => {
  try {
    const { active } = req.query;

    const filter = {};

    if (active !== undefined) {
      filter.active = active === "true";
    }

    const products = await Product.find(filter).sort({ code: 1 });

    res.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE PRODUCT
// POST /api/products
// ==========================================

export const createProduct = async (req, res) => {
  try {
    console.log("PRODUCT REQUEST:", req.body);

    const { name, category, unit, rate, active, description } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (!unit?.trim()) {
      return res.status(400).json({
        message: "Unit is required",
      });
    }

    // ==========================================
    // RATE VALIDATION
    // ==========================================

    const numericRate = Number(rate);

    if (
      rate === undefined ||
      rate === null ||
      rate === "" ||
      !Number.isFinite(numericRate) ||
      numericRate <= 0
    ) {
      return res.status(400).json({
        message: "Rate must be greater than 0",
      });
    }

    // ==========================================
    // NORMALIZE VALUES
    // ==========================================

    const normalizedName = name.trim();

    // ==========================================
    // CHECK DUPLICATE PRODUCT NAME
    // Case-insensitive
    // ==========================================

    const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const existingName = await Product.findOne({
      name: {
        $regex: `^${escapedName}$`,
        $options: "i",
      },
    });

    if (existingName) {
      return res.status(409).json({
        field: "name",
        message: "Product name already exists",
      });
    }

    // ==========================================
    // GENERATE PRODUCT CODE
    // ATOMIC COUNTER
    // ==========================================

    // const counter = await Counter.findOneAndUpdate(
    //   { name: "product" },
    //   {
    //     $inc: {
    //       seq: 1,
    //     },
    //   },
    //   {
    //     new: true,
    //     upsert: true,
    //     setDefaultsOnInsert: true,
    //   },
    // );

    // const generatedCode = `PRD${String(counter.seq).padStart(4, "0")}`;

    // console.log("GENERATED PRODUCT CODE:", generatedCode);
    const generatedCode = await getNextNumber("product", "PRD", 4);
    // ==========================================
    // CREATE PRODUCT
    // ==========================================

    const product = await Product.create({
      name: normalizedName,

      code: generatedCode,

      category: category.trim(),

      unit: unit.trim(),

      rate: numericRate,

      active: active !== false,

      description: description?.trim() || "",
    });

    console.log("PRODUCT CREATED:", product);

    return res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    // ==========================================
    // MONGODB DUPLICATE KEY ERROR
    // ==========================================

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      if (duplicateField === "name") {
        return res.status(409).json({
          field: "name",
          message: "Product name already exists",
        });
      }

      if (duplicateField === "code") {
        return res.status(409).json({
          field: "code",
          message: "Product code already exists",
        });
      }

      return res.status(409).json({
        message: "Product already exists",
      });
    }

    // ==========================================
    // SERVER ERROR
    // ==========================================

    return res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== "boolean") {
      return res.status(400).json({ message: "'active' must be a boolean" });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { active },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("toggleProductStatus error:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};
export const getNextProductCode = async (req, res) => {
  try {
    const counter = await Counter.findOne({
      name: "product",
    });

    const nextNumber = (counter?.seq || 0) + 1;

    const code = `PRD${String(nextNumber).padStart(4, "0")}`;

    res.status(200).json({
      code,
    });
  } catch (error) {
    console.error("GET NEXT PRODUCT CODE ERROR:", error);

    res.status(500).json({
      message: "Failed to generate product code",
    });
  }
};
