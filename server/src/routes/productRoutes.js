import express from "express";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getNextProductCode,
} from "../controllers/productController.js";

import { auth, requirePermission } from "../middleware/auth.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| IMPORTANT
| /next-code must come BEFORE /:id
|--------------------------------------------------------------------------
*/

router.get(
  "/next-code",
  auth,
  requirePermission("products.view"),
  getNextProductCode,
);

router.get("/", auth, requirePermission("products.view"), getProducts);

router.get("/:id", auth, requirePermission("products.view"), getProduct);

router.post("/", auth, requirePermission("products.create"), createProduct);

router.put("/:id", auth, requirePermission("products.edit"), updateProduct);

router.patch(
  "/:id/status",
  auth,
  requirePermission("products.edit"),
  toggleProductStatus,
);

router.delete(
  "/:id",
  auth,
  requirePermission("products.delete"),
  deleteProduct,
);

export default router;
