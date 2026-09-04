import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ==========================================
// LOGIN
// POST /api/auth/login
// ==========================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ======================================
    // VALIDATION
    // ======================================

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    // ======================================
    // NORMALIZE EMAIL
    // ======================================

    const normalizedEmail = String(email).trim().toLowerCase();

    // ======================================
    // FIND USER
    // ======================================

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ======================================
    // ACTIVE CHECK
    // ======================================

    if (user.active === false) {
      return res.status(403).json({
        message: "Your account has been disabled",
      });
    }

    // ======================================
    // PASSWORD CHECK
    // ======================================

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // ======================================
    // JWT SECRET
    // ======================================

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        message: "JWT configuration is missing",
      });
    }

    // ======================================
    // CREATE TOKEN
    // ======================================

    const token = jwt.sign(
      {
        id: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "12h",
      },
    );

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      token,

      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

// ==========================================
// GET CURRENT USER
// GET /api/auth/me
// ==========================================

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    return res.status(500).json({
      message: "Failed to get user",
    });
  }
};
