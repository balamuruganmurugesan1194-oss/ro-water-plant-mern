import express from "express";
import { auth, requirePermission } from "../middleware/auth.js";
import { createDelivery, getDeliveries, createJarMovement, getJarBalances, createPayment, getPayments } from "../controllers/operationsController.js";

const router = express.Router();
router.use(auth);
router.get("/deliveries", requirePermission("sales.view"), getDeliveries);
router.post("/deliveries", requirePermission("sales.create"), createDelivery);
router.get("/jars", requirePermission("parties.view"), getJarBalances);
router.post("/jars", requirePermission("sales.create"), createJarMovement);
router.get("/payments", requirePermission("parties.view"), getPayments);
router.post("/payments", requirePermission("sales.create"), createPayment);
export default router;
