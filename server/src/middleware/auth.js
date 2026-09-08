import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. Token required.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. Token required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select("-password")
      .populate({
        path: "role",
        populate: {
          path: "permissions",
          match: { isActive: true },
          select: "key name module description isActive",
        },
      });

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account has been disabled.",
      });
    }

    // Administrator / Super Admin gets all permissions
    const permissions = user.isSuperAdmin
      ? ["*"]
      : (user.role?.permissions || []).map((permission) => permission.key);

    const role = user.role
      ? {
          id: user.role._id.toString(),
          name: user.role.name,
          description: user.role.description,
          isSystemRole: user.role.isSystemRole,
        }
      : null;

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      role,
      permissions,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token.",
      });
    }

    return res.status(401).json({
      message: "Authentication failed.",
    });
  }
};

/**
 * Permission middleware
 *
 * Example:
 * requirePermission("sales.create")
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    // Administrator / Super Admin can do everything
    if (req.user?.isSuperAdmin === true) {
      return next();
    }

    if (!req.user?.permissions?.includes(permission)) {
      return res.status(403).json({
        message: "You do not have permission",
        permission,
      });
    }

    next();
  };
};

/**
 * Optional role middleware
 *
 * Use only when a particular API must be restricted
 * to specific roles.
 *
 * Example:
 * requireRole("Manager", "Admin")
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Super Admin bypass
    if (req.user?.isSuperAdmin === true) {
      return next();
    }

    const userRole = req.user?.role?.name;

    if (!userRole) {
      return res.status(403).json({
        message: "No role assigned to this user.",
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "You do not have the required role.",
        requiredRoles: allowedRoles,
        currentRole: userRole,
      });
    }

    next();
  };
};
