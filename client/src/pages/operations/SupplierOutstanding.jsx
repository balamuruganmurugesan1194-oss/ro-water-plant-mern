import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import Loading from "../../components/common/Loading";

export default function SupplierOutstanding() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/reports/supplier-outstanding")
      .then((response) => setRows(response.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const value = search.toLowerCase().trim();
        return (
          !value ||
          `${row.party?.name} ${row.party?.code}`.toLowerCase().includes(value)
        );
      }),
    [rows, search],
  );

  if (loading) return <Loading />;

  return (
    <div className="content">
      <section className="panel">
        <div className="panel-head">
          <h3>Supplier Outstanding</h3>
          <input
            type="search"
            placeholder="Search supplier..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {filteredRows.length === 0 ? (
          <div className="empty-state">No supplier outstanding found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Code</th>
                  <th>Billed</th>
                  <th>Paid</th>
                  <th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.party?._id}>
                    <td>{row.party?.name}</td>
                    <td>{row.party?.code}</td>
                    <td>{row.billed}</td>
                    <td>{row.paid}</td>
                    <td>{row.outstanding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
