import React from "react";
import { Plus } from "lucide-react";

import expenseCategory from "../../data/expense.json";
import SearchableSelect from "../common/SearchableSelect";

function ExpenseForm({ form, errors, saving, onChange, onSubmit }) {
  return (
    <section className="panel">
      <h3>Record Expense</h3>

      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {/* DATE */}

        <label>
          Date
          <input
            type="date"
            value={form.date}
            onChange={(e) => onChange("date", e.target.value)}
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
            onChange={(value) => onChange("category", value)}
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
            onChange={(e) => onChange("amount", e.target.value)}
          />
        </label>

        {/* VENDOR */}

        <label>
          Vendor / Notes
          <input
            value={form.vendor}
            onChange={(e) => onChange("vendor", e.target.value)}
          />
        </label>

        {/* SAVE */}
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
