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

function Dashboard() {
  const [data, setData] = useState(null);
  const [year, setYear] = useState(2026);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/dashboard?year=${year}`);

      setData(response.data);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [year]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="content">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!data) {
    return <Loading />;
  }

  return (
    <div className="content">
      <div className="dashboard-year-filter">
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
          <option value={2027}>2027</option>
        </select>
      </div>

      <div className="cards">
        <Stat title="Total Revenue" value={money(data.totals?.revenue)} />

        <Stat title="Total Expenses" value={money(data.totals?.expenses)} />

        <Stat title="Net Profit" value={money(data.totals?.profit)} />

        <Stat
          title="Profit Margin"
          value={`${Number(data.margin || 0).toFixed(1)}%`}
        />

        <Stat
          title="Pending Receivables"
          value={money(data.pendingReceivables)}
        />
      </div>

      <div className="grid2">
        <section className="panel">
          <h3>Revenue vs Expenses</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthly || []}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip formatter={(value) => money(value)} />

              <Bar dataKey="revenue" name="Revenue" />

              <Bar dataKey="expenses" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="panel">
          <h3>Monthly Profit</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthly || []}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip formatter={(value) => money(value)} />

              <Line type="monotone" dataKey="profit" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="panel">
        <h3>Monthly Summary</h3>

        <Table
          headers={["Month", "Revenue", "Expenses", "Profit", "Margin"]}
          rows={(data.monthly || []).map((m) => (
            <tr key={m.month}>
              <td>{m.month}</td>

              <td>{money(m.revenue)}</td>

              <td>{money(m.expenses)}</td>

              <td>{money(m.profit)}</td>

              <td>
                {m.revenue ? ((m.profit / m.revenue) * 100).toFixed(1) : "0.0"}%
              </td>
            </tr>
          ))}
        />
      </section>
    </div>
  );
}

export default Dashboard;
