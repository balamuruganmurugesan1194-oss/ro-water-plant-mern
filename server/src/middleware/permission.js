export const requirePermission = (permission) => {
  return (req, res, next) => {
    // ======================================
    // SUPER ADMIN
    // ======================================

    if (req.user?.isSuperAdmin) {
      return next();
    }

    // ======================================
    // CHECK PERMISSION
    // ======================================

    const hasPermission = req.user?.permissions?.includes(permission);

    if (!hasPermission) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
        permission,
      });
    }

    next();
  };
};
