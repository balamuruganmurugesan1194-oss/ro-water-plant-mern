import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { money, today } from "../utils/helpers";
import Table from "../components/Table";
import Pagination from "../components/Pagination";
import expenseCategory from "../data/expense.json";
import DeleteButton from "../components/DeleteButton";
import SearchableSelect from "../components/SearchableSelect";
function Expenses() {
  const { role } = useAuth();
  const canEdit = role === "admin";

  const [items, setItems] = useState([]);
  const [month, setMonth] = useState("2026-08");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  // ==========================================
  // PAGINATION
  // ==========================================

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ==========================================
  // BLANK FORM
  // ==========================================

  const blank = {
    date: today(),
    category: "",
    amount: "",
    vendor: "",
    notes: "",
  };

  const [form, setForm] = useState(blank);

  // ==========================================
  // LOAD EXPENSES
  // ==========================================

  const load = async () => {
    try {
      const response = await api.get(`/expenses?month=${month}`);

      setItems(response.data || []);
    } catch (err) {
      console.error("Failed to load expenses:", err);

      setItems([]);
    }
  };

  // ==========================================
  // LOAD WHEN MONTH CHANGES
  // ==========================================

  useEffect(() => {
    setCurrentPage(1);
    load();
  }, [month]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalItems = items.length;

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const paginatedItems = items.slice(startIndex, endIndex);

  // ==========================================
  // PAGE CHANGE
  // ==========================================

  const handlePageChange = (page) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // ITEMS PER PAGE
  // ==========================================

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await api.post("/expenses", {
        ...form,
        amount: Number(form.amount),
      });

      setForm(blank);

      setCurrentPage(1);

      await load();
    } catch (err) {
      console.error("Failed to save expense:", err);

      alert(err?.response?.data?.message || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const del = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);

      await load();

      // Check whether current page
      // still exists after deletion
      const remainingItems = items.length - 1;

      const newTotalPages = Math.ceil(remainingItems / itemsPerPage);

      if (newTotalPages > 0 && currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error("Failed to delete expense:", err);

      alert(err?.response?.data?.message || "Failed to delete expense");
    }
  };
  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="content">
      {/* ==========================================
          RECORD EXPENSE
      ========================================== */}

      {canEdit && (
        <section className="panel">
          <h3>Record Expense</h3>

          <form className="form-grid" onSubmit={submit}>
            {/* DATE */}

            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: e.target.value,
                  })
                }
              />
            </label>

            {/* CATEGORY */}

            <div className="form-field">
              <label htmlFor="category">Category</label>

              <SearchableSelect
                value={form.category}
                options={expenseCategory}
                placeholder="Select category"
                error={!!errors.category}
                onChange={(value) => handleChange("category", value)}
              />

              {errors.category && (
                <span className="error-text">{errors.category}</span>
              )}
            </div>

            {/* AMOUNT */}

            <label>
              Amount
              <input
                type="number"
                min="0"
                required
                value={form.amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value,
                  })
                }
              />
            </label>

            {/* VENDOR */}

            <label>
              Vendor / Notes
              <input
                value={form.vendor}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vendor: e.target.value,
                  })
                }
              />
            </label>

            {/* SAVE */}

            <button className="primary" type="submit" disabled={saving}>
              <Plus size={18} />

              {saving ? "Saving..." : "Save Expense"}
            </button>
          </form>
        </section>
      )}

      {/* ==========================================
          EXPENSE REGISTER
      ========================================== */}

      <section className="panel">
        <div className="panel-head">
          <h3>Expense Register</h3>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        {items.length === 0 ? (
          <div className="empty-state">No expenses found for this month.</div>
        ) : (
          <>
            <Table
              headers={["Date", "Category", "Amount", "Vendor", "Notes", ""]}
              rows={paginatedItems.map((x) => (
                <tr key={x._id}>
                  {/* DATE */}

                  <td>{new Date(x.date).toLocaleDateString("en-IN")}</td>

                  {/* CATEGORY */}

                  <td>{x.category}</td>

                  {/* AMOUNT */}

                  <td>{money(x.amount)}</td>

                  {/* VENDOR */}

                  <td>{x.vendor || "—"}</td>

                  {/* NOTES */}

                  <td>{x.notes || "—"}</td>

                  {/* ACTION */}

                  <td>
                    {canEdit && (
                      <DeleteButton
                        onDelete={() => del(x._id)}
                        itemName={`${x.category} - ${new Date(
                          x.date,
                        ).toLocaleDateString("en-IN")}`}
                      />
                    )}
                  </td>
                </tr>
              ))}
            />

            {/* ==================================
                GLOBAL PAGINATION
            ================================== */}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </section>
    </div>
  );
}

export default Expenses;
