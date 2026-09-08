import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles, requiredPermission }) {
  const {
    isAuthenticated,
    roleName,
    isSuperAdmin,
    permissions = [],
  } = useAuth();

  const location = useLocation();

  // ========================================
  // NOT LOGGED IN
  // ========================================

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  // ========================================
  // ADMINISTRATOR
  // ========================================

  if (isSuperAdmin === true) {
    return <Outlet />;
  }

  // ========================================
  // WILDCARD PERMISSION
  // ========================================

  if (permissions.includes("*")) {
    return <Outlet />;
  }

  // ========================================
  // PERMISSION CHECK
  // ========================================

  if (requiredPermission) {
    if (!permissions.includes(requiredPermission)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // ========================================
  // OPTIONAL ROLE CHECK
  // ========================================

  if (allowedRoles?.length) {
    if (!allowedRoles.includes(roleName)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
