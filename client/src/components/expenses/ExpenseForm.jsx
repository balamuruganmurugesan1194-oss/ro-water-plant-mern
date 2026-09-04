import React from "react";
import { Plus, Save, X } from "lucide-react";

import expenseCategory from "../../data/expense.json";
import SearchableSelect from "../common/SearchableSelect";

function ExpenseForm({
  form,
  errors,
  saving,
  onChange,
  onSubmit,
  expenseNumber = "",
  editingId,
  onCancel,
}) {
  const isEditing = Boolean(editingId);

  return (
    <section className="panel">
      {/* ======================================
          HEADER
      ====================================== */}

      <h3>
        {isEditing
          ? `Edit Expense - ${expenseNumber}`
          : `New Expense - ${expenseNumber}`}
      </h3>

      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
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
            NOTES
        ==================================== */}

        <div className="notes-field">
          <label>Notes</label>

          <textarea
            rows="3"
            value={form.notes || ""}
            placeholder="Enter notes..."
            onChange={(e) => onChange("notes", e.target.value)}
          />
        </div>

        {/* ====================================
            BUTTONS
        ==================================== */}

        <div className="form-submit">
          {/* UPDATE */}

          {isEditing ? (
            <>
              <button className="primary" type="submit" disabled={saving}>
                <Save size={18} />

                {saving ? "Updating..." : "Update Expense"}
              </button>

              <button
                type="button"
                className="secondary"
                onClick={onCancel}
                disabled={saving}
              >
                <X size={18} />
                Cancel
              </button>
            </>
          ) : (
            /* CREATE */

            <button className="primary" type="submit" disabled={saving}>
              <Plus size={18} />

              {saving ? "Saving..." : "Save Expense"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default ExpenseForm;
