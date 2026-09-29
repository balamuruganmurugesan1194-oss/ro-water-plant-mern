import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import api from "../api/client";

import { money } from "../utils/helpers";
import Loading from "../components/common/Loading";
import { useAuth } from "../context/AuthContext";

// import api from "../api/client";

// import { money } from "../utils/helpers";

// import Stat from "../components/common/Stat";
// import Table from "../components/common/Table";
// import Loading from "../components/common/Loading";

// import { useAuth } from "../context/AuthContext";
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function Stat({ title, value, subtitle, icon }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: 20,
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div>
          <div
            style={{
              color: "#64748b",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 25,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {value}
          </div>

          {subtitle && (
            <div
              style={{
                color: "#64748b",
                fontSize: 12,
                marginTop: 6,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {icon && (
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "#e0f2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          {title}
        </h3>

        {action}
      </div>

      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function EmptyState({ text = "No data available" }) {
  return (
    <div
      style={{
        padding: 35,
        textAlign: "center",
        color: "#64748b",
        fontSize: 14,
      }}
    >
      {text}
    </div>
  );
}

function Dashboard() {
  const { isSuperAdmin, permissions = [] } = useAuth();

  /*
   * -------------------------------------------------------
   * PERMISSION
   * -------------------------------------------------------
   */
  const hasPermission = (permission) => {
    if (isSuperAdmin === true) return true;

    if (permissions.includes("*")) return true;

    return permissions.includes(permission);
  };

  const canView = hasPermission("dashboard.view");

  /*
   * -------------------------------------------------------
   * STATE
   * -------------------------------------------------------
   */
  const [data, setData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * -------------------------------------------------------
   * LOAD DASHBOARD
   *
   * IMPORTANT:
   * All hooks must stay above conditional returns.
   * -------------------------------------------------------
   */
  useEffect(() => {
    const loadDashboard = async () => {
      if (!canView) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get("/dashboard", {
          params: {
            year,
          },
        });

        setData(response.data || {});
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [year, canView]);

  /*
   * -------------------------------------------------------
   * CONDITIONAL RETURNS
   * -------------------------------------------------------
   */

  if (!canView) {
    return (
      <div
        style={{
          padding: 30,
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          Access Denied
        </h2>

        <p
          style={{
            color: "#64748b",
            marginBottom: 0,
          }}
        >
          You do not have permission to view the dashboard.
        </p>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div
        style={{
          padding: 24,
          background: "#fff",
          border: "1px solid #fecaca",
          borderRadius: 14,
          color: "#b91c1c",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Dashboard Error</h3>

        <p>{error}</p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            border: "none",
            background: "#0284c7",
            color: "#fff",
            padding: "9px 15px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <Loading />;
  }

  /*
   * -------------------------------------------------------
   * SAFE DATA
   * -------------------------------------------------------
   */

  const totals = data.totals || {};
  const today = data.today || {};
  const sales = data.sales || {};
  const expensesData = data.expenses || {};
  const inventory = data.inventory || {};
  const production = data.production || {};
  const jars = data.jars || {};

  const monthly = Array.isArray(data.monthly) ? data.monthly : [];

  const recentSales = Array.isArray(data.recentSales) ? data.recentSales : [];

  const lowStockProducts = Array.isArray(data.lowStockProducts)
    ? data.lowStockProducts
    : [];

  const productSales = Array.isArray(data.productSales)
    ? data.productSales
    : [];

  /*
   * -------------------------------------------------------
   * FINANCIAL VALUES
   * -------------------------------------------------------
   */

  const revenue = Number(totals.revenue || 0);
  const expenses = Number(totals.expenses || 0);
  const profit = Number(totals.profit || 0);
  const pendingReceivables = Number(data.pendingReceivables || 0);

  const profitMargin = Number(data.margin || totals.margin || 0);

  /*
   * -------------------------------------------------------
   * CHART DATA
   * -------------------------------------------------------
   */

  const monthlyChart = monthly.map((item, index) => ({
    month: item.monthName || item.month || MONTHS[index] || `M${index + 1}`,

    revenue: Number(item.revenue || 0),

    expenses: Number(item.expenses || 0),

    profit: Number(item.profit || 0),

    salesCount: Number(item.salesCount || 0),
  }));

  const productChart = productSales
    .slice(0, 6)
    .map((item) => ({
      name: item.name || item.productName || "Product",

      value: Number(item.amount || item.revenue || item.total || 0),
    }))
    .filter((item) => item.value > 0);

  /*
   * -------------------------------------------------------
   * FORMAT HELPERS
   * -------------------------------------------------------
   */

  const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-IN");
  };

  const getSaleCustomer = (sale) => {
    return (
      sale.customerName ||
      sale.partyName ||
      sale.customer?.name ||
      sale.party?.name ||
      "Walk-in Customer"
    );
  };

  const getSaleNumber = (sale) => {
    return (
      sale.invoiceNumber ||
      sale.invoiceNo ||
      sale.number ||
      sale.saleNumber ||
      "-"
    );
  };

  const getSaleAmount = (sale) => {
    return Number(
      sale.amount ?? sale.total ?? sale.grandTotal ?? sale.netAmount ?? 0,
    );
  };

  /*
   * -------------------------------------------------------
   * PAGE
   * -------------------------------------------------------
   */

  return (
    <div
      style={{
        padding: 20,
        background: "#f8fafc",
        minHeight: "100%",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Water Plant Dashboard
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Business overview, sales, expenses and operations
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
            }}
          >
            Year
          </label>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{
              height: 40,
              minWidth: 110,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "0 10px",
              background: "#fff",
              color: "#0f172a",
              outline: "none",
            }}
          >
            {[
              new Date().getFullYear() - 1,
              new Date().getFullYear(),
              new Date().getFullYear() + 1,
            ].map((itemYear) => (
              <option key={itemYear} value={itemYear}>
                {itemYear}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================
    DASHBOARD STAT CARDS
===================================================== */}
      {/* =====================================================
    DASHBOARD STAT CARDS
===================================================== */}

      <div className="dashboard-stat-grid">
        {/* ROW 1 */}
        <Stat
          title="Total Revenue"
          value={money(revenue)}
          subtitle={`${year} sales`}
          icon="💰"
        />

        <Stat
          title="Total Expenses"
          value={money(expenses)}
          subtitle={`${year} expenses`}
          icon="💳"
        />

        <Stat
          title="Net Profit"
          value={money(profit)}
          subtitle={`${year} profit`}
          icon="📈"
        />

        <Stat
          title="Profit Margin"
          value={`${profitMargin.toFixed(2)}%`}
          subtitle="Profit / Revenue"
          icon="📊"
        />

        {/* ROW 2 */}
        <Stat
          title="Pending Receivables"
          value={money(pendingReceivables)}
          subtitle="Amount to collect"
          icon="⏳"
        />

        <Stat
          title="Today's Revenue"
          value={money(today.revenue || 0)}
          subtitle={`${formatNumber(today.salesCount || 0)} sales`}
          icon="🧾"
        />

        <Stat
          title="Current Stock"
          value={formatNumber(inventory.currentStock || 0)}
          subtitle="Available quantity"
          icon="📦"
        />

        <Stat
          title="Stock Value"
          value={money(inventory.stockValue || 0)}
          subtitle="Current inventory value"
          icon="💧"
        />

        {/* ROW 3 */}
        <Stat
          title="Low Stock"
          value={formatNumber(
            inventory.lowStockCount || lowStockProducts.length || 0,
          )}
          subtitle="Products need attention"
          icon="⚠️"
        />

        <Stat
          title="Production Today"
          value={formatNumber(production.today || 0)}
          subtitle="Units produced"
          icon="🏭"
        />

        <Stat
          title="Production This Month"
          value={formatNumber(production.month || 0)}
          subtitle="Units produced"
          icon="🚰"
        />
      </div>

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(300px, 1fr)",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Revenue / Expenses */}

        <Section title={`${year} Revenue vs Expenses`}>
          {monthlyChart.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ width: "100%", height: 330 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />

                  <YAxis tick={{ fontSize: 12 }} />

                  <Tooltip formatter={(value) => money(Number(value || 0))} />

                  <Legend />

                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#0284c7"
                    radius={[5, 5, 0, 0]}
                  />

                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#f97316"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>

        {/* Product Sales */}

        <Section title="Top Products">
          {productChart.length === 0 ? (
            <EmptyState text="No product sales data" />
          ) : (
            <div style={{ width: "100%", height: 330 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={productChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    label
                  >
                    {productChart.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            "#0284c7",
                            "#0ea5e9",
                            "#38bdf8",
                            "#0369a1",
                            "#075985",
                            "#7dd3fc",
                          ][index % 6]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip formatter={(value) => money(Number(value || 0))} />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>
      </div>

      {/* =====================================================
          PROFIT CHART
      ===================================================== */}

      <div style={{ marginBottom: 20 }}>
        <Section title={`${year} Monthly Profit`}>
          {monthlyChart.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />

                  <YAxis tick={{ fontSize: 12 }} />

                  <Tooltip formatter={(value) => money(Number(value || 0))} />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>
      </div>

      {/* =====================================================
          JAR SUMMARY
      ===================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <Stat
          title="Filled Jars"
          value={formatNumber(jars.filled || 0)}
          subtitle="Filled / available jars"
          icon="💧"
        />

        <Stat
          title="Empty Jars"
          value={formatNumber(jars.empty || 0)}
          subtitle="Empty jars"
          icon="🫙"
        />

        <Stat
          title="Total Jars"
          value={formatNumber(
            Number(jars.filled || 0) + Number(jars.empty || 0),
          )}
          subtitle="Filled + empty"
          icon="📦"
        />
      </div>

      {/* =====================================================
          LOW STOCK + RECENT SALES
      ===================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Low Stock */}

        <Section
          title="Low Stock Products"
          action={
            lowStockProducts.length > 0 ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#dc2626",
                }}
              >
                {lowStockProducts.length} items
              </span>
            ) : null
          }
        >
          {lowStockProducts.length === 0 ? (
            <EmptyState text="All products have sufficient stock" />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      Product
                    </th>

                    <th
                      style={{
                        textAlign: "right",
                        padding: "10px 8px",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      Stock
                    </th>

                    <th
                      style={{
                        textAlign: "right",
                        padding: "10px 8px",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      Minimum
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {lowStockProducts.map((item, index) => (
                    <tr key={item._id || item.id || index}>
                      <td
                        style={{
                          padding: "11px 8px",
                          borderBottom: "1px solid #f1f5f9",
                          color: "#0f172a",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {item.name || item.productName || "-"}
                      </td>

                      <td
                        style={{
                          padding: "11px 8px",
                          borderBottom: "1px solid #f1f5f9",
                          textAlign: "right",
                          color: "#dc2626",
                          fontWeight: 700,
                        }}
                      >
                        {formatNumber(item.currentStock ?? item.stock ?? 0)}
                      </td>

                      <td
                        style={{
                          padding: "11px 8px",
                          borderBottom: "1px solid #f1f5f9",
                          textAlign: "right",
                          color: "#64748b",
                        }}
                      >
                        {formatNumber(
                          item.minStock ??
                            item.minimumStock ??
                            item.reorderLevel ??
                            0,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Recent Sales */}

        <Section title="Recent Sales">
          {recentSales.length === 0 ? (
            <EmptyState text="No recent sales" />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      Invoice
                    </th>

                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      Customer
                    </th>

                    <th
                      style={{
                        textAlign: "right",
                        padding: "10px 8px",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentSales.map((sale, index) => (
                    <tr key={sale._id || sale.id || index}>
                      <td
                        style={{
                          padding: "11px 8px",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#0284c7",
                            fontSize: 13,
                          }}
                        >
                          {getSaleNumber(sale)}
                        </div>

                        <div
                          style={{
                            color: "#94a3b8",
                            fontSize: 11,
                            marginTop: 3,
                          }}
                        >
                          {formatDate(
                            sale.date || sale.saleDate || sale.createdAt,
                          )}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: "11px 8px",
                          borderBottom: "1px solid #f1f5f9",
                          color: "#334155",
                          fontSize: 13,
                        }}
                      >
                        {getSaleCustomer(sale)}
                      </td>

                      <td
                        style={{
                          padding: "11px 8px",
                          borderBottom: "1px solid #f1f5f9",
                          textAlign: "right",
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: 13,
                        }}
                      >
                        {money(getSaleAmount(sale))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      {/* =====================================================
          MONTHLY SUMMARY
      ===================================================== */}

      <Section title={`${year} Monthly Summary`}>
        {monthly.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 700,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "11px 10px",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    Month
                  </th>

                  <th
                    style={{
                      textAlign: "right",
                      padding: "11px 10px",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    Revenue
                  </th>

                  <th
                    style={{
                      textAlign: "right",
                      padding: "11px 10px",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    Expenses
                  </th>

                  <th
                    style={{
                      textAlign: "right",
                      padding: "11px 10px",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    Profit
                  </th>

                  <th
                    style={{
                      textAlign: "right",
                      padding: "11px 10px",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    Margin
                  </th>

                  <th
                    style={{
                      textAlign: "right",
                      padding: "11px 10px",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: 12,
                      color: "#64748b",
                    }}
                  >
                    Sales
                  </th>
                </tr>
              </thead>

              <tbody>
                {monthly.map((item, index) => {
                  const monthRevenue = Number(item.revenue || 0);

                  const monthExpenses = Number(item.expenses || 0);

                  const monthProfit = Number(
                    item.profit || monthRevenue - monthExpenses,
                  );

                  const monthMargin =
                    monthRevenue > 0 ? (monthProfit / monthRevenue) * 100 : 0;

                  return (
                    <tr key={item.month || index}>
                      <td
                        style={{
                          padding: "12px 10px",
                          borderBottom: "1px solid #f1f5f9",
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {item.monthName || MONTHS[index] || item.month}
                      </td>

                      <td
                        style={{
                          padding: "12px 10px",
                          borderBottom: "1px solid #f1f5f9",
                          textAlign: "right",
                        }}
                      >
                        {money(monthRevenue)}
                      </td>

                      <td
                        style={{
                          padding: "12px 10px",
                          borderBottom: "1px solid #f1f5f9",
                          textAlign: "right",
                        }}
                      >
                        {money(monthExpenses)}
                      </td>

                      <td
                        style={{
                          padding: "12px 10px",
                          borderBottom: "1px solid #f1f5f9",
                          textAlign: "right",
                          fontWeight: 700,
                          color: monthProfit >= 0 ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {money(monthProfit)}
                      </td>

                      <td
                        style={{
                          padding: "12px 10px",
                          borderBottom: "1px solid #f1f5f9",
                          textAlign: "right",
                        }}
                      >
                        {monthMargin.toFixed(2)}%
                      </td>

                      <td
                        style={{
                          padding: "12px 10px",
                          borderBottom: "1px solid #f1f5f9",
                          textAlign: "right",
                        }}
                      >
                        {formatNumber(item.salesCount || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

export default Dashboard;
