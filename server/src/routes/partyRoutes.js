import express from "express";

import {
  getParties,
  createParty,
  deleteParty,
  updateParty,
  getNextPartyCode,
} from "../controllers/partyController.js";

import { auth } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

router.use(auth);
router.get("/next-code", getNextPartyCode);
// ==========================================
// GET PARTIES
// GET /api/parties
// ==========================================

router.get("/", getParties);

// ==========================================
// CREATE PARTY
// POST /api/parties
// ==========================================

router.post("/", createParty);
// ==========================================
// UPDATE
// ADMIN + MANAGER
// ==========================================

router.put("/:id", updateParty);
// ==========================================
// DELETE PARTY
// DELETE /api/parties/:id
// ==========================================

router.delete("/:id", deleteParty);

export default router;
