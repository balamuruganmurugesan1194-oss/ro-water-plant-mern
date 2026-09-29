import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import "./style/index.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// =====================================================
// PAGES
// =====================================================

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Sales = lazy(() => import("./pages/Sales"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Parties = lazy(() => import("./pages/Parties"));
const Products = lazy(() => import("./pages/Products"));
const StockSummary = lazy(() => import("./pages/inventory/StockSummary"));
const OpeningStock = lazy(() => import("./pages/inventory/OpeningStock"));
const StockAdjustment = lazy(() => import("./pages/inventory/StockAdjustment"));
const SalesReport = lazy(() => import("./pages/reports/SalesReport"));
const PurchaseReport = lazy(() => import("./pages/reports/PurchaseReport"));
const ExpenseReport = lazy(() => import("./pages/reports/ExpenseReport"));
const ProfitLossReport = lazy(() => import("./pages/reports/ProfitLossReport"));
const StockReport = lazy(() => import("./pages/reports/StockReport"));
const CustomerOutstandingReport = lazy(() => import("./pages/reports/CustomerOutstandingReport"));
const SupplierOutstandingReport = lazy(() => import("./pages/reports/SupplierOutstandingReport"));
const DailyCollectionReport = lazy(() => import("./pages/reports/DailyCollectionReport"));
const Purchases = lazy(() => import("./pages/operations/Purchases"));
const Production = lazy(() => import("./pages/operations/Production"));
const Deliveries = lazy(() => import("./pages/operations/Deliveries"));
const EmptyJars = lazy(() => import("./pages/operations/EmptyJars"));
const Payments = lazy(() => import("./pages/operations/Payments"));
const CustomerOutstanding = lazy(() => import("./pages/operations/CustomerOutstanding"));
const SupplierOutstanding = lazy(() => import("./pages/operations/SupplierOutstanding"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));

// =====================================================
// SETTINGS
// =====================================================

const Users = lazy(() => import("./pages/settings/Users"));
const RolesPermissions = lazy(() => import("./pages/settings/RolesPermissions"));

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="loading">Loading...</div>}>
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

            <Route path="/inventory/summary" element={<StockSummary />} />
            <Route path="/inventory/opening" element={<OpeningStock />} />
            <Route path="/inventory/adjustment" element={<StockAdjustment />} />

            <Route path="/reports/sales" element={<SalesReport />} />
            <Route path="/reports" element={<Navigate to="/reports/sales" replace />} />
            <Route path="/reports/purchases" element={<PurchaseReport />} />
            <Route path="/reports/expenses" element={<ExpenseReport />} />
            <Route path="/reports/profit-loss" element={<ProfitLossReport />} />
            <Route path="/reports/stock" element={<StockReport />} />
            <Route path="/reports/customer-outstanding" element={<CustomerOutstandingReport />} />
            <Route path="/reports/supplier-outstanding" element={<SupplierOutstandingReport />} />
            <Route path="/reports/daily-collection" element={<DailyCollectionReport />} />

            <Route path="/operations/purchases" element={<Purchases />} />
            <Route path="/operations/production" element={<Production />} />
            <Route path="/operations/deliveries" element={<Deliveries />} />
            <Route path="/operations/jars" element={<EmptyJars />} />
            <Route path="/operations/payments" element={<Payments />} />
            <Route path="/operations/customer-outstanding" element={<CustomerOutstanding />} />
            <Route path="/operations/supplier-outstanding" element={<SupplierOutstanding />} />

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
      </Suspense>
    </AuthProvider>
  );
}

export default App;
