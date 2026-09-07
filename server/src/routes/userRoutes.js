import express from "express";

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);
router.use(requireRole("admin"));

// READ
router.get("/", getUsers);

// READ SINGLE
router.get("/:id", getUser);

// CREATE
router.post("/", createUser);

// UPDATE
router.put("/:id", updateUser);

// DELETE
router.delete("/:id", deleteUser);

export default router;
