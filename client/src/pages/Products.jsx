import React, {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Pencil,
  Search,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { money } from "../utils/helpers";

import Loading from "../components/Loading";
import DeleteButton from "../components/DeleteButton";
import Pagination from "../components/Pagination";
import SearchableSelect from "../components/SearchableSelect";

import {
  categories,
  units,
} from "../data/products.json";

// ==========================================
// BLANK PRODUCT
// ==========================================

const createBlankProduct = () => ({
  name: "",
  code: "",
  category: "",
  unit: "",
  rate: "",
  active: true,
  description: "",
});

// ==========================================
// STATUS TOGGLE
// ==========================================

function StatusToggleSwitch({
  isActive,
  onChange,
  disabled,
}) {
  const trackStyle = {
    position: "relative",
    display: "inline-block",
    width: "44px",
    height: "24px",
    borderRadius: "999px",
    border: "none",
    padding: 0,
    cursor: disabled
      ? "not-allowed"
      : "pointer",
    backgroundColor: isActive
      ? "#22c55e"
      : "#c82014",
    opacity: disabled ? 0.6 : 1,
    transition:
      "background-color 0.2s ease",
    boxSizing: "border-box",
    verticalAlign: "middle",
  };

  const thumbStyle = {
    position: "absolute",
    top: "2px",
    left: isActive
      ? "17px"
      : "2px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    boxShadow:
      "0 1px 3px rgba(0, 0, 0, 0.3)",
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

// ==========================================
// PRODUCTS
// ==========================================

function Products() {
  const { role } = useAuth();

  const canEdit = role === "admin";

  // ==========================================
  // STATE
  // ==========================================

  const [products, setProducts] =
    useState([]);

  const [form, setForm] = useState(
    createBlankProduct(),
  );

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [togglingId, setTogglingId] =
    useState(null);

  const [editingId, setEditingId] =
    useState(null);

  // ==========================================
  // PAGINATION
  // ==========================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const [itemsPerPage, setItemsPerPage] =
    useState(10);

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/products?search=${encodeURIComponent(
          search,
        )}`,
      );

      setProducts(
        response.data || [],
      );
    } catch (error) {
      console.error(
        "Failed to load products:",
        error,
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD PRODUCTS WHEN SEARCH CHANGES
  // ==========================================

  useEffect(() => {
    setCurrentPage(1);

    loadProducts();
  }, [search]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalItems = products.length;

  const totalPages = Math.ceil(
    totalItems / itemsPerPage,
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const paginatedProducts =
    products.slice(
      startIndex,
      endIndex,
    );

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (
    field,
    value,
  ) => {
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
      newErrors.name =
        "Product name is required";
    }

    if (!form.code.trim()) {
      newErrors.code =
        "Product code is required";
    }

    if (!form.category.trim()) {
      newErrors.category =
        "Category is required";
    }

    if (!form.unit.trim()) {
      newErrors.unit =
        "Unit is required";
    }

    if (
      form.rate === "" ||
      Number(form.rate) <= 0
    ) {
      newErrors.rate =
        "Rate must be greater than 0";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setForm(
      createBlankProduct(),
    );

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

        code: form.code
          .trim()
          .toUpperCase(),

        category:
          form.category.trim(),

        unit: form.unit.trim(),

        rate: Number(form.rate),

        active: form.active,

        description:
          form.description.trim(),
      };

      if (editingId) {
        await api.put(
          `/products/${editingId}`,
          payload,
        );
      } else {
        await api.post(
          "/products",
          payload,
        );
      }

      resetForm();

      setCurrentPage(1);

      await loadProducts();
    } catch (error) {
      console.error(
        "SAVE PRODUCT ERROR:",
        error,
      );

      console.error(
        "Response:",
        error?.response?.data,
      );

      console.error(
        "Status:",
        error?.response?.status,
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.response?.data
            ?.error ||
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

  const handleEdit = (
    product,
  ) => {
    setEditingId(product._id);

    setForm({
      name: product.name || "",

      code: product.code || "",

      category:
        product.category || "",

      unit: product.unit || "",

      rate:
        product.rate ?? "",

      active:
        product.active !== false,

      description:
        product.description || "",
    });

    setErrors({});

    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const deleteProduct = async (
    id,
  ) => {
    try {
      await api.delete(
        `/products/${id}`,
      );

      await loadProducts();

      // Fix current page if
      // last item was deleted
      const remainingItems =
        products.length - 1;

      const newTotalPages =
        Math.ceil(
          remainingItems /
            itemsPerPage,
        );

      if (
        currentPage >
          newTotalPages &&
        newTotalPages > 0
      ) {
        setCurrentPage(
          newTotalPages,
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete product:",
        error,
      );

      alert(
        error?.response?.data
          ?.message ||
          "Failed to delete product",
      );
    }
  };

  // ==========================================
  // TOGGLE ACTIVE
  // ==========================================

  const handleToggleActive =
    async (product) => {
      const newStatus =
        !product.active;

      // Confirm only when
      // deactivating
      if (!newStatus) {
        const confirmed =
          window.confirm(
            `Deactivate "${product.name}"? It will no longer be available for new orders.`,
          );

        if (!confirmed) {
          return;
        }
      }

      setTogglingId(
        product._id,
      );

      // Optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? {
                ...p,
                active: newStatus,
              }
            : p,
        ),
      );

      try {
        await api.put(
          `/products/${product._id}`,
          {
            ...product,
            active: newStatus,
          },
        );
      } catch (err) {
        console.error(
          "Failed to toggle status:",
          err,
        );

        // Revert
        setProducts((prev) =>
          prev.map((p) =>
            p._id === product._id
              ? {
                  ...p,
                  active:
                    !newStatus,
                }
              : p,
          ),
        );

        alert(
          err?.response?.data
            ?.message ||
            "Could not update product status.",
        );
      } finally {
        setTogglingId(null);
      }
    };

  // ==========================================
  // ITEMS PER PAGE
  // ==========================================

  const handleItemsPerPageChange =
    (value) => {
      setItemsPerPage(value);

      setCurrentPage(1);
    };

  // ==========================================
  // PAGE CHANGE
  // ==========================================

  const handlePageChange = (
    page,
  ) => {
    setCurrentPage(page);

    // Optional: scroll to table
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="content">
      {/* ========================================
          PRODUCT FORM
      ======================================== */}

      <section className="panel">
        <div className="panel-head">
          <h3>
            {editingId
              ? "Edit Product"
              : "New Product"}
          </h3>

          {editingId && (
            <button
              type="button"
              className="secondary"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>
          )}
        </div>

        <form
          className="form-grid"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* NAME */}

          <label>
            Product Name

            <input
              type="text"
              value={form.name}
              className={
                errors.name
                  ? "input-error"
                  : ""
              }
              placeholder="Enter Name"
              onChange={(e) =>
                handleChange(
                  "name",
                  e.target.value,
                )
              }
            />

            {errors.name && (
              <small className="error-text">
                {errors.name}
              </small>
            )}
          </label>

          {/* CODE */}

          <label>
            Product Code

            <input
              type="text"
              value={form.code}
              className={
                errors.code
                  ? "input-error"
                  : ""
              }
              placeholder="Enter Code"
              onChange={(e) =>
                handleChange(
                  "code",
                  e.target.value.toUpperCase(),
                )
              }
            />

            {errors.code && (
              <small className="error-text">
                {errors.code}
              </small>
            )}
          </label>

          {/* CATEGORY */}

          <div className="form-field">
            <label htmlFor="category">
              Category
            </label>

            <SearchableSelect
              value={form.category}
              options={categories}
              placeholder="Select category"
              error={
                !!errors.category
              }
              onChange={(value) =>
                handleChange(
                  "category",
                  value,
                )
              }
            />

            {errors.category && (
              <span className="error-text">
                {errors.category}
              </span>
            )}
          </div>

          {/* UNIT */}

          <div className="form-field">
            <label htmlFor="unit">
              Unit
            </label>

            <SearchableSelect
              value={form.unit}
              options={units}
              placeholder="Select unit"
              error={
                !!errors.unit
              }
              onChange={(value) =>
                handleChange(
                  "unit",
                  value,
                )
              }
            />

            {errors.unit && (
              <small className="error-text">
                {errors.unit}
              </small>
            )}
          </div>

          {/* RATE */}

          <label>
            Rate

            <input
              type="number"
              min="0"
              step="0.01"
              value={form.rate}
              className={
                errors.rate
                  ? "input-error"
                  : ""
              }
              placeholder="Enter Rate"
              onChange={(e) =>
                handleChange(
                  "rate",
                  e.target.value,
                )
              }
            />

            {errors.rate && (
              <small className="error-text">
                {errors.rate}
              </small>
            )}
          </label>

          {/* DESCRIPTION */}

          <label>
            Description

            <textarea
              style={{
                height: 40,
              }}
              rows="3"
              value={
                form.description
              }
              placeholder="Product description..."
              onChange={(e) =>
                handleChange(
                  "description",
                  e.target.value,
                )
              }
            />
          </label>

          {/* SAVE */}

          <button
            type="submit"
            className="primary"
            disabled={saving}
          >
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
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* ======================================
            LOADING
        ====================================== */}

        {loading ? (
          <Loading />
        ) : products.length === 0 ? (
          <div className="empty-state">
            No products found.
          </div>
        ) : (
          <>
            {/* ==================================
                TABLE
            ================================== */}

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Rate</th>

                    {canEdit && (
                      <th>Action</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {paginatedProducts.map(
                    (product) => (
                      <tr
                        key={
                          product._id
                        }
                      >
                        {/* PRODUCT */}

                        <td>
                          <strong>
                            {
                              product.name
                            }
                          </strong>
                        </td>

                        {/* CODE */}

                        <td>
                          {
                            product.code
                          }
                        </td>

                        {/* CATEGORY */}

                        <td>
                          {
                            product.category
                          }
                        </td>

                        {/* UNIT */}

                        <td>
                          {
                            product.unit
                          }
                        </td>

                        {/* RATE */}

                        <td>
                          {money(
                            product.rate,
                          )}
                        </td>

                        {/* ACTION */}

                        {canEdit && (
                          <td>
                            <div className="table-actions">
                              {/* STATUS */}

                              <StatusToggleSwitch
                                isActive={
                                  product.active
                                }
                                disabled={
                                  togglingId ===
                                  product._id
                                }
                                onChange={() =>
                                  handleToggleActive(
                                    product,
                                  )
                                }
                              />

                              {/* EDIT */}

                              <button
                                type="button"
                                className="icon"
                                title="Edit"
                                onClick={() =>
                                  handleEdit(
                                    product,
                                  )
                                }
                              >
                                <Pencil
                                  size={
                                    16
                                  }
                                />
                              </button>

                              {/* DELETE */}

                              <DeleteButton
                                onDelete={() =>
                                  deleteProduct(
                                    product._id,
                                  )
                                }
                                itemName={
                                  product.name
                                }
                              />
                            </div>
                          </td>
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* ==================================
                GLOBAL PAGINATION
            ================================== */}

            <Pagination
              currentPage={
                currentPage
              }
              totalPages={
                totalPages
              }
              totalItems={
                totalItems
              }
              itemsPerPage={
                itemsPerPage
              }
              onPageChange={
                handlePageChange
              }
              onItemsPerPageChange={
                handleItemsPerPageChange
              }
            />
          </>
        )}
      </section>
    </div>
  );
}

export default Products;