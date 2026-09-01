import React from "react";
import { Plus } from "lucide-react";

import SearchableSelect from "../../components/SearchableSelect";
import SaleItems from "../Sales/SalesItems";

import { paymentMethods, paymentStatus } from "../../data/payment.json";

import { money } from "../../utils/helpers";

function SalesForm({
  type,
  onTypeChange,
  form,
  setForm,
  errors,
  setErrors,
  products,
  productsLoading,
  saving,
  onSave,
  customers = [],
  suppliers = [],
}) {
  // ==========================================
  // HANDLE FIELD CHANGE
  // ==========================================

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // ==========================================
  // HANDLE TYPE CHANGE
  // ==========================================

  const handleTypeChange = (newType) => {
    onTypeChange(newType);

    setErrors({});
  };

  // ==========================================
  // PARTY OPTIONS
  // ==========================================

  const partyList =
    type === "retail" ? customers : type === "supplier" ? suppliers : [];

  const partyOptions = partyList.map((party) => ({
    value: party._id || party.id,
    label:
      party.name ||
      party.customerName ||
      party.supplierName ||
      party.partyName ||
      "",
  }));

  // ==========================================
  // PARTY LABEL
  // ==========================================

  const partyLabel =
    type === "retail" ? "Customer" : type === "supplier" ? "Supplier" : "Name";

  const partyPlaceholder =
    type === "retail"
      ? "Select Customer"
      : type === "supplier"
        ? "Select Supplier"
        : "Enter name";

  // ==========================================
  // SELECT CUSTOMER / SUPPLIER
  // ==========================================

  const handlePartyChange = (value) => {
    const selectedParty = partyList.find(
      (party) => (party._id || party.id) === value,
    );

    const partyName =
      selectedParty?.name ||
      selectedParty?.customerName ||
      selectedParty?.supplierName ||
      selectedParty?.partyName ||
      "";

    setForm((prev) => ({
      ...prev,
      customerId: value,
      customerName: partyName,
    }));

    setErrors((prev) => ({
      ...prev,
      customerName: "",
    }));
  };

  // ==========================================
  // VALIDATION
  // ==========================================

  const validateForm = () => {
    const newErrors = {};

    if (!form.date) {
      newErrors.date = "Date is required";
    }

    if (!form.customerName?.trim()) {
      newErrors.customerName =
        type === "retail"
          ? "Customer is required"
          : type === "supplier"
            ? "Supplier is required"
            : "Name is required";
    } else if (form.customerName.trim().length < 2) {
      newErrors.customerName = "Enter a valid name";
    }

    if (!form.items?.length) {
      newErrors.items = "Add at least one product";
    }

    form.items.forEach((item, index) => {
      if (!item.product) {
        newErrors[`product_${index}`] = "Product is required";
      }

      if (item.quantity === "" || Number(item.quantity) <= 0) {
        newErrors[`quantity_${index}`] = "Quantity must be greater than 0";
      }

      if (item.rate === "" || Number(item.rate) <= 0) {
        newErrors[`rate_${index}`] = "Rate must be greater than 0";
      }
    });

    if (form.amount === "" || Number(form.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!form.paymentMode) {
      newErrors.paymentMode = "Payment method is required";
    }

    if (!form.paymentStatus) {
      newErrors.paymentStatus = "Payment status is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const submit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(form);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="panel">
      {/* HEADER */}

      <div className="panel-head">
        <h3>New Sale</h3>

        <div className="tabs">
          {["retail", "supplier", "other"].map((item) => (
            <button
              type="button"
              key={item}
              className={type === item ? "tab active" : "tab"}
              onClick={() => handleTypeChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* FORM */}

      <form className="form-grid" onSubmit={submit} noValidate>
        {/* DATE */}

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

        {/* CUSTOMER / SUPPLIER / OTHER */}

        <div className="form-field">
          <label>{partyLabel}</label>

          {type === "other" ? (
            <input
              type="text"
              value={form.customerName || ""}
              placeholder={partyPlaceholder}
              className={errors.customerName ? "input-error" : ""}
              onChange={(e) => handleChange("customerName", e.target.value)}
            />
          ) : (
            <SearchableSelect
              value={form.customerId || ""}
              options={partyOptions}
              placeholder={partyPlaceholder}
              error={!!errors.customerName}
              onChange={handlePartyChange}
            />
          )}

          {errors.customerName && (
            <small className="error-text">{errors.customerName}</small>
          )}
        </div>

        {/* PAYMENT MODE */}

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

        {/* PAYMENT STATUS */}

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

        {/* PRODUCTS */}

        <SaleItems
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          products={products}
          productsLoading={productsLoading}
        />

        {/* FOOTER */}

        <div className="sale-footer">
          <div className="sale-total">
            <span>Total Amount</span>

            <strong>{money(form.amount || 0)}</strong>
          </div>

          <div className="form-actions">
            <button className="primary" type="submit" disabled={saving}>
              <Plus size={18} />

              {saving ? "Saving..." : "Save Sale"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default SalesForm;
