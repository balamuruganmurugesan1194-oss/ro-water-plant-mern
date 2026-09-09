import express from "express";

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";

import { auth, requirePermission } from "../middleware/auth.js";

const router = express.Router();

// ==========================================
// ALL USER ROUTES REQUIRE LOGIN
// ==========================================

router.use(auth);

// ==========================================
// GET USERS
// ==========================================

router.get("/", requirePermission("users.view"), getUsers);

// ==========================================
// GET SINGLE USER
// ==========================================

router.get("/:id", requirePermission("users.view"), getUser);

// ==========================================
// CREATE USER
// ==========================================

router.post("/", requirePermission("users.create"), createUser);

// ==========================================
// UPDATE USER
// ==========================================

router.put("/:id", requirePermission("users.edit"), updateUser);

// ==========================================
// UPDATE USER STATUS
// ==========================================

router.patch("/:id/status", requirePermission("users.edit"), updateUserStatus);

// ==========================================
// DELETE USER
// ==========================================

router.delete("/:id", requirePermission("users.delete"), deleteUser);

export default router;
