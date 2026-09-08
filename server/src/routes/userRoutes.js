import express from "express";

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
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
// users.view
// ==========================================

router.get("/", requirePermission("users.view"), getUsers);

// ==========================================
// GET SINGLE USER
// users.view
// ==========================================

router.get("/:id", requirePermission("users.view"), getUser);

// ==========================================
// CREATE USER
// users.create
// ==========================================

router.post("/", requirePermission("users.create"), createUser);

// ==========================================
// UPDATE USER
// users.edit
// ==========================================

router.put("/:id", requirePermission("users.edit"), updateUser);

// ==========================================
// DELETE USER
// users.delete
// ==========================================

router.delete("/:id", requirePermission("users.delete"), deleteUser);

export default router;
