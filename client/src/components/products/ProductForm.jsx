import React from "react";
import { Plus } from "lucide-react";
import api from "../../api/client";
import SearchableSelect from "../common/SearchableSelect";
import { categories, units } from "../../data/products.json";

// ==========================================
// PRODUCT FORM
// ==========================================

function ProductForm({
  form,
  setForm,
  errors,
  setErrors,
  editingId,
  saving,
  setSaving,
  onReset,
  onSaved,
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

    if (!form.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!form.code.trim()) {
      newErrors.code = "Product code is required";
    }

    if (!form.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!form.unit.trim()) {
      newErrors.unit = "Unit is required";
    }

    if (form.rate === "" || Number(form.rate) <= 0) {
      newErrors.rate = "Rate must be greater than 0";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // SAVE PRODUCT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),

        code: form.code.trim().toUpperCase(),

        category: form.category.trim(),

        unit: form.unit.trim(),

        rate: Number(form.rate),

        active: form.active,

        description: form.description.trim(),
      };

      // UPDATE
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      }

      // CREATE
      else {
        await api.post("/products", payload);
      }

      // Reset form
      onReset();

      // Reload products
      await onSaved();
    } catch (error) {
      console.error("SAVE PRODUCT ERROR:", error);

      console.error("Response:", error?.response?.data);

      console.error("Status:", error?.response?.status);

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to save product",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="panel">
      {/* HEADER */}

      <div className="panel-head">
        <h3>{editingId ? "Edit Product" : "New Product"}</h3>

        {editingId && (
          <button
            type="button"
            className="secondary"
            onClick={onReset}
            disabled={saving}
          >
            Cancel
          </button>
        )}
      </div>

      {/* FORM */}

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        {/* ==================================
            PRODUCT NAME
        ================================== */}

        <label>
          Product Name
          <input
            type="text"
            value={form.name}
            className={errors.name ? "input-error" : ""}
            placeholder="Enter Name"
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <small className="error-text">{errors.name}</small>}
        </label>

        {/* ==================================
            PRODUCT CODE
        ================================== */}

        <label>
          Product Code
          <input
            type="text"
            value={form.code}
            className={errors.code ? "input-error" : ""}
            placeholder="Enter Code"
            onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
          />
          {errors.code && <small className="error-text">{errors.code}</small>}
        </label>

        {/* ==================================
            CATEGORY
        ================================== */}

        <div className="form-field">
          <label htmlFor="category">Category</label>

          <SearchableSelect
            value={form.category}
            options={categories}
            placeholder="Select category"
            error={!!errors.category}
            onChange={(value) => handleChange("category", value)}
          />

          {errors.category && (
            <span className="error-text">{errors.category}</span>
          )}
        </div>

        {/* ==================================
            UNIT
        ================================== */}

        <div className="form-field">
          <label htmlFor="unit">Unit</label>

          <SearchableSelect
            value={form.unit}
            options={units}
            placeholder="Select unit"
            error={!!errors.unit}
            onChange={(value) => handleChange("unit", value)}
          />

          {errors.unit && <small className="error-text">{errors.unit}</small>}
        </div>

        {/* ==================================
            RATE
        ================================== */}

        <label>
          Rate
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.rate}
            className={errors.rate ? "input-error" : ""}
            placeholder="Enter Rate"
            onChange={(e) => handleChange("rate", e.target.value)}
          />
          {errors.rate && <small className="error-text">{errors.rate}</small>}
        </label>

        {/* ==================================
            DESCRIPTION
        ================================== */}

        <label>
          Description
          <textarea
            style={{
              height: 40,
            }}
            rows="3"
            value={form.description}
            placeholder="Product description..."
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </label>

        {/* ==================================
            SAVE BUTTON
        ================================== */}

        <button type="submit" className="primary" disabled={saving}>
          <Plus size={18} />

          {saving ? "Saving..." : editingId ? "Update Product" : "Save Product"}
        </button>
      </form>
    </section>
  );
}

export default ProductForm;
