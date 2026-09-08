import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

/*
|--------------------------------------------------------------------------
| GET ALL ROLES
|--------------------------------------------------------------------------
*/

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find()
      .populate("permissions", "key name module")
      .sort({ name: 1 });

    res.json(roles);
  } catch (error) {
    console.error("Get roles error:", error);

    res.status(500).json({
      message: "Failed to load roles",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ACTIVE ROLES
|--------------------------------------------------------------------------
*/

export const getActiveRoles = async (req, res) => {
  try {
    const roles = await Role.find({
      isActive: true,
    })
      .select("name description isSystemRole")
      .sort({ name: 1 });

    res.json(roles);
  } catch (error) {
    console.error("Get active roles error:", error);

    res.status(500).json({
      message: "Failed to load active roles",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ROLE
|--------------------------------------------------------------------------
*/

export const getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate(
      "permissions",
      "key name module",
    );

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    res.json(role);
  } catch (error) {
    console.error("Get role error:", error);

    res.status(500).json({
      message: "Failed to load role",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE ROLE
|--------------------------------------------------------------------------
*/

export const createRole = async (req, res) => {
  try {
    const { name, description = "", permissions = [] } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Role name is required",
      });
    }

    const existingRole = await Role.findOne({
      name: name.trim(),
    });

    if (existingRole) {
      return res.status(409).json({
        message: "Role already exists",
      });
    }

    const validPermissions = await Permission.find({
      _id: { $in: permissions },
      isActive: true,
    }).select("_id");

    const role = await Role.create({
      name: name.trim(),
      description: description.trim(),
      permissions: validPermissions.map((item) => item._id),
      isSystemRole: false,
      isActive: true,
    });

    const populatedRole = await Role.findById(role._id).populate(
      "permissions",
      "key name module",
    );

    res.status(201).json(populatedRole);
  } catch (error) {
    console.error("Create role error:", error);

    res.status(500).json({
      message: "Failed to create role",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ROLE
|--------------------------------------------------------------------------
*/

export const updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    if (role.name.toLowerCase() === "admin" && req.body.name) {
      if (req.body.name.trim().toLowerCase() !== "admin") {
        return res.status(400).json({
          message: "Admin role name cannot be changed",
        });
      }
    }

    const { name, description, permissions, isActive } = req.body;

    if (name !== undefined) {
      const duplicate = await Role.findOne({
        name: name.trim(),
        _id: { $ne: role._id },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Another role already uses this name",
        });
      }

      role.name = name.trim();
    }

    if (description !== undefined) {
      role.description = description.trim();
    }

    if (permissions !== undefined) {
      const validPermissions = await Permission.find({
        _id: { $in: permissions },
        isActive: true,
      }).select("_id");

      role.permissions = validPermissions.map((item) => item._id);
    }

    // Admin should always remain active
    if (isActive !== undefined && role.name.toLowerCase() !== "admin") {
      role.isActive = Boolean(isActive);
    }

    await role.save();

    const updatedRole = await Role.findById(role._id).populate(
      "permissions",
      "key name module",
    );

    res.json(updatedRole);
  } catch (error) {
    console.error("Update role error:", error);

    res.status(500).json({
      message: "Failed to update role",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE ROLE
|--------------------------------------------------------------------------
*/

export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    if (role.isSystemRole || role.name.toLowerCase() === "admin") {
      return res.status(400).json({
        message: "System roles cannot be deleted",
      });
    }

    await Role.findByIdAndDelete(role._id);

    res.json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Delete role error:", error);

    res.status(500).json({
      message: "Failed to delete role",
    });
  }
};
