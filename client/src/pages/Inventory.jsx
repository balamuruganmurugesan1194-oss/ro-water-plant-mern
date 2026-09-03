import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, SlidersHorizontal, History } from "lucide-react";

import api from "../api/client";
import Loading from "../components/common/Loading";
import Pagination from "../components/common/Pagination";
import ExportButtons from "../components/common/ExportButtons";
import { money } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

function Inventory() {
  const { role } = useAuth();
  const canEdit = role === "admin";

  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [movementLoading, setMovementLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/inventory?search=${encodeURIComponent(search)}&status=${status}`,
      );
      setItems(response.data || []);
    } catch (error) {
      console.error("Failed to load inventory:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await api.get("/inventory/summary");
      setSummary(response.data || {});
    } catch (error) {
      console.error("Failed to load inventory summary:", error);
    }
  };

  const loadMovements = async (productId = "") => {
    try {
      setMovementLoading(true);
      const response = await api.get(
        `/inventory/movements?productId=${productId}`,
      );
      setMovements(response.data || []);
    } catch (error) {
      console.error("Failed to load stock movements:", error);
      setMovements([]);
    } finally {
      setMovementLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadInventory();
  }, [search, status]);

  useEffect(() => {
    loadSummary();
  }, []);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, page, perPage]);

  const totalPages = Math.ceil(items.length / perPage);

  const refresh = async () => {
    await Promise.all([loadInventory(), loadSummary()]);
  };

  const handleAdjust = async (item) => {
    if (!canEdit) return;

    const quantity = window.prompt(
      `Enter new stock quantity for ${item.name}:`,
      String(item.quantity),
    );

    if (quantity === null) return;

    const minimumStock = window.prompt(
      `Enter minimum stock for ${item.name}:`,
      String(item.minimumStock || 0),
    );

    if (minimumStock === null) return;

    const reason = window.prompt("Reason for stock adjustment:", "Manual adjustment");
    if (reason === null) return;

    try {
      await api.post("/inventory/adjust", {
        productId: item._id,
        quantity: Number(quantity),
        minimumStock: Number(minimumStock),
        reason,
      });

      await refresh();
      alert("Stock updated successfully");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update stock");
    }
  };

  const openHistory = async (item = null) => {
    setSelected(item);
    setShowHistory(true);
    await loadMovements(item?._id || "");
  };

  const exportColumns = [
    { key: "code", label: "Code" },
    { key: "name", label: "Product" },
    { key: "category", label: "Category" },
    { key: "unit", label: "Unit" },
    { key: "quantity", label: "Current Stock" },
    { key: "minimumStock", label: "Minimum Stock" },
    { key: "stockStatus", label: "Status" },
  ];

  return (
    <div className="content">
      <section className="page-head">
        <div>
          <h2>Inventory</h2>
          <p>Monitor current stock and stock movements.</p>
        </div>

        <div className="page-actions">
          <button type="button" className="secondary-btn" onClick={refresh}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => openHistory()}
          >
            <History size={16} />
            Stock History
          </button>
        </div>
      </section>

      <section className="summary-grid">
        <div className="summary-card">
          <span>Total Products</span>
          <strong>{summary.totalProducts}</strong>
        </div>
        <div className="summary-card">
          <span>Total Stock</span>
          <strong>{summary.totalStock}</strong>
        </div>
        <div className="summary-card">
          <span>Low Stock</span>
          <strong>{summary.lowStock}</strong>
        </div>
        <div className="summary-card">
          <span>Out of Stock</span>
          <strong>{summary.outOfStock}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Current Stock</h3>

          <div className="filters">
            <input
              type="search"
              placeholder="Search product/code/category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Stock</option>
              <option value="available">Available</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>

            <ExportButtons
              data={items}
              columns={exportColumns}
              title="Inventory"
              fileName="Inventory"
              sheetName="Inventory"
            />
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Stock</th>
                    <th>Minimum</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-cell">
                        No inventory records found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((item) => (
                      <tr key={item._id}>
                        <td>{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.category || "-"}</td>
                        <td>{item.unit || "-"}</td>
                        <td>
                          <strong>{item.quantity}</strong>
                        </td>
                        <td>{item.minimumStock}</td>
                        <td>
                          <span className={`stock-badge ${item.stockStatus}`}>
                            {item.stockStatus === "low-stock"
                              ? "Low Stock"
                              : item.stockStatus === "out-of-stock"
                                ? "Out of Stock"
                                : "In Stock"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            {canEdit && (
                              <button
                                type="button"
                                className="icon-btn"
                                title="Adjust stock"
                                onClick={() => handleAdjust(item)}
                              >
                                <SlidersHorizontal size={16} />
                              </button>
                            )}
                            <button
                              type="button"
                              className="icon-btn"
                              title="View history"
                              onClick={() => openHistory(item)}
                            >
                              <History size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={items.length}
              itemsPerPage={perPage}
              onPageChange={setPage}
              onItemsPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
            />
          </>
        )}
      </section>

      {showHistory && (
        <div className="modal-backdrop" onClick={() => setShowHistory(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>
                  Stock History
                  {selected ? ` - ${selected.name}` : ""}
                </h3>
                {selected && (
                  <small>
                    {selected.code} · Current stock: {selected.quantity}{" "}
                    {selected.unit || ""}
                  </small>
                )}
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowHistory(false)}
              >
                ×
              </button>
            </div>

            {movementLoading ? (
              <Loading />
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Change</th>
                      <th>Balance</th>
                      <th>Reference</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-cell">
                          No stock movements found.
                        </td>
                      </tr>
                    ) : (
                      movements.map((movement) => (
                        <tr key={movement._id}>
                          <td>
                            {new Date(movement.createdAt).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td>{movement.product?.name || "-"}</td>
                          <td>{movement.type}</td>
                          <td className={movement.quantity < 0 ? "text-danger" : "text-success"}>
                            {movement.quantity > 0 ? "+" : ""}
                            {movement.quantity}
                          </td>
                          <td>{movement.balanceAfter}</td>
                          <td>{movement.referenceNumber || "-"}</td>
                          <td>{movement.reason || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
