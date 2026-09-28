import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
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
  BarChart3,
  ClipboardList,
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

const REPORT_ITEMS = [
  ["sales", "Sales Report"],
  ["purchases", "Purchase Report"],
  ["expenses", "Expense Report"],
  ["profit-loss", "Profit / Loss"],
  ["stock", "Stock Report"],
  ["customer-outstanding", "Customer Outstanding"],
  ["supplier-outstanding", "Supplier Outstanding"],
  ["daily-collection", "Daily Collection"],
];

const INVENTORY_ITEMS = [
  ["summary", "Stock Summary"],
  ["opening", "Opening Stock"],
  ["adjustment", "Stock Adjustment"],
];

const OPERATION_ITEMS = [
  ["purchases", "Purchases"],
  ["production", "Production"],
  ["deliveries", "Deliveries"],
  ["jars", "Empty Jars"],
  ["payments", "Payments"],
  ["customer-outstanding", "Customer Outstanding"],
  ["supplier-outstanding", "Supplier Outstanding"],
];

const getQueryEntryLabel = (items, key, fallback) =>
  items.find(([itemKey]) => itemKey === key)?.[1] || fallback;

function MainLayout() {
  const { user, logout, isSuperAdmin, permissions = [] } = useAuth();

  const location = useLocation();

  // ======================================================
  // SETTINGS OPEN/CLOSE
  // ======================================================

  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith("/settings"),
  );

  const [reportsOpen, setReportsOpen] = useState(
    location.pathname.startsWith("/reports"),
  );

  const [inventoryOpen, setInventoryOpen] = useState(
    location.pathname.startsWith("/inventory"),
  );

  const [operationsOpen, setOperationsOpen] = useState(
    location.pathname.startsWith("/operations"),
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

  const canAccessReports = hasPermission("dashboard.view");
  const canAccessInventory = hasPermission("products.view");
  const canAccessOperations = hasPermission("products.view");

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
    (location.pathname.startsWith("/reports")
      ? getQueryEntryLabel(
          REPORT_ITEMS,
          location.pathname.split("/")[2],
          "Reports",
        )
      : location.pathname === "/inventory"
        ? getQueryEntryLabel(
            INVENTORY_ITEMS,
            new URLSearchParams(location.search).get("tab"),
            "Inventory",
          )
        : location.pathname.startsWith("/operations")
          ? getQueryEntryLabel(
              OPERATION_ITEMS,
              location.pathname.split("/")[2] ||
                new URLSearchParams(location.search).get("tab"),
              "Operations",
            )
          : location.pathname === "/settings"
            ? "Settings"
            : "Dashboard");

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

        {/* <div className="userbox">
          <b>{user?.name || "User"}</b>

          <small>{displayRole}</small>
        </div> */}

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

          {canAccessInventory && (
            <div className="settings-menu">
              <button
                type="button"
                className={`nav settings-parent ${location.pathname.startsWith("/inventory") ? "active" : ""}`}
                onClick={() => setInventoryOpen((prev) => !prev)}
              >
                <Boxes size={19} />
                <span>Inventory</span>
                <ChevronDown
                  size={16}
                  className={
                    inventoryOpen ? "settings-arrow open" : "settings-arrow"
                  }
                />
              </button>
              {inventoryOpen && (
                <div className="settings-submenu">
                  {INVENTORY_ITEMS.map(([key, label]) => (
                    <NavLink
                      key={key}
                      to={`/inventory/${key}`}
                      className={
                        location.pathname === `/inventory/${key}`
                          ? "settings-subnav active"
                          : "settings-subnav"
                      }
                    >
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

          {canAccessOperations && (
            <div className="settings-menu">
              <button
                type="button"
                className={`nav settings-parent ${location.pathname.startsWith("/operations") ? "active" : ""}`}
                onClick={() => setOperationsOpen((prev) => !prev)}
              >
                <ClipboardList size={19} />
                <span>Operations</span>
                <ChevronDown
                  size={16}
                  className={
                    operationsOpen ? "settings-arrow open" : "settings-arrow"
                  }
                />
              </button>
              {operationsOpen && (
                <div className="settings-submenu">
                  {OPERATION_ITEMS.map(([key, label]) => (
                    <NavLink
                      key={key}
                      to={`/operations/${key}`}
                      className={
                        location.pathname.startsWith(`/operations/${key}`)
                          ? "settings-subnav active"
                          : "settings-subnav"
                      }
                    >
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

          {canAccessReports && (
            <div className="settings-menu">
              <button
                type="button"
                className={`nav settings-parent ${
                  location.pathname.startsWith("/reports") ? "active" : ""
                }`}
                onClick={() => setReportsOpen((prev) => !prev)}
              >
                <BarChart3 size={19} />
                <span>Reports</span>
                <ChevronDown
                  size={16}
                  className={
                    reportsOpen ? "settings-arrow open" : "settings-arrow"
                  }
                />
              </button>

              {reportsOpen && (
                <div className="settings-submenu">
                  {REPORT_ITEMS.map(([key, label]) => (
                    <NavLink
                      key={key}
                      to={`/reports/${key}`}
                      className={({ isActive }) =>
                        location.pathname === `/reports/${key}`
                          ? "settings-subnav active"
                          : "settings-subnav"
                      }
                    >
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

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

          <div className="topbar-actions">
            <span className="role">{displayRole.toUpperCase()} / {user?.name || "User"}</span>
            <button
              type="button"
              className="topbar-logout"
              onClick={logout}
              title="Logout"
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
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
