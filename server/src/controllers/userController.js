import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Role from "../models/Role.js";

// ==========================================
// GET USERS
// ==========================================

export const getUsers = async (
  req,
  res
) => {
  try {
    const users =
      await User.find()
        .select("-password")
        .populate(
          "role",
          "name description isActive"
        )
        .sort({
          createdAt: 1,
        });

    return res.status(200).json(users);
  } catch (error) {
    console.error(
      "Get users error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load users",
    });
  }
};

// ==========================================
// GET SINGLE USER
// ==========================================

export const getUser = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.params.id
      )
        .select("-password")
        .populate(
          "role",
          "name description isActive"
        );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get user error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch user",
    });
  }
};

// ==========================================
// CREATE USER
// ==========================================

export const createUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message:
          "Name is required",
      });
    }

    if (!email?.trim()) {
      return res.status(400).json({
        message:
          "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message:
          "Password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    if (!role) {
      return res.status(400).json({
        message:
          "Role is required",
      });
    }

    const roleExists =
      await Role.findById(role);

    if (!roleExists) {
      return res.status(400).json({
        message:
          "Selected role does not exist",
      });
    }

    if (
      roleExists.isActive ===
      false
    ) {
      return res.status(400).json({
        message:
          "Selected role is inactive",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const existingUser =
      await User.findOne({
        email:
          normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "Email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name: name.trim(),
        email:
          normalizedEmail,
        password:
          hashedPassword,
        role,

        // Every newly-created
        // user starts active.
        isActive: true,

        isDefault: false,

        isSuperAdmin: false,
      });

    const populatedUser =
      await User.findById(
        user._id
      )
        .select("-password")
        .populate(
          "role",
          "name description isActive"
        );

    return res.status(201).json({
      success: true,
      message:
        "User created successfully",
      user: populatedUser,
    });
  } catch (error) {
    console.error(
      "CREATE USER ERROR:",
      error
    );

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        message:
          "Email already exists",
      });
    }

    return res.status(500).json({
      message:
        error.message ||
        "Failed to create user",
    });
  }
};

// ==========================================
// UPDATE USER
// PUT /api/settings/users/:id
//
// IMPORTANT:
// isActive is NOT updated here.
// ==========================================

export const updateUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    const user =
      await User.findById(
        req.params.id
      ).select("+password");

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    // NAME

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message:
            "Name is required",
        });
      }

      user.name =
        name.trim();
    }

    // EMAIL

    if (email !== undefined) {
      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          message:
            "Email is required",
        });
      }

      const existingUser =
        await User.findOne({
          email:
            normalizedEmail,

          _id: {
            $ne: user._id,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          message:
            "Email already exists",
        });
      }

      user.email =
        normalizedEmail;
    }

    // ROLE

    if (role !== undefined) {
      if (!role) {
        return res.status(400).json({
          message:
            "Role is required",
        });
      }

      const roleExists =
        await Role.findById(role);

      if (!roleExists) {
        return res.status(400).json({
          message:
            "Selected role does not exist",
        });
      }

      if (
        roleExists.isActive ===
        false
      ) {
        return res.status(400).json({
          message:
            "Selected role is inactive",
        });
      }

      user.role = role;
    }

    // PASSWORD

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters",
        });
      }

      user.password =
        await bcrypt.hash(
          password,
          10
        );
    }

    // DO NOT UPDATE isActive HERE

    await user.save();

    const populatedUser =
      await User.findById(
        user._id
      )
        .select("-password")
        .populate(
          "role",
          "name description isActive"
        );

    return res.status(200).json({
      success: true,
      message:
        "User updated successfully",
      user: populatedUser,
    });
  } catch (error) {
    console.error(
      "UPDATE USER ERROR:",
      error
    );

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        message:
          "Email already exists",
      });
    }

    return res.status(500).json({
      message:
        error.message ||
        "Failed to update user",
    });
  }
};

// ==========================================
// UPDATE USER STATUS
//
// PATCH /api/settings/users/:id/status
// ==========================================

export const updateUserStatus =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        isActive,
      } = req.body;

      // ====================================
      // VALIDATION
      // ====================================

      if (
        typeof isActive !==
        "boolean"
      ) {
        return res.status(400).json({
          message:
            "isActive must be a boolean value",
        });
      }

      // ====================================
      // FIND USER
      // ====================================

      const user =
        await User.findById(id);

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      // ====================================
      // DEFAULT USER PROTECTION
      // ====================================

      if (
        user.isDefault ===
        true
      ) {
        return res.status(403).json({
          message:
            "Default user status cannot be changed",
        });
      }

      // ====================================
      // SUPER ADMIN PROTECTION
      // ====================================

      if (
        user.isSuperAdmin ===
        true
      ) {
        return res.status(403).json({
          message:
            "Super Administrator status cannot be changed",
        });
      }

      // ====================================
      // UPDATE STATUS
      // ====================================

      user.isActive =
        isActive;

      await user.save();

      // ====================================
      // RESPONSE
      // ====================================

      const updatedUser =
        await User.findById(
          id
        )
          .select("-password")
          .populate(
            "role",
            "name description isActive"
          );

      return res.status(200).json({
        success: true,

        message: isActive
          ? "User activated successfully"
          : "User deactivated successfully",

        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "UPDATE USER STATUS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update user status",
      });
    }
  };

// ==========================================
// DELETE USER
// ==========================================

export const deleteUser = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    // Prevent self-delete

    if (
      req.user &&
      req.user.id &&
      req.user.id.toString() ===
        user._id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot delete your own account",
      });
    }

    // Prevent default user delete

    if (
      user.isDefault ===
      true
    ) {
      return res.status(403).json({
        message:
          "Default user cannot be deleted",
      });
    }

    // Prevent super admin delete

    if (
      user.isSuperAdmin ===
      true
    ) {
      return res.status(403).json({
        message:
          "Super Administrator cannot be deleted",
      });
    }

    await User.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE USER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to delete user",
    });
  }
};