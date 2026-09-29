import express from "express";
import { getPurchases, createPurchase } from "../controllers/purchaseController.js";
import { auth, requirePermission } from "../middleware/auth.js";

const router = express.Router();
router.use(auth);
router.get("/", requirePermission("products.view"), getPurchases);
router.post("/", requirePermission("products.edit"), createPurchase);

export default router;