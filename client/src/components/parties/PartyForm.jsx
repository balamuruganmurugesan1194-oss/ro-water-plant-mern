import React from "react";
import { Plus } from "lucide-react";
import api from "../../api/client";

// ==========================================
// PARTY FORM
// ==========================================

function PartyForm({
  type,
  form,
  setForm,
  errors,
  setErrors,
  saving,
  onSubmit,
  onTypeChange,
}) {
  // ==========================================
  // HANDLE CHANGE
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
  // VALIDATION
  // ==========================================

  const validate = () => {
    const newErrors = {};

    // ========================================
    // CODE
    // ========================================

    const code = form.code.trim();

    if (!code) {
      newErrors.code = "Code is required";
    } else if (code.length < 2) {
      newErrors.code = "Code must be at least 2 characters";
    } else if (code.length > 20) {
      newErrors.code = "Code cannot exceed 20 characters";
    } else if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      newErrors.code = "Code can contain only letters, numbers, _ and -";
    }

    // ========================================
    // NAME
    // ========================================

    const name = form.name.trim();

    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (name.length > 50) {
      newErrors.name = "Name cannot exceed 50 characters";
    } else if (!/^[A-Za-z\s.'-]+$/.test(name)) {
      newErrors.name = "Name can contain only letters, spaces, . ' and -";
    }

    // ========================================
    // CONTACT
    // ========================================

    const contact = form.contactNumber.trim();

    if (!contact) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^[6-9]\d{9}$/.test(contact)) {
      newErrors.contactNumber = "Enter a valid 10-digit mobile number";
    }

    // ========================================
    // AREA
    // ========================================

    const address = form.address.trim();

    if (!address) {
      newErrors.address = "Area is required";
    } else if (address.length < 2) {
      newErrors.address = "Area must be at least 2 characters";
    } else if (address.length > 100) {
      newErrors.address = "Area cannot exceed 100 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit();
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="panel">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="panel-head">
        <h3>Directory</h3>

        {/* TABS */}

        <div className="tabs">
          {["customer", "supplier"].map((x) => (
            <button
              key={x}
              type="button"
              className={type === x ? "tab active" : "tab"}
              onClick={() => onTypeChange(x)}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================
          FORM
      ====================================== */}

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        {/* ==================================
            CODE
        ================================== */}

        <label>
          Code
          <input
            required
            value={form.code}
            maxLength={20}
            placeholder="Enter code"
            className={errors.code ? "input-error" : ""}
            onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
          />
          {errors.code && <small className="error-text">{errors.code}</small>}
        </label>

        {/* ==================================
            NAME
        ================================== */}

        <label>
          Name
          <input
            required
            value={form.name}
            maxLength={50}
            placeholder="Enter name"
            className={errors.name ? "input-error" : ""}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <small className="error-text">{errors.name}</small>}
        </label>

        {/* ==================================
            CONTACT NUMBER
        ================================== */}

        <label>
          Contact No
          <input
            required
            type="tel"
            value={form.contactNumber}
            maxLength={10}
            inputMode="numeric"
            placeholder="10-digit mobile number"
            className={errors.contactNumber ? "input-error" : ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);

              handleChange("contactNumber", value);
            }}
          />
          {errors.contactNumber && (
            <small className="error-text">{errors.contactNumber}</small>
          )}
        </label>

        {/* ==================================
            AREA
        ================================== */}

        <label>
          Area
          <input
            required
            value={form.address}
            maxLength={100}
            placeholder="Enter area"
            className={errors.address ? "input-error" : ""}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          {errors.address && (
            <small className="error-text">{errors.address}</small>
          )}
        </label>

        {/* ==================================
            SUBMIT
        ================================== */}

        <button className="primary" type="submit" disabled={saving}>
          <Plus size={18} />

          {saving ? "Saving..." : `Add ${type}`}
        </button>
      </form>
    </section>
  );
}

export default PartyForm;
