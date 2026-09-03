import React, { useEffect, useState } from "react";
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
  const [generatedCode, setGeneratedCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);

  // ==========================================
  // GET NEXT PRODUCT CODE
  // ==========================================

  const getNextProductCode = async () => {
    try {
      setLoadingCode(true);

      const response = await api.get("/products/next-code");

      setGeneratedCode(response.data.code);
    } catch (error) {
      console.error("GET PRODUCT CODE ERROR:", error);

      setGeneratedCode("");
    } finally {
      setLoadingCode(false);
    }
  };

  // ==========================================
  // LOAD CODE FOR NEW PRODUCT
  // ==========================================

  useEffect(() => {
    if (!editingId) {
      getNextProductCode();
    } else {
      setGeneratedCode(form.code || "");
    }
  }, [editingId, form.code]);

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

    if (!form.name?.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!form.category?.trim()) {
      newErrors.category = "Category is required";
    }

    if (!form.unit?.trim()) {
      newErrors.unit = "Unit is required";
    }

    if (form.rate === "" || Number(form.rate) <= 0) {
      newErrors.rate = "Rate must be greater than 0";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // CHECK DUPLICATE PRODUCT NAME
  // ==========================================

  const checkDuplicateName = async () => {
    const response = await api.get("/products");

    const products = response.data || [];

    const productName = form.name.trim().toLowerCase();

    const duplicateName = products.find((product) => {
      const isSameProduct = editingId && product._id === editingId;

      return (
        !isSameProduct && product.name?.trim().toLowerCase() === productName
      );
    });

    if (duplicateName) {
      setErrors((prev) => ({
        ...prev,
        name: "Product name already exists",
      }));

      return false;
    }

    return true;
  };

  // ==========================================
  // SAVE PRODUCT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      // ========================================
      // CHECK DUPLICATE NAME
      // ========================================

      const noDuplicateName = await checkDuplicateName();

      if (!noDuplicateName) {
        return;
      }

      // ========================================
      // CREATE PAYLOAD
      // ========================================

      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        unit: form.unit.trim(),
        rate: Number(form.rate),
        active: form.active,
        description: form.description?.trim() || "",
      };

      // ========================================
      // UPDATE PRODUCT
      // ========================================

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      }

      // ========================================
      // CREATE PRODUCT
      // ========================================
      else {
        const response = await api.post("/products", payload);

        // Backend-generated code
        if (response.data?.code) {
          setGeneratedCode(response.data.code);
        }
      }

      // ========================================
      // RESET FORM
      // ========================================

      onReset();

      // ========================================
      // RELOAD PRODUCTS
      // ========================================
      if (!editingId) {
        await getNextProductCode();
      }

      await onSaved();
    } catch (error) {
      console.error("SAVE PRODUCT ERROR:", error);

      console.error("Response:", error?.response?.data);

      console.error("Status:", error?.response?.status);

      // ========================================
      // DUPLICATE ERROR
      // ========================================

      if (error?.response?.status === 409) {
        const field = error?.response?.data?.field;

        if (field === "name") {
          setErrors((prev) => ({
            ...prev,
            name: "Product name already exists",
          }));
        } else if (field === "code") {
          setErrors((prev) => ({
            ...prev,
            code: "Product code already exists",
          }));
        } else {
          alert(error?.response?.data?.message || "Product already exists");
        }

        return;
      }

      // ========================================
      // OTHER ERROR
      // ========================================

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
      {/* ========================================
          HEADER
      ======================================== */}

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

      {/* ========================================
          FORM
      ======================================== */}

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        {/* ======================================
            PRODUCT CODE
        ====================================== */}

        <label>
          Product Code
          <input
            type="text"
            value={loadingCode ? "Generating..." : generatedCode}
            readOnly
            className="readonly-input"
            placeholder="Auto generated"
          />
          <small className="field-hint">Automatically generated</small>
        </label>

        {/* ======================================
            PRODUCT NAME
        ====================================== */}

        <label>
          Product Name
          <input
            type="text"
            value={form.name || ""}
            className={errors.name ? "input-error" : ""}
            placeholder="Enter Name"
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <small className="error-text">{errors.name}</small>}
        </label>

        {/* ======================================
            CATEGORY
        ====================================== */}

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

        {/* ======================================
            UNIT
        ====================================== */}

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

        {/* ======================================
            RATE
        ====================================== */}

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

        {/* ======================================
            DESCRIPTION
        ====================================== */}

        <label className="description-field">
          Description
          <textarea
            value={form.description || ""}
            placeholder="Product description..."
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </label>

        {/* ======================================
            SAVE BUTTON
        ====================================== */}

        <div className="form-submit">
          <button
            type="submit"
            className="primary"
            disabled={saving || loadingCode}
          >
            <Plus size={18} />

            {saving
              ? "Saving..."
              : editingId
                ? "Update Product"
                : "Save Product"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ProductForm;
