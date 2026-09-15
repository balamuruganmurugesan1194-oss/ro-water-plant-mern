import express from "express";
import { getProductions, createProduction } from "../controllers/productionController.js";
import { auth, requirePermission } from "../middleware/auth.js";

const router = express.Router();
router.use(auth);
router.get("/", requirePermission("products.view"), getProductions);
router.post("/", requirePermission("products.edit"), createProduction);

export default router;