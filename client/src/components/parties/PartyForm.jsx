import React, { useEffect, useState } from "react";
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
  const [loadingCode, setLoadingCode] = useState(false);

  // ==========================================
  // GET NEXT PARTY CODE
  // ==========================================

  const getNextPartyCode = async (partyType = type) => {
    try {
      setLoadingCode(true);

      const response = await api.get("/parties/next-code", {
        params: {
          type: partyType,
        },
      });

      const nextCode = response.data.code;

      setForm((prev) => ({
        ...prev,
        code: nextCode,
      }));
    } catch (error) {
      console.error("FAILED TO FETCH PARTY CODE:", error);
    } finally {
      setLoadingCode(false);
    }
  };

  // ==========================================
  // LOAD CODE
  // WHEN TYPE CHANGES
  // ==========================================

  useEffect(() => {
    if (type) {
      getNextPartyCode(type);
    }
  }, [type]);

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
    // NAME
    // ========================================

    const name = form.name.trim();

    if (!name) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z\s.'-]+$/.test(name)) {
      newErrors.name = "Name can contain only letters, spaces, . ' and -";
    }

    // ========================================
    // CONTACT NUMBER
    // ========================================

    const contact = form.contactNumber.trim();

    if (!contact) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^[6-9]\d{9}$/.test(contact)) {
      newErrors.contactNumber = "Enter a valid 10-digit mobile number";
    }

    // ========================================
    // AREA
    // OPTIONAL
    // ========================================

    if (form.address?.trim()) {
      if (form.address.trim().length > 100) {
        newErrors.address = "Area cannot exceed 100 characters";
      }
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

    try {
      await onSubmit();
      await getNextPartyCode(type);
    } catch (error) {
      console.error("PARTY SUBMIT ERROR:", error);
    }
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
            value={loadingCode ? "Generating..." : form.code}
            readOnly
            className="readonly-input"
          />
          {/* <small className="field-hint">Automatically generated</small> */}
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
            OPTIONAL
        ================================== */}

        <label>
          Area
          <input
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

        <div className="form-submit">
          <button
            className="primary"
            type="submit"
            disabled={saving || loadingCode}
          >
            <Plus size={18} />

            {saving ? "Saving..." : `Add ${type}`}
          </button>
        </div>
      </form>
    </section>
  );
}

export default PartyForm;
