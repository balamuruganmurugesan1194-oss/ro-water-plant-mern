import express from "express";

import {
  getPermissions,
  createPermission,
} from "../controllers/permissionController.js";

import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.get("/", requireRole("admin"), getPermissions);

router.post("/", requireRole("admin"), createPermission);

export default router;
