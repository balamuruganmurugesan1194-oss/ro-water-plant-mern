import React from "react";
import { Plus } from "lucide-react";

import SearchableSelect from "../common/SearchableSelect";
import PurchaseItems from "./PurchaseItems";

import { paymentMethods, paymentStatus } from "../../data/payment.json";

import { money } from "../../utils/helpers";

function PurchaseForm({
  form,
  setForm,
  errors,
  setErrors,
  suppliers,
  products,
  productsLoading,
  saving,
  onSave,
}) {
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSupplierChange = (value) => {
    const supplier = suppliers.find(
      (item) => String(item._id || item.id) === String(value),
    );

    setForm((prev) => ({
      ...prev,
      supplierId: value,
      supplierName: supplier?.name || "",
    }));

    setErrors((prev) => ({ ...prev, supplierId: "" }));
  };

  const validate = () => {
    const next = {};

    if (!form.date) next.date = "Date is required";

    if (!form.supplierId) {
      next.supplierId = "Supplier is required";
    }

    if (!form.items?.length) {
      next.items = "Add at least one product";
    }

    form.items.forEach((item, index) => {
      if (!item.product) {
        next[`product_${index}`] = "Product is required";
      }

      if (
        item.quantity === "" ||
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        next[`quantity_${index}`] = "Quantity must be greater than 0";
      }

      if (
        item.rate === "" ||
        !Number.isFinite(Number(item.rate)) ||
        Number(item.rate) < 0
      ) {
        next[`rate_${index}`] = "Rate cannot be negative";
      }
    });

    if (Number(form.amount) <= 0) {
      next.amount = "Amount must be greater than 0";
    }

    if (!form.paymentMode) {
      next.paymentMode = "Payment mode is required";
    }

    if (!form.paymentStatus) {
      next.paymentStatus = "Payment status is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();

    if (validate()) {
      onSave(form);
    }
  };

  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier._id || supplier.id,
    label: supplier.name,
  }));

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>New Purchase</h3>
      </div>

      <form className="form-grid" onSubmit={submit} noValidate>
        <label>
          Date
          <input
            type="date"
            value={form.date || ""}
            className={errors.date ? "input-error" : ""}
            onChange={(e) => handleChange("date", e.target.value)}
          />
          {errors.date && <small className="error-text">{errors.date}</small>}
        </label>

        <div className="form-field">
          <label>Supplier</label>
          <SearchableSelect
            value={form.supplierId || ""}
            options={supplierOptions}
            placeholder="Select Supplier"
            error={!!errors.supplierId}
            onChange={handleSupplierChange}
          />
          {errors.supplierId && (
            <small className="error-text">{errors.supplierId}</small>
          )}
        </div>

        <div className="form-field">
          <label>Payment Mode</label>
          <SearchableSelect
            value={form.paymentMode || ""}
            options={paymentMethods}
            placeholder="Select Payment Mode"
            error={!!errors.paymentMode}
            onChange={(value) => handleChange("paymentMode", value)}
          />
          {errors.paymentMode && (
            <small className="error-text">{errors.paymentMode}</small>
          )}
        </div>

        <div className="form-field">
          <label>Status</label>
          <SearchableSelect
            value={form.paymentStatus || ""}
            options={paymentStatus}
            placeholder="Select Status"
            error={!!errors.paymentStatus}
            onChange={(value) => handleChange("paymentStatus", value)}
          />
          {errors.paymentStatus && (
            <small className="error-text">{errors.paymentStatus}</small>
          )}
        </div>

        <PurchaseItems
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          products={products}
          productsLoading={productsLoading}
        />

        <div className="form-field sale-notes">
          <label>Notes</label>
          <textarea
            rows="3"
            value={form.notes || ""}
            placeholder="Enter notes..."
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>

        <div className="sale-footer">
          <div className="sale-total">
            <span>Total Amount</span>
            <strong>{money(form.amount || 0)}</strong>
          </div>

          <div className="form-actions">
            <button className="primary" type="submit" disabled={saving}>
              <Plus size={18} />
              {saving ? "Saving..." : "Save Purchase"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default PurchaseForm;
