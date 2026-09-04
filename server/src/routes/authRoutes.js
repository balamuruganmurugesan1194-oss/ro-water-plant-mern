import express from "express";

import { login, getMe } from "../controllers/authController.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// LOGIN
// POST /api/auth/login
// PUBLIC
// ==========================================

router.post("/login", login);

// ==========================================
// CURRENT USER
// GET /api/auth/me
// PROTECTED
// ==========================================

router.get("/me", auth, getMe);

export default router;
