import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Users,
  LogOut,
  Droplets,
  Settings,
  ChevronDown,
  Tags,
  Ruler,
  CreditCard,
  ShieldCheck,
  Building2,
  FileText,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

// ======================================================
// NORMAL NAVIGATION
// ======================================================

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: "dashboard.view",
  },

  {
    to: "/products",
    label: "Products",
    icon: Package,
    permission: "products.view",
  },

  {
    to: "/parties",
    label: "Customers & Suppliers",
    icon: Users,
    permission: "parties.view",
  },

  {
    to: "/sales",
    label: "Sales",
    icon: ShoppingCart,
    permission: "sales.view",
  },

  {
    to: "/expenses",
    label: "Expenses",
    icon: Receipt,
    permission: "expenses.view",
  },
];

// ======================================================
// SETTINGS MENU
// ======================================================

const SETTINGS_ITEMS = [
  // {
  //   to: "/settings/categories",
  //   label: "Categories",
  //   icon: Tags,
  //   permission: "settings.view",
  // },

  // {
  //   to: "/settings/units",
  //   label: "Units",
  //   icon: Ruler,
  //   permission: "settings.view",
  // },

  // {
  //   to: "/settings/payment-modes",
  //   label: "Payment Modes",
  //   icon: CreditCard,
  //   permission: "settings.view",
  // },

  {
    to: "/settings/users",
    label: "Users",
    icon: Users,
    permission: "users.view",
  },

  {
    to: "/settings/roles-permissions",
    label: "Roles & Permissions",
    icon: ShieldCheck,
    permission: "roles.view",
  },

  // {
  //   to: "/settings/company-profile",
  //   label: "Company Profile",
  //   icon: Building2,
  //   permission: "settings.view",
  // },

  // {
  //   to: "/settings/invoice-settings",
  //   label: "Invoice Settings",
  //   icon: FileText,
  //   permission: "settings.view",
  // },

  // {
  //   to: "/settings/general-settings",
  //   label: "General Settings",
  //   icon: Settings,
  //   permission: "settings.view",
  // },
];

function MainLayout() {
  const { user, logout, isSuperAdmin, permissions = [] } = useAuth();

  const location = useLocation();

  // ======================================================
  // SETTINGS OPEN/CLOSE
  // ======================================================

  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith("/settings"),
  );

  // ======================================================
  // PERMISSION CHECK
  // ======================================================

  const hasPermission = (permission) => {
    // Administrator
    if (isSuperAdmin === true) {
      return true;
    }

    // Wildcard permission
    if (permissions.includes("*")) {
      return true;
    }

    // Normal role permission
    return permissions.includes(permission);
  };

  // ======================================================
  // NORMAL NAVIGATION
  // ======================================================

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    hasPermission(item.permission),
  );

  // ======================================================
  // SETTINGS
  // ======================================================

  const visibleSettingsItems = SETTINGS_ITEMS.filter((item) =>
    hasPermission(item.permission),
  );

  const canAccessSettings =
    isSuperAdmin === true ||
    permissions.includes("*") ||
    visibleSettingsItems.length > 0;

  // ======================================================
  // CURRENT PAGE LABEL
  // ======================================================

  const currentNavItem = NAV_ITEMS.find(
    (item) => item.to === location.pathname,
  );

  const currentSettingsItem = SETTINGS_ITEMS.find(
    (item) => item.to === location.pathname,
  );

  const currentLabel =
    currentSettingsItem?.label ||
    currentNavItem?.label ||
    (location.pathname === "/settings" ? "Settings" : "Dashboard");

  // ======================================================
  // DISPLAY ROLE
  // ======================================================

  const displayRole = isSuperAdmin
    ? "Administrator"
    : user?.role?.name || user?.role || "Staff";

  return (
    <div className="app">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">
        {/* BRAND */}

        <div className="brand">
          <Droplets size={26} />

          <span>RO Plant</span>
        </div>

        {/* USER */}

        <div className="userbox">
          <b>{user?.name || "User"}</b>

          <small>{displayRole}</small>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="sidebar-nav">
          {/* NORMAL NAV ITEMS */}

          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? "nav active" : "nav")}
            >
              <Icon size={19} />

              <span>{label}</span>
            </NavLink>
          ))}

          {/* =================================================
              SETTINGS
          ================================================= */}

          {canAccessSettings && (
            <div className="settings-menu">
              {/* SETTINGS MAIN BUTTON */}

              <button
                type="button"
                className={`nav settings-parent ${
                  location.pathname.startsWith("/settings") ? "active" : ""
                }`}
                onClick={() => setSettingsOpen((prev) => !prev)}
              >
                <Settings size={19} />

                <span>Settings</span>

                <ChevronDown
                  size={16}
                  className={
                    settingsOpen ? "settings-arrow open" : "settings-arrow"
                  }
                />
              </button>

              {/* SETTINGS SUBMENU */}

              {settingsOpen && (
                <div className="settings-submenu">
                  {visibleSettingsItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        isActive ? "settings-subnav active" : "settings-subnav"
                      }
                    >
                      <Icon size={19} />

                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <button type="button" className="nav logout" onClick={logout}>
          <LogOut size={19} />

          <span>Logout</span>
        </button>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="main">
        {/* TOP BAR */}

        <header className="topbar">
          <div>
            <h1>{currentLabel}</h1>

            <p>2026 RO Water Plant Management</p>
          </div>

          <span className="role">{displayRole.toUpperCase()}</span>
        </header>

        {/* PAGE CONTENT */}

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default MainLayout;
