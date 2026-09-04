import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import "./styles.css";
import "./style/index.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Parties from "./pages/Parties";
import Products from "./pages/Products";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
// import Purchases from "./pages/Purchases";
// import Inventory from "./pages/Inventory";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/not-found" element={<NotFound />} />

        {/* Admin + Staff Pages */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/products" element={<Products />} />
            {/* <Route path="/purchases" element={<Purchases />} />
            <Route path="/inventory" element={<Inventory />} /> */}
            <Route path="/sales" element={<Sales />} />
            <Route path="/parties" element={<Parties />} />
          </Route>
        </Route>

        {/* Admin Only Pages */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
          </Route>
        </Route>

        {/* Root */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Invalid URL */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
