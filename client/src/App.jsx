import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import "./style/index.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// =====================================================
// PAGES
// =====================================================

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Parties from "./pages/Parties";
import Products from "./pages/Products";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// =====================================================
// SETTINGS
// =====================================================

import Users from "./pages/settings/Users";
import RolesPermissions from "./pages/settings/RolesPermissions";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route path="/login" element={<Login />} />

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/not-found" element={<NotFound />} />

        {/* =================================================
            ADMIN + STAFF
        ================================================= */}

        <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/products" element={<Products />} />

            <Route path="/sales" element={<Sales />} />

            <Route path="/parties" element={<Parties />} />
          </Route>
        </Route>

        {/* =================================================
            ADMIN ONLY
        ================================================= */}

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<MainLayout />}>
            {/* Dashboard */}

            <Route path="/dashboard" element={<Dashboard />} />

            {/* Expenses */}

            <Route path="/expenses" element={<Expenses />} />

            {/* =================================================
                SETTINGS
            ================================================= */}

            <Route path="/settings/users" element={<Users />} />

            <Route
              path="/settings/roles-permissions"
              element={<RolesPermissions />}
            />
          </Route>
        </Route>

        {/* =================================================
            ROOT
        ================================================= */}

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* =================================================
            404
        ================================================= */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
