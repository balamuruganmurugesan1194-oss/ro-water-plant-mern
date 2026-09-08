import Product from "../models/Product.js";
import Counter from "../models/Counter.js";
import { getNextNumber } from "../utils/getNextNumber.js";

/*
|--------------------------------------------------------------------------
| GET PRODUCTS
| GET /api/products
|--------------------------------------------------------------------------
*/

export const getProducts = async (req, res) => {
  try {
    const { active, search } = req.query;

    const filter = {};

    // Active filter
    if (active !== undefined) {
      filter.active = active === "true";
    }

    // Search filter
    if (search?.trim()) {
      const searchText = search.trim();

      const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          code: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          category: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          unit: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE PRODUCT
| GET /api/products/:id
|--------------------------------------------------------------------------
*/

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
| POST /api/products
|--------------------------------------------------------------------------
*/

export const createProduct = async (req, res) => {
  try {
    console.log("PRODUCT REQUEST:", req.body);

    const { name, category, unit, rate, active, description } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!name?.trim()) {
      return res.status(400).json({
        field: "name",
        message: "Product name is required",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        field: "category",
        message: "Category is required",
      });
    }

    if (!unit?.trim()) {
      return res.status(400).json({
        field: "unit",
        message: "Unit is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | RATE VALIDATION
    |--------------------------------------------------------------------------
    */

    const numericRate = Number(rate);

    if (
      rate === undefined ||
      rate === null ||
      rate === "" ||
      !Number.isFinite(numericRate) ||
      numericRate <= 0
    ) {
      return res.status(400).json({
        field: "rate",
        message: "Rate must be greater than 0",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE VALUES
    |--------------------------------------------------------------------------
    */

    const normalizedName = name.trim();
    const normalizedCategory = category.trim();
    const normalizedUnit = unit.trim();
    const normalizedDescription = description?.trim() || "";

    /*
    |--------------------------------------------------------------------------
    | CHECK DUPLICATE PRODUCT NAME
    | Case-insensitive
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | GENERATE PRODUCT CODE
    |--------------------------------------------------------------------------
    */

    const generatedCode = await getNextNumber("product", "PRD", 4);

    console.log("GENERATED PRODUCT CODE:", generatedCode);

    /*
    |--------------------------------------------------------------------------
    | CREATE PRODUCT
    |--------------------------------------------------------------------------
    */

    const product = await Product.create({
      name: normalizedName,

      code: generatedCode,

      category: normalizedCategory,

      unit: normalizedUnit,

      rate: numericRate,

      active: active !== false,

      description: normalizedDescription,
    });

    console.log("PRODUCT CREATED:", product);

    return res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    /*
    |--------------------------------------------------------------------------
    | MONGODB DUPLICATE KEY ERROR
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | SERVER ERROR
    |--------------------------------------------------------------------------
    */

    return res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
| PUT /api/products/:id
|--------------------------------------------------------------------------
*/

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | DO NOT ALLOW CODE CHANGE
    |--------------------------------------------------------------------------
    | Product codes should remain stable because they
    | may already be referenced by sales/inventory.
    |--------------------------------------------------------------------------
    */

    if (req.body.code !== undefined && req.body.code !== product.code) {
      return res.status(400).json({
        field: "code",
        message: "Product code cannot be changed",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | NAME
    |--------------------------------------------------------------------------
    */

    if (req.body.name !== undefined) {
      if (!req.body.name?.trim()) {
        return res.status(400).json({
          field: "name",
          message: "Product name is required",
        });
      }

      const normalizedName = req.body.name.trim();

      const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const duplicate = await Product.findOne({
        _id: {
          $ne: product._id,
        },

        name: {
          $regex: `^${escapedName}$`,
          $options: "i",
        },
      });

      if (duplicate) {
        return res.status(409).json({
          field: "name",
          message: "Product name already exists",
        });
      }

      product.name = normalizedName;
    }

    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    if (req.body.category !== undefined) {
      if (!req.body.category?.trim()) {
        return res.status(400).json({
          field: "category",
          message: "Category is required",
        });
      }

      product.category = req.body.category.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | UNIT
    |--------------------------------------------------------------------------
    */

    if (req.body.unit !== undefined) {
      if (!req.body.unit?.trim()) {
        return res.status(400).json({
          field: "unit",
          message: "Unit is required",
        });
      }

      product.unit = req.body.unit.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | RATE
    |--------------------------------------------------------------------------
    */

    if (req.body.rate !== undefined) {
      const numericRate = Number(req.body.rate);

      if (!Number.isFinite(numericRate) || numericRate <= 0) {
        return res.status(400).json({
          field: "rate",
          message: "Rate must be greater than 0",
        });
      }

      product.rate = numericRate;
    }

    /*
    |--------------------------------------------------------------------------
    | ACTIVE
    |--------------------------------------------------------------------------
    */

    if (req.body.active !== undefined) {
      if (typeof req.body.active !== "boolean") {
        return res.status(400).json({
          field: "active",
          message: "'active' must be a boolean",
        });
      }

      product.active = req.body.active;
    }

    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    if (req.body.description !== undefined) {
      product.description = req.body.description?.trim() || "";
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

    await product.save();

    console.log("PRODUCT UPDATED:", product);

    return res.status(200).json(product);
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    /*
    |--------------------------------------------------------------------------
    | DUPLICATE KEY
    |--------------------------------------------------------------------------
    */

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
    }

    return res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
| DELETE /api/products/:id
|--------------------------------------------------------------------------
*/

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FUTURE IMPORTANT VALIDATION
    |--------------------------------------------------------------------------
    | Before permanently deleting a product,
    | we should check whether it is used in:
    |
    | - Sales
    | - Purchase
    | - Opening Stock
    | - Stock Adjustment
    | | - Stock Ledger
    |
    | If used, preferably deactivate instead.
    |--------------------------------------------------------------------------
    */

    await Product.findByIdAndDelete(req.params.id);

    console.log("PRODUCT DELETED:", product._id);

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| TOGGLE PRODUCT STATUS
| PATCH /api/products/:id/status
|--------------------------------------------------------------------------
*/

export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { active } = req.body;

    if (typeof active !== "boolean") {
      return res.status(400).json({
        field: "active",
        message: "'active' must be a boolean",
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        active,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    console.log("PRODUCT STATUS UPDATED:", {
      id,
      active,
    });

    return res.status(200).json({
      message: "Product status updated successfully",
      product,
    });
  } catch (error) {
    console.error("TOGGLE PRODUCT STATUS ERROR:", error);

    return res.status(500).json({
      message: "Failed to update product status",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET NEXT PRODUCT CODE
| GET /api/products/next-code
|--------------------------------------------------------------------------
*/

export const getNextProductCode = async (req, res) => {
  try {
    const counter = await Counter.findOne({
      name: "product",
    });

    const nextNumber = (counter?.seq || 0) + 1;

    const code = `PRD${String(nextNumber).padStart(4, "0")}`;

    return res.status(200).json({
      code,
    });
  } catch (error) {
    console.error("GET NEXT PRODUCT CODE ERROR:", error);

    return res.status(500).json({
      message: "Failed to generate product code",
      error: error.message,
    });
  }
};
