import express from "express";

import {
  getParties,
  createParty,
  deleteParty,
} from "../controllers/partyController.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

router.use(auth);

// ==========================================
// GET PARTIES
// GET /api/parties
// ==========================================

router.get(
  "/",
  getParties
);

// ==========================================
// CREATE PARTY
// POST /api/parties
// ==========================================

router.post(
  "/",
  createParty
);

// ==========================================
// DELETE PARTY
// DELETE /api/parties/:id
// ==========================================

router.delete(
  "/:id",
  deleteParty
);

export default router;