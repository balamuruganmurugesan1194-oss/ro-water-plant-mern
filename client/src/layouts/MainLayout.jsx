import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Users,
  LogOut,
  Droplets,
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

function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const role = user?.role?.toLowerCase();

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  const currentLabel =
    NAV_ITEMS.find((item) => item.to === location.pathname)?.label ||
    "Dashboard";

  return (
    <div className="app">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside className="sidebar">
        <div className="brand">
          <Droplets size={26} />
          <span>RO Plant</span>
        </div>

        <div className="userbox">
          <b>{user?.name || "User"}</b>
          <small>{user?.role || "Staff"}</small>
        </div>

        <nav className="sidebar-nav">
          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? "nav active" : "nav"
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="nav logout" onClick={logout}>
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="main">
        {/* Fixed Top Bar */}
        <header className="topbar">
          <div>
            <h1>{currentLabel}</h1>
            <p>2026 RO Water Plant Management</p>
          </div>

          <span className="role">
            {user?.role?.toUpperCase()}
          </span>
        </header>

        {/* ===================================================
            ONLY PAGE CONTENT SCROLLS
        =================================================== */}
        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default MainLayout;