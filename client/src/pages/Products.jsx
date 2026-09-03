import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

import ProductForm from "../components/products/ProductForm";
import ProductTable from "../components/products/ProductTable";

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
// PRODUCTS
// ==========================================

function Products() {
  const { role } = useAuth();

  const canEdit = role === "admin";

  // ==========================================
  // STATE
  // ==========================================

  const [products, setProducts] = useState([]);

  const [form, setForm] = useState(createBlankProduct());

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [togglingId, setTogglingId] = useState(null);

  const [editingId, setEditingId] = useState(null);

  // ==========================================
  // PAGINATION
  // ==========================================

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/products?search=${encodeURIComponent(search)}`,
      );

      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);

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

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const paginatedProducts = products.slice(startIndex, endIndex);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setForm(createBlankProduct());

    setErrors({});

    setEditingId(null);
  };

  // ==========================================
  // EDIT PRODUCT
  // ==========================================

  const handleEdit = (product) => {
    setEditingId(product._id);

    setForm({
      name: product.name || "",

      code: product.code || "",

      category: product.category || "",

      unit: product.unit || "",

      rate: product.rate ?? "",

      active: product.active !== false,

      description: product.description || "",
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

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);

      await loadProducts();

      // Fix current page if last item was deleted
      const remainingItems = products.length - 1;

      const newTotalPages = Math.ceil(remainingItems / itemsPerPage);

      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error("Failed to delete product:", error);

      alert(error?.response?.data?.message || "Failed to delete product");
    }
  };

  // ==========================================
  // TOGGLE ACTIVE
  // ==========================================

  const handleToggleActive = async (product) => {
    const newStatus = !product.active;

    // Confirm only when deactivating
    if (!newStatus) {
      const confirmed = window.confirm(
        `Deactivate "${product.name}"? It will no longer be available for new orders.`,
      );

      if (!confirmed) {
        return;
      }
    }

    setTogglingId(product._id);

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
      await api.put(`/products/${product._id}`, {
        ...product,
        active: newStatus,
      });
    } catch (error) {
      console.error("Failed to toggle status:", error);

      // Revert
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? {
                ...p,
                active: !newStatus,
              }
            : p,
        ),
      );

      alert(
        error?.response?.data?.message || "Could not update product status.",
      );
    } finally {
      setTogglingId(null);
    }
  };

  // ==========================================
  // ITEMS PER PAGE
  // ==========================================

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);

    setCurrentPage(1);
  };

  // ==========================================
  // PAGE CHANGE
  // ==========================================

  const handlePageChange = (page) => {
    setCurrentPage(page);

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

      <ProductForm
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
        editingId={editingId}
        saving={saving}
        setSaving={setSaving}
        onReset={resetForm}
        onSaved={loadProducts}
      />

      {/* ========================================
          PRODUCT LIST
      ======================================== */}

      <ProductTable
        products={paginatedProducts}
        allProducts={products}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        canEdit={canEdit}
        togglingId={togglingId}
        onEdit={handleEdit}
        onDelete={deleteProduct}
        onToggleActive={handleToggleActive}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}

export default Products;
