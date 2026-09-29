import express from "express";
import { auth, requirePermission } from "../middleware/auth.js";
import { salesReport, purchaseReport, expenseReport, profitLossReport, stockReport, customerOutstanding, supplierOutstanding, dailyCollection } from "../controllers/reportController.js";

const router = express.Router();
router.use(auth, requirePermission("dashboard.view"));
router.get("/sales", salesReport);
router.get("/purchases", purchaseReport);
router.get("/expenses", expenseReport);
router.get("/profit-loss", profitLossReport);
router.get("/stock", stockReport);
router.get("/customer-outstanding", customerOutstanding);
router.get("/supplier-outstanding", supplierOutstanding);
router.get("/daily-collection", dailyCollection);
export default router;
