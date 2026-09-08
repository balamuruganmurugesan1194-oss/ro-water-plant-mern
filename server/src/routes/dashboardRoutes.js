import express from "express";

import { getDashboard } from "../controllers/dashboardController.js";

import { auth, requirePermission } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

router.use(auth);

// ==========================================
// GET DASHBOARD
// GET /api/dashboard?year=2026
// ==========================================

router.get("/", requirePermission("dashboard.view"), getDashboard);

export default router;
