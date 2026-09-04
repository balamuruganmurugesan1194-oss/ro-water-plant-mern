import express from "express";
import {
  getInventory,
  getInventorySummary,
  getStockMovements,
  adjustStock,
} from "../controllers/inventoryController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.get("/", getInventory);
router.get("/summary", getInventorySummary);
router.get("/movements", getStockMovements);
router.post("/adjust", adjustStock);

export default router;
