import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { money, today } from "../utils/helpers";
import Table from "../components/Table";
import expenseCategory from "../data/expense.json";
import DeleteButton from "../components/DeleteButton";
function Expenses() {
  const { role } = useAuth();
  const canEdit = role === "admin";
  const [items, setItems] = useState([]);
  const [month, setMonth] = useState("2026-08");

  const blank = {
    date: today(),
    category: expenseCategory[0]?.value || "",
    amount: "",
    vendor: "",
    notes: "",
  };

  const [form, setForm] = useState(blank);

  const load = async () => {
    try {
      const response = await api.get(`/expenses?month=${month}`);

      setItems(response.data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  };

  /*
   * IMPORTANT:
   *
   * Do NOT use:
   *
   * useEffect(() => load(), [month]);
   *
   * because load() returns a Promise.
   *
   * Instead call it inside the callback.
   */
  useEffect(() => {
    load();
  }, [month]);

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/expenses", {
        ...form,
        amount: Number(form.amount),
      });

      setForm(blank);

      await load();
    } catch (err) {
      console.error("Failed to save expense:", err);
    }
  };

  const del = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);

      await load();
    } catch (err) {
      console.error("Failed to delete expense:", err);
    }
  };

  return (
    <div className="content">
      {canEdit && (
        <section className="panel">
          <h3>Record Expense</h3>

          <form className="form-grid" onSubmit={submit}>
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

            <label>
              Category
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
              >
                {expenseCategory.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>

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

            <button className="primary" type="submit">
              <Plus size={18} />
              Save Expense
            </button>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="panel-head">
          <h3>Expense Register</h3>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        <Table
          headers={["Date", "Category", "Amount", "Vendor", "Notes", ""]}
          rows={items.map((x) => (
            <tr key={x._id}>
              <td>{new Date(x.date).toLocaleDateString("en-IN")}</td>

              <td>{x.category}</td>

              <td>{money(x.amount)}</td>

              <td>{x.vendor || "—"}</td>

              <td>{x.notes || "—"}</td>

              <td>
                {canEdit && (
                  <DeleteButton
                    onDelete={() => del(x._id)}
                    itemName={`${x.category} - ${new Date(x.date).toLocaleDateString("en-IN")}`}
                  />
                )}
              </td>
            </tr>
          ))}
        />
      </section>
    </div>
  );
}

export default Expenses;
