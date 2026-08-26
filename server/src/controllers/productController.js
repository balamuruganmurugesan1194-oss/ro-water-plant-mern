import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const { active } = req.query;

    const filter = {};

    if (active !== undefined) {
      filter.active = active === "true";
    }

    const products = await Product.find(filter)
      .sort({ name: 1 });

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
    const product = await Product.findById(
      req.params.id
    );

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


export const createProduct = async (req, res) => {
  try {
    console.log(
      "PRODUCT REQUEST:",
      req.body
    );

    const {
      name,
      code,
      category,
      unit,
      rate,
      active,
      description,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    if (!code?.trim()) {
      return res.status(400).json({
        message: "Product code is required",
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

    if (
      rate === undefined ||
      Number(rate) <= 0
    ) {
      return res.status(400).json({
        message:
          "Rate must be greater than 0",
      });
    }

    const normalizedCode =
      code.trim().toUpperCase();

    const existingProduct =
      await Product.findOne({
        code: normalizedCode,
      });

    if (existingProduct) {
      return res.status(409).json({
        message:
          "Product code already exists",
      });
    }

    const product =
      await Product.create({
        name: name.trim(),

        code: normalizedCode,

        category: category.trim(),

        unit: unit.trim(),

        rate: Number(
          rate
        ),
        active:
          active !== false,

        description:
          description?.trim() || "",
      });

    console.log(
      "PRODUCT CREATED:",
      product
    );

    res.status(201).json(product);
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};


export const updateProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};


export const deleteProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

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
      { new: true }
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
