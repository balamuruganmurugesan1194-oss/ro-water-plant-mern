import express from "express";

import {
  getDashboard,
} from "../controllers/dashboardController.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

// Authentication
router.use(auth);

// GET /api/dashboard
router.get(
  "/",
  getDashboard
);

export default router;