import express from "express";

import {
  getParties,
  createParty,
  deleteParty,
  updateParty,
  getNextPartyCode,
} from "../controllers/partyController.js";

import { auth, requirePermission } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// AUTHENTICATION
// ==========================================

router.use(auth);

// ==========================================
// GET NEXT PARTY CODE
// ==========================================

router.get("/next-code", requirePermission("parties.create"), getNextPartyCode);

// ==========================================
// GET PARTIES
// ==========================================

router.get("/", requirePermission("parties.view"), getParties);

// ==========================================
// CREATE PARTY
// ==========================================

router.post("/", requirePermission("parties.create"), createParty);

// ==========================================
// UPDATE PARTY
// ==========================================

router.put("/:id", requirePermission("parties.edit"), updateParty);

// ==========================================
// DELETE PARTY
// ==========================================

router.delete("/:id", requirePermission("parties.delete"), deleteParty);

export default router;
