import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { money } from "../utils/helpers";
import Loading from "../components/Loading";
import DeleteButton from "../components/DeleteButton";
const createBlankProduct = () => ({
  name: "",
  code: "",
  category: "Water",
  unit: "Jar",
  rate: "",
  active: true,
  description: "",
});

function Products() {
  const { role } = useAuth();
  const canEdit = role === "admin";
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(createBlankProduct());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  // ==========================================
  // LOAD PRODUCTS
  // ==========================================
  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/products?search=${encodeURIComponent(search)}`,
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

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
  // RESET FORM
  // ==========================================
  const resetForm = () => {
    setForm(createBlankProduct());

    setErrors({});

    setEditingId(null);
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

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }

      resetForm();

      await loadProducts();
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
  // EDIT PRODUCT
  // ==========================================
  const handleEdit = (product) => {
    setEditingId(product._id);

    setForm({
      name: product.name || "",

      code: product.code || "",

      category: product.category || "Water",

      unit: product.unit || "Jar",

      rate: product.rate ?? "",
      active: product.active !== false,

      description: product.description || "",
    });

    setErrors({});
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================
  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);

      await loadProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);

      alert(error?.response?.data?.message || "Failed to delete product");
    }
  };

  const handleToggleActive = async (product) => {
    const newStatus = !product.active;
    // Confirm only when deactivating (activating is low-risk, skip the prompt)
    if (!newStatus) {
      const confirmed = window.confirm(
        `Deactivate "${product.name}"? It will no longer be available for new orders.`,
      );
      if (!confirmed) return;
    }
    setTogglingId(product._id);

    // Optimistic update — flip UI immediately
    setProducts((prev) =>
      prev.map((p) =>
        p._id === product._id ? { ...p, active: newStatus } : p,
      ),
    );

    try {
      await api.put(`/products/${product._id}`, {
        ...product,
        active: newStatus,
      });
    } catch (err) {
      console.error("Failed to toggle status:", err);
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, active: !newStatus } : p,
        ),
      );
      alert(err?.response?.data?.message || "Could not update product status.");
    } finally {
      setTogglingId(null);
    }
  };
  function StatusToggleSwitch({ isActive, onChange, disabled }) {
    const trackStyle = {
      position: "relative",
      display: "inline-block",
      width: "44px",
      height: "24px",
      borderRadius: "999px",
      border: "none",
      padding: 0,
      cursor: disabled ? "not-allowed" : "pointer",
      backgroundColor: isActive ? "#22c55e" : "#c82014",
      opacity: disabled ? 0.6 : 1,
      transition: "background-color 0.2s ease",
      boxSizing: "border-box",
      verticalAlign: "middle",
    };

    const thumbStyle = {
      position: "absolute",
      top: "2px",
      left: isActive ? "17px" : "2px",
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      backgroundColor: "#ffffff",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
      transition: "left 0.2s ease",
      display: "block",
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        disabled={disabled}
        onClick={onChange}
        style={trackStyle}
      >
        <span style={thumbStyle} />
      </button>
    );
  }
  return (
    <div className="content">
      {/* ========================================
          PRODUCT FORM
      ======================================== */}
      <section className="panel">
        <div className="panel-head">
          <h3>{editingId ? "Edit Product" : "New Product"}</h3>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {/* NAME */}
          <label>
            Product Name
            <input
              type="text"
              value={form.name}
              className={errors.name ? "input-error" : ""}
              placeholder="20L Jar"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && <small className="error-text">{errors.name}</small>}
          </label>

          {/* CODE */}
          <label>
            Product Code
            <input
              type="text"
              value={form.code}
              className={errors.code ? "input-error" : ""}
              placeholder="JAR20"
              onChange={(e) =>
                handleChange("code", e.target.value.toUpperCase())
              }
            />
            {errors.code && <small className="error-text">{errors.code}</small>}
          </label>

          {/* CATEGORY */}
          <label>
            Category
            <select
              value={form.category}
              className={errors.category ? "input-error" : ""}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              <option value="Water">Water</option>

              <option value="Bottle">Bottle</option>

              <option value="Jar">Jar</option>

              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <small className="error-text">{errors.category}</small>
            )}
          </label>

          {/* UNIT */}
          <label>
            Unit
            <select
              value={form.unit}
              className={errors.unit ? "input-error" : ""}
              onChange={(e) => handleChange("unit", e.target.value)}
            >
              <option value="Jar">Jar</option>

              <option value="Bottle">Bottle</option>

              <option value="Piece">Piece</option>

              <option value="Litre">Litre</option>

              <option value="Box">Box</option>
            </select>
            {errors.unit && <small className="error-text">{errors.unit}</small>}
          </label>

          {/* SELLING RATE */}
          <label>
            Rate
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.rate}
              className={errors.rate ? "input-error" : ""}
              placeholder="40"
              onChange={(e) => handleChange("rate", e.target.value)}
            />
            {errors.rate && <small className="error-text">{errors.rate}</small>}
          </label>

          {/* DESCRIPTION */}
          <label>
            Description
            <textarea
              style={{ height: 40 }}
              rows="3"
              value={form.description}
              placeholder="Product description..."
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </label>
          <button type="submit" className="primary" disabled={saving}>
            <Plus size={18} />

            {saving
              ? "Saving..."
              : editingId
                ? "Update Product"
                : "Save Product"}
          </button>
        </form>
      </section>
      {/* ========================================
          PRODUCT LIST
      ======================================== */}
      <section className="panel">
        <div className="panel-head">
          <h3>Products</h3>

          <div className="filters">
            <div className="search-box">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : products.length === 0 ? (
          <div className="empty-state">No products found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const lowStock = product.currentStock <= product.minimumStock;

                  return (
                    <tr key={product._id}>
                      <td>
                        <strong>{product.name}</strong>
                      </td>

                      <td>{product.code}</td>

                      <td>{product.category}</td>

                      <td>{product.unit}</td>

                      <td>{money(product.rate)}</td>

                      {canEdit && (
                        <td>
                          <div className="table-actions">
                            <StatusToggleSwitch
                              isActive={product.active}
                              disabled={togglingId === product._id}
                              onChange={() => handleToggleActive(product)}
                            />
                            <button
                              type="button"
                              className="icon"
                              title="Edit"
                              onClick={() => handleEdit(product)}
                            >
                              <Pencil size={16} />
                            </button>
                            <DeleteButton
                              onDelete={() => deleteProduct(product._id)}
                              itemName={product.name}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Products;
