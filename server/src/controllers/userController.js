import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";

// ==========================================
// GET USERS
// GET /api/settings/users
// ==========================================

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("role", "name description isActive")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Failed to load users",
    });
  }
};

// ==========================================
// GET SINGLE USER
// GET /api/settings/users/:id
// ==========================================

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("role", "name description isActive");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};

// ==========================================
// CREATE USER
// POST /api/settings/users
// ==========================================

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, isActive = true } = req.body;

    // ======================================
    // NAME
    // ======================================

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    // ======================================
    // EMAIL
    // ======================================

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // ======================================
    // PASSWORD
    // ======================================

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // ======================================
    // ROLE
    // ======================================

    if (!role) {
      return res.status(400).json({
        message: "Role is required",
      });
    }

    const roleExists = await Role.findById(role);

    if (!roleExists) {
      return res.status(400).json({
        message: "Selected role does not exist",
      });
    }

    if (roleExists.isActive === false) {
      return res.status(400).json({
        message: "Selected role is inactive",
      });
    }

    // ======================================
    // EXISTING EMAIL
    // ======================================

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // ======================================
    // HASH PASSWORD
    // ======================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ======================================
    // CREATE USER
    // ======================================

    const user = await User.create({
      name: name.trim(),

      email: email.trim().toLowerCase(),

      password: hashedPassword,

      role: role,

      isActive: isActive !== false,

      isSuperAdmin: false,
    });

    // ======================================
    // RESPONSE
    // ======================================

    const responseUser = user.toObject();

    delete responseUser.password;

    const populatedUser = await User.findById(user._id)
      .select("-password")
      .populate("role", "name description isActive");

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: populatedUser,
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return res.status(500).json({
      message: error.message || "Failed to create user",
    });
  }
};

// ==========================================
// UPDATE USER
// PUT /api/settings/users/:id
// ==========================================

export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, isActive } = req.body;

    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ======================================
    // NAME
    // ======================================

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Name is required",
        });
      }

      user.name = name.trim();
    }

    // ======================================
    // EMAIL
    // ======================================

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: {
          $ne: user._id,
        },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }

      user.email = normalizedEmail;
    }

    // ======================================
    // ROLE
    // ======================================

    if (role !== undefined) {
      if (!role) {
        return res.status(400).json({
          message: "Role is required",
        });
      }

      const roleExists = await Role.findById(role);

      if (!roleExists) {
        return res.status(400).json({
          message: "Selected role does not exist",
        });
      }

      if (roleExists.isActive === false) {
        return res.status(400).json({
          message: "Selected role is inactive",
        });
      }

      user.role = role;
    }

    // ======================================
    // ACTIVE STATUS
    // ======================================

    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
    }

    // ======================================
    // PASSWORD
    // ======================================

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // ======================================
    // RESPONSE
    // ======================================

    const populatedUser = await User.findById(user._id)
      .select("-password")
      .populate("role", "name description isActive");

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: populatedUser,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return res.status(500).json({
      message: error.message || "Failed to update user",
    });
  }
};

// ==========================================
// DELETE USER
// DELETE /api/settings/users/:id
// ==========================================

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ======================================
    // PREVENT DELETING YOURSELF
    // ======================================

    if (
      req.user &&
      req.user.id &&
      req.user.id.toString() === user._id.toString()
    ) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    // ======================================
    // PREVENT DELETING SUPER ADMIN
    // ======================================

    if (user.isSuperAdmin === true) {
      return res.status(403).json({
        message: "Super Administrator cannot be deleted",
      });
    }

    // ======================================
    // DELETE
    // ======================================

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return res.status(500).json({
      message: error.message || "Failed to delete user",
    });
  }
};
