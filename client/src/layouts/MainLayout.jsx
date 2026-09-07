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

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin"],
  },

  {
    to: "/products",
    label: "Products",
    icon: Package,
    roles: ["admin", "staff"],
  },

  {
    to: "/parties",
    label: "Customers & Suppliers",
    icon: Users,
    roles: ["admin", "staff"],
  },

  {
    to: "/sales",
    label: "Sales",
    icon: ShoppingCart,
    roles: ["admin", "staff"],
  },

  {
    to: "/expenses",
    label: "Expenses",
    icon: Receipt,
    roles: ["admin"],
  },
];

// ======================================================
// SETTINGS MENU
// ======================================================

const SETTINGS_ITEMS = [
  {
    to: "/settings/categories",
    label: "Categories",
    icon: Tags,
  },

  {
    to: "/settings/units",
    label: "Units",
    icon: Ruler,
  },

  {
    to: "/settings/payment-modes",
    label: "Payment Modes",
    icon: CreditCard,
  },

  {
    to: "/settings/users",
    label: "Users",
    icon: Users,
  },

  {
    to: "/settings/roles-permissions",
    label: "Roles & Permissions",
    icon: ShieldCheck,
  },

  {
    to: "/settings/company-profile",
    label: "Company Profile",
    icon: Building2,
  },

  {
    to: "/settings/invoice-settings",
    label: "Invoice Settings",
    icon: FileText,
  },

  {
    to: "/settings/general-settings",
    label: "General Settings",
    icon: Settings,
  },
];

function MainLayout() {
  const { user, logout } = useAuth();

  const location = useLocation();

  // ======================================================
  // SETTINGS OPEN/CLOSE
  // ======================================================

  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith("/settings"),
  );

  const role = user?.role?.toLowerCase();

  // ======================================================
  // NORMAL NAVIGATION
  // ======================================================

  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  // ======================================================
  // SETTINGS ACCESS
  // ======================================================

  const canAccessSettings = role === "admin";

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

          <small>{user?.role || "Staff"}</small>
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
                  {/* MAIN SETTINGS */}

                  {/* <NavLink
                    to="/settings"
                    end
                    className={({ isActive }) =>
                      isActive ? "settings-subnav active" : "settings-subnav"
                    }
                  >
                    <Settings size={16} />

                    <span>Settings Home</span>
                  </NavLink> */}

                  {/* CATEGORY */}

                  {/* <NavLink
                    to="/settings/categories"
                    className={({ isActive }) =>
                      isActive ? "settings-subnav active" : "settings-subnav"
                    }
                  >
                    <Tags size={16} />

                    <span>Categories</span>
                  </NavLink> */}

                  {/* UNITS */}

                  {/* <NavLink
                    to="/settings/units"
                    className={({ isActive }) =>
                      isActive ? "settings-subnav active" : "settings-subnav"
                    }
                  >
                    <Ruler size={16} />

                    <span>Units</span>
                  </NavLink> */}

                  {/* PAYMENT MODES */}

                  {/* <NavLink
                    to="/settings/payment-modes"
                    className={({ isActive }) =>
                      isActive ? "settings-subnav active" : "settings-subnav"
                    }
                  >
                    <CreditCard size={16} />

                    <span>Payment Modes</span>
                  </NavLink> */}

                  {/* USERS */}

                  <NavLink
                    to="/settings/users"
                    className={({ isActive }) =>
                      isActive ? "settings-subnav active" : "settings-subnav"
                    }
                  >
                    <Users size={19} />

                    <span>Users</span>
                  </NavLink>

                  {/* ROLES */}

                  <NavLink
                    to="/settings/roles-permissions"
                    className={({ isActive }) =>
                      isActive ? "settings-subnav active" : "settings-subnav"
                    }
                  >
                    <ShieldCheck size={19} />

                    <span>Roles & Permissions</span>
                  </NavLink>

                  {/* COMPANY */}

                  {/* <NavLink
                    to="/settings/company-profile"
                    className={({ isActive }) =>
                      isActive ? "settings-subnav active" : "settings-subnav"
                    }
                  >
                    <Building2 size={16} />

                    <span>Company Profile</span>
                  </NavLink> */}

                  {/* INVOICE */}

                  {/* <NavLink
                    to="/settings/invoice-settings"
                    className={({ isActive }) =>
                      isActive ? "settings-subnav active" : "settings-subnav"
                    }
                  >
                    <FileText size={16} />

                    <span>Invoice Settings</span>
                  </NavLink> */}

                  {/* GENERAL */}

                  {/* <NavLink
                    to="/settings/general-settings"
                    className={({ isActive }) =>
                      isActive ? "settings-subnav active" : "settings-subnav"
                    }
                  >
                    <Settings size={16} />

                    <span>General Settings</span>
                  </NavLink> */}
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

          <span className="role">{user?.role?.toUpperCase()}</span>
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
