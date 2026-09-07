import User from "../models/User.js";

export const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      if (!req.user?._id) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      const user = await User.findById(req.user._id)
        .populate({
          path: "role",
          populate: {
            path: "permissions",
            match: {
              isActive: true,
            },
          },
        })
        .select("name email role");

      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      // Admin bypass
      if (user.role?.name?.toLowerCase() === "admin") {
        req.currentUser = user;
        return next();
      }

      if (!user.role || !user.role.isActive) {
        return res.status(403).json({
          message: "Your role is inactive",
        });
      }

      const hasPermission = user.role.permissions.some(
        (permission) => permission.key === permissionKey,
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: `Permission denied: ${permissionKey}`,
        });
      }

      req.currentUser = user;

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);

      res.status(500).json({
        message: "Permission validation failed",
      });
    }
  };
};
