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
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/parties", label: "Customers & Suppliers", icon: Users },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/expenses", label: "Expenses", icon: Receipt },
];

function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const currentLabel =
    NAV_ITEMS.find((item) => item.to === location.pathname)?.label ||
    "Dashboard";

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <Droplets size={26} />
          <span>RO Plant</span>
        </div>

        <div className="userbox">
          <b>{user?.name}</b>
          <small>{user?.role}</small>
        </div>

        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? "nav active" : "nav")}
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}

        <button className="nav logout" onClick={logout}>
          <LogOut size={19} />
          Logout
        </button>
      </aside>

      <main className="main">
        <header>
          <div>
            <h1>{currentLabel}</h1>
            <p>2026 RO Water Plant Management</p>
          </div>

          <span className="role">{user?.role?.toUpperCase()}</span>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
