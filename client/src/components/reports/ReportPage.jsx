import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import api from "../../api/client";
import ExportButtons from "../common/ExportButtons";
import Loading from "../common/Loading";
import Pagination from "../common/Pagination";

const definitions = {
  sales: { title: "Sales Report", columns: [{ key: "_id.day", label: "Date" }, { key: "_id.type", label: "Type" }, { key: "total", label: "Total" }, { key: "count", label: "Entries" }] },
  purchases: { title: "Purchase Report", columns: [{ key: "_id", label: "Date" }, { key: "total", label: "Total" }, { key: "count", label: "Entries" }] },
  expenses: { title: "Expense Report", columns: [{ key: "_id.day", label: "Date" }, { key: "_id.category", label: "Category" }, { key: "total", label: "Total" }, { key: "count", label: "Entries" }] },
  stock: { title: "Stock Report", columns: [{ key: "name", label: "Product" }, { key: "code", label: "Code" }, { key: "unit", label: "Unit" }, { key: "currentStock", label: "Current Stock" }, { key: "reorderLevel", label: "Reorder Level" }] },
  "customer-outstanding": { title: "Customer Outstanding", columns: [{ key: "party.name", label: "Customer" }, { key: "party.code", label: "Code" }, { key: "billed", label: "Billed" }, { key: "paid", label: "Received" }, { key: "outstanding", label: "Outstanding" }] },
  "supplier-outstanding": { title: "Supplier Outstanding", columns: [{ key: "party.name", label: "Supplier" }, { key: "party.code", label: "Code" }, { key: "billed", label: "Billed" }, { key: "paid", label: "Paid" }, { key: "outstanding", label: "Outstanding" }] },
  "daily-collection": { title: "Daily Collection", columns: [{ key: "_id", label: "Date" }, { key: "total", label: "Collected" }, { key: "count", label: "Payments" }] },
  "profit-loss": { title: "Profit / Loss", columns: [] },
};

const dateInput = (date) => date.toISOString().slice(0, 10);
const defaultRange = () => { const to = new Date(); const from = new Date(to); from.setMonth(from.getMonth() - 1); return { from: dateInput(from), to: dateInput(to) }; };

export default function ReportPage({ type }) {
  const definition = definitions[type];
  const initialRange = defaultRange();
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api.get(`/reports/${type}`, { params: { from, to }, signal: controller.signal })
      .then((response) => {
        if (type === "profit-loss") { setSummary(response.data); setRows([]); } else { setSummary(null); setRows(Array.isArray(response.data) ? response.data : []); }
        setPage(1);
      })
      .catch((error) => { if (error.code !== "ERR_CANCELED" && error.name !== "CanceledError") { setRows([]); setSummary(null); alert(error?.response?.data?.message || "Failed to load report"); } })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [type, from, to]);

  const filtered = useMemo(() => { const value = search.trim().toLowerCase(); return value ? rows.filter((row) => JSON.stringify(row).toLowerCase().includes(value)) : rows; }, [rows, search]);
  const visible = filtered.slice((page - 1) * limit, page * limit);
  const valueAt = (row, key) => key.split(".").reduce((current, part) => current?.[part], row);

  if (loading) return <Loading />;
  return <div className="content"><section className="panel"><div className="panel-head"><div className="filters"><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /><input type="date" value={to} onChange={(event) => setTo(event.target.value)} />{!summary && <><div className="search-box"><Search size={17} /><input type="search" placeholder="Search report..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div><ExportButtons data={filtered} columns={definition.columns} title={definition.title} fileName={definition.title.replaceAll(" ", "_")} sheetName="Report" filters={{ From: from, To: to }} /></>}</div></div>{summary ? <div className="stats-grid"><div className="stat"><span>Revenue</span><strong>{summary.revenue}</strong></div><div className="stat"><span>Purchases</span><strong>{summary.purchases}</strong></div><div className="stat"><span>Expenses</span><strong>{summary.expenses}</strong></div><div className="stat"><span>Profit</span><strong>{summary.profit}</strong></div></div> : visible.length === 0 ? <div className="empty-state">No report data found.</div> : <><div className="table-wrapper"><table className="table"><thead><tr>{definition.columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{visible.map((row, index) => <tr key={`${type}-${row._id || index}`}>{definition.columns.map((column) => { const value = valueAt(row, column.key); const display = value && typeof value === "object" ? Object.values(value).join(" / ") : value; return <td key={column.key}>{typeof display === "number" ? display.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : display || "-"}</td>; })}</tr>)}</tbody></table></div><Pagination currentPage={page} totalPages={Math.ceil(filtered.length / limit)} totalItems={filtered.length} itemsPerPage={limit} onPageChange={setPage} onItemsPerPageChange={(value) => { setLimit(value); setPage(1); }} /></>}</section></div>;
}
