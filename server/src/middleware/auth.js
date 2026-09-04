import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ==========================================
// AUTHENTICATION
// ==========================================

export const auth = async (req, res, next) => {
  try {
    // ======================================
    // CHECK JWT SECRET
    // ======================================

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        message: "JWT configuration is missing",
      });
    }

    // ======================================
    // GET AUTHORIZATION HEADER
    // ======================================

    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // ======================================
    // GET TOKEN
    // ======================================

    const token = header.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // ======================================
    // VERIFY TOKEN
    // ======================================

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired",
          code: "TOKEN_EXPIRED",
        });
      }

      return res.status(401).json({
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    // ======================================
    // FIND USER
    // ======================================

    const user = await User.findById(decoded.id)
      .select("_id name email role active")
      .lean();

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // ======================================
    // CHECK ACTIVE
    // ======================================

    if (user.active === false) {
      return res.status(403).json({
        message: "Your account has been disabled",
      });
    }

    // ======================================
    // ATTACH USER TO REQUEST
    // ======================================

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    };

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);

    return res.status(500).json({
      message: "Authentication failed",
    });
  }
};

// ==========================================
// ROLE AUTHORIZATION
// ==========================================

export const requireRole = (...roles) => {
  return (req, res, next) => {
    // User must be authenticated
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Check role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Insufficient permissions",
      });
    }

    next();
  };
};
