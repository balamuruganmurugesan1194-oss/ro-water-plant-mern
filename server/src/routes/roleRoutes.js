import express from "express";

import {
  getRoles,
  getActiveRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";

import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

/*
|--------------------------------------------------------------------------
| Roles are currently protected for Admin.
|--------------------------------------------------------------------------
*/

router.get("/", requireRole("admin"), getRoles);

router.get("/active", getActiveRoles);

router.get("/:id", requireRole("admin"), getRole);

router.post("/", requireRole("admin"), createRole);

router.put("/:id", requireRole("admin"), updateRole);

router.delete("/:id", requireRole("admin"), deleteRole);

export default router;
