import React, { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import api from "../api/client";

import { money } from "../utils/helpers";

import Stat from "../components/common/Stat";
import Table from "../components/common/Table";
import Loading from "../components/common/Loading";

import { useAuth } from "../context/AuthContext";

function Dashboard() {
  // ==========================================
  // AUTH
  // ==========================================

  const { isSuperAdmin, permissions = [] } = useAuth();

  // ==========================================
  // PERMISSION
  // ==========================================

  const hasPermission = (permission) => {
    if (isSuperAdmin === true) {
      return true;
    }

    if (permissions.includes("*")) {
      return true;
    }

    return permissions.includes(permission);
  };

  const canView = hasPermission("dashboard.view");

  // ==========================================
  // STATE
  // ==========================================

  const [data, setData] = useState(null);

  const [year, setYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const load = async () => {
    if (!canView) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/dashboard?year=${year}`);

      setData(response.data);
    } catch (err) {
      console.error("DASHBOARD ERROR:", err);

      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // YEAR CHANGE
  // ==========================================

  useEffect(() => {
    load();
  }, [year, canView]);

  // ==========================================
  // NO PERMISSION
  // ==========================================

  if (!canView) {
    return (
      <div className="content">
        <div className="error">
          You do not have permission to view the dashboard.
        </div>
      </div>
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return <Loading />;
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="content">
        <div className="error">{error}</div>
      </div>
    );
  }

  // ==========================================
  // EMPTY
  // ==========================================

  if (!data) {
    return <Loading />;
  }

  // ==========================================
  // MONTHLY DATA
  // ==========================================

  const monthly = Array.isArray(data.monthly) ? data.monthly : [];

  // ==========================================
  // TOTALS
  // ==========================================

  const totals = data.totals || {};

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="content">
      {/* ====================================
          YEAR FILTER
      ==================================== */}

      <div className="dashboard-year-filter">
        <select
          value={year}
          onChange={(event) => setYear(Number(event.target.value))}
        >
          <option value={2025}>2025</option>

          <option value={2026}>2026</option>

          <option value={2027}>2027</option>
        </select>
      </div>

      {/* ====================================
          STAT CARDS
      ==================================== */}

      <div className="cards">
        <Stat title="Total Revenue" value={money(totals.revenue)} />

        <Stat title="Total Expenses" value={money(totals.expenses)} />

        <Stat title="Net Profit" value={money(totals.profit)} />

        <Stat
          title="Profit Margin"
          value={`${Number(data.margin || 0).toFixed(1)}%`}
        />

        <Stat
          title="Pending Receivables"
          value={money(data.pendingReceivables)}
        />
      </div>

      {/* ====================================
          CHARTS
      ==================================== */}

      <div className="grid2">
        {/* REVENUE VS EXPENSES */}

        <section className="panel">
          <h3>Revenue vs Expenses</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip formatter={(value) => money(value)} />

              <Bar dataKey="revenue" name="Revenue" />

              <Bar dataKey="expenses" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* MONTHLY PROFIT */}

        <section className="panel">
          <h3>Monthly Profit</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip formatter={(value) => money(value)} />

              <Line
                type="monotone"
                dataKey="profit"
                name="Profit"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* ====================================
          MONTHLY SUMMARY
      ==================================== */}

      <section className="panel">
        <h3>Monthly Summary</h3>

        <Table
          headers={["Month", "Revenue", "Expenses", "Profit", "Margin"]}
          rows={monthly.map((month) => (
            <tr key={`${year}-${month.monthNumber}`}>
              <td>{month.month}</td>

              <td>{money(month.revenue)}</td>

              <td>{money(month.expenses)}</td>

              <td>{money(month.profit)}</td>

              <td>
                {month.revenue
                  ? ((month.profit / month.revenue) * 100).toFixed(1)
                  : "0.0"}
                %
              </td>
            </tr>
          ))}
        />
      </section>
    </div>
  );
}

export default Dashboard;
