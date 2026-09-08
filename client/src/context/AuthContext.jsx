import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ========================================
  // TOKEN
  // ========================================

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // ========================================
  // USER
  // ========================================

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");

      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to load user:", error);
      return null;
    }
  });

  // ========================================
  // LOGIN
  // ========================================

  const login = (data) => {
    if (!data?.token || !data?.user) {
      console.error("Invalid login response:", data);
      return;
    }

    const normalizedUser = {
      ...data.user,

      // Administrator
      isSuperAdmin: data.user.isSuperAdmin === true,

      // Permissions
      permissions: Array.isArray(data.user.permissions)
        ? data.user.permissions
        : [],

      // Role
      role: data.user.role || null,
    };

    localStorage.setItem("token", data.token);

    localStorage.setItem("user", JSON.stringify(normalizedUser));

    setToken(data.token);
    setUser(normalizedUser);
  };

  // ========================================
  // LOGOUT
  // ========================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  // ========================================
  // AUTH STATUS
  // ========================================

  const isAuthenticated = Boolean(token && user);

  // ========================================
  // SUPER ADMIN
  // ========================================

  const isSuperAdmin = user?.isSuperAdmin === true;

  // ========================================
  // PERMISSIONS
  // ========================================

  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];

  // ========================================
  // ROLE
  // ========================================

  const role = user?.role || null;

  // Role name
  const roleName = typeof role === "object" ? role?.name || null : role || null;

  // ========================================
  // PROVIDER
  // ========================================

  return (
    <AuthContext.Provider
      value={{
        token,

        user,

        isAuthenticated,

        // Administrator
        isSuperAdmin,

        // Permissions
        permissions,

        // Role object
        role,

        // Role name
        roleName,

        // Actions
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ========================================
// USE AUTH
// ========================================

export function useAuth() {
  return useContext(AuthContext);
}
