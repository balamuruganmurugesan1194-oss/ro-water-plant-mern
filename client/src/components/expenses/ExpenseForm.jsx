import React from "react";
import { Plus } from "lucide-react";

import expenseCategory from "../../data/expense.json";
import SearchableSelect from "../common/SearchableSelect";

function ExpenseForm({
  form,
  errors,
  saving,
  onChange,
  onSubmit,
  expenseNumber = "",
}) {
  return (
    <section className="panel">
      {/* ======================================
          HEADER
      ====================================== */}

      <h3>Record Expense</h3>

      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {/* ====================================
            EXPENSE NUMBER
        ==================================== */}

        <label>
          Expense No.
          <input
            type="text"
            value={expenseNumber || ""}
            readOnly
            placeholder="Generating..."
            className="readonly-input"
          />
        </label>

        {/* ====================================
            DATE
        ==================================== */}

        <label>
          Date
          <input
            type="date"
            value={form.date || ""}
            className={errors.date ? "input-error" : ""}
            onChange={(e) => onChange("date", e.target.value)}
          />
          {errors.date && <span className="error-text">{errors.date}</span>}
        </label>

        {/* ====================================
            CATEGORY
        ==================================== */}

        <div className="form-field">
          <label htmlFor="category">Category</label>

          <SearchableSelect
            value={form.category || ""}
            options={expenseCategory}
            placeholder="Select category"
            error={!!errors.category}
            onChange={(value) => onChange("category", value)}
          />

          {errors.category && (
            <span className="error-text">{errors.category}</span>
          )}
        </div>

        {/* ====================================
            AMOUNT
        ==================================== */}

        <label>
          Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount ?? ""}
            className={errors.amount ? "input-error" : ""}
            onChange={(e) => onChange("amount", e.target.value)}
          />
          {errors.amount && <span className="error-text">{errors.amount}</span>}
        </label>

        {/* ====================================
            VENDOR
        ==================================== */}

        <label>
          Vendor
          <input
            type="text"
            value={form.vendor || ""}
            placeholder="Enter vendor"
            onChange={(e) => onChange("vendor", e.target.value)}
          />
        </label>

        {/* ====================================
            NOTES
        ==================================== */}

        <div className="form-field">
          <label>Notes</label>

          <textarea
            rows="3"
            value={form.notes || ""}
            placeholder="Enter notes..."
            onChange={(e) => onChange("notes", e.target.value)}
          />
        </div>

        {/* ====================================
            SAVE
        ==================================== */}

        <div className="form-submit">
          <button className="primary" type="submit" disabled={saving}>
            <Plus size={18} />

            {saving ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ExpenseForm;
