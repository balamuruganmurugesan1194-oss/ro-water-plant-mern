import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import api from "../../api/client";
import Loading from "../../components/common/Loading";
import ExportButtons from "../../components/common/ExportButtons";
import Pagination from "../../components/common/Pagination";

const columns = [
  { key: "name", label: "Product" },
  { key: "code", label: "Code" },
  { key: "unit", label: "Unit" },
  { key: "currentStock", label: "Current Stock" },
  // { key: "reorderLevel", label: "Reorder Level" },
  { key: "status", label: "Status" },
];

export default function StockSummary() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/inventory/summary")
      .then((response) => setRows(response.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      rows
        .map((row) => ({
          ...row,
          status:
            row.currentStock <= row.reorderLevel ? "Low stock" : "In stock",
        }))
        .filter((row) =>
          `${row.name} ${row.code} ${row.unit} ${row.status}`
            .toLowerCase()
            .includes(search.toLowerCase().trim()),
        ),
    [rows, search],
  );
  const visible = filtered.slice((page - 1) * limit, page * limit);

  if (loading) return <Loading />;
  return (
    <div className="content">
      <section className="panel">
        <div className="panel-head">
          <h3>Stock Summary</h3>
          <div className="filters">
            <div className="search-box">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search inventory..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <ExportButtons
              data={filtered}
              columns={columns}
              title="Stock Summary"
              fileName="Stock_Summary"
              sheetName="Stock"
            />
          </div>
        </div>
        {visible.length === 0 ? (
          <div className="empty-state">No inventory found.</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row._id}>
                      <td>{row.name}</td>
                      <td>{row.code}</td>
                      <td>{row.unit}</td>
                      <td>{row.currentStock}</td>
                      {/* <td>{row.reorderLevel}</td> */}
                      <td>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(filtered.length / limit)}
              totalItems={filtered.length}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={(value) => {
                setLimit(value);
                setPage(1);
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
