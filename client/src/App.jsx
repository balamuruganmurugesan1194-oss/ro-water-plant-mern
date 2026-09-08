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
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/not-found" element={<NotFound />} />

        {/* =================================================
            PROTECTED APPLICATION
        ================================================= */}

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* DASHBOARD */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* PRODUCTS */}
            <Route path="/products" element={<Products />} />

            {/* SALES */}
            <Route path="/sales" element={<Sales />} />

            {/* EXPENSES */}
            <Route path="/expenses" element={<Expenses />} />

            {/* PARTIES */}
            <Route path="/parties" element={<Parties />} />

            {/* USERS */}
            <Route path="/settings/users" element={<Users />} />

            {/* ROLES */}
            <Route
              path="/settings/roles-permissions"
              element={<RolesPermissions />}
            />
          </Route>
        </Route>

        {/* ROOT */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
