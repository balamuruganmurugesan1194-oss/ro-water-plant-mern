import express from "express";

import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  deletePurchase,
} from "../controllers/purchaseController.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.get("/", getPurchases);
router.get("/:id", getPurchaseById);
router.post("/", createPurchase);
router.delete("/:id", deletePurchase);

export default router;
