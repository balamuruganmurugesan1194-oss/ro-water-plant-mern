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

const router = express.Router();

router.get("/next-code", getNextProductCode);

router.get("/", getProducts);

router.get("/:id", getProduct);

router.post("/", createProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

router.patch("/:id/status", toggleProductStatus);


export default router;
