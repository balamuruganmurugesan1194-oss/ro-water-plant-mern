import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

import api from "../api/client";

import { fetchProducts, productActions } from "../app/resourceSlice";

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
  const dispatch = useDispatch();

  const {
    data: products,
    loading,
    error: loadError,
  } = useSelector((state) => state.products);

  // ==========================================
  // AUTH / PERMISSIONS
  // ==========================================

  const { isSuperAdmin, permissions = [] } = useAuth();

  const hasPermission = (permission) => {
    if (isSuperAdmin === true) {
      return true;
    }

    if (permissions.includes("*")) {
      return true;
    }

    return permissions.includes(permission);
  };

  const canCreate = hasPermission("products.create");

  const canEdit = hasPermission("products.edit");

  const canDelete = hasPermission("products.delete");

  const canView = hasPermission("products.view");

  // ==========================================
  // STATE
  // ==========================================

  const [form, setForm] = useState(createBlankProduct());

  const [errors, setErrors] = useState({});

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
    if (!canView) {
      return;
    }

    try {
      await dispatch(
        fetchProducts({
          search,
          active: undefined,
        }),
      );
    } catch (error) {
      console.error("Failed to load products:", error);

      toast.error("Failed to load products.");
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  useEffect(() => {
    if (!canView) {
      return;
    }

    setCurrentPage(1);

    const timeoutId = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search, canView]);

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
    if (!canEdit) {
      toast.error("You do not have permission to edit products.");

      return;
    }

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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const deleteProduct = async (id) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete products.");

      return;
    }

    try {
      await api.delete(`/products/${id}`);

      dispatch(productActions.clearResource());

      await loadProducts();

      // ======================================
      // FIX CURRENT PAGE
      // ======================================

      const remainingItems = products.length - 1;

      const newTotalPages = Math.ceil(remainingItems / itemsPerPage);

      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }

      toast.success("Product deleted successfully.");
    } catch (error) {
      console.error("Failed to delete product:", error);

      toast.error(
        error?.response?.data?.message || "Failed to delete product.",
      );
    }
  };

  // ==========================================
  // TOGGLE ACTIVE
  // ==========================================

  const handleToggleActive = async (product) => {
    if (!canEdit) {
      toast.error("You do not have permission to edit products.");

      return;
    }

    const newStatus = !product.active;

    /*
     *
     * The status change is handled directly.
     * A toast confirms the result.
     */

    setTogglingId(product._id);

    // ========================================
    // OPTIMISTIC UPDATE
    // ========================================

    dispatch(
      productActions.setData(
        products.map((p) =>
          p._id === product._id
            ? {
                ...p,
                active: newStatus,
              }
            : p,
        ),
      ),
    );

    try {
      await api.put(`/products/${product._id}`, {
        ...product,
        active: newStatus,
      });

      toast.success(
        newStatus
          ? `"${product.name}" activated successfully.`
          : `"${product.name}" deactivated successfully.`,
      );
    } catch (error) {
      console.error("Failed to toggle status:", error);

      // ======================================
      // REVERT
      // ======================================

      dispatch(
        productActions.setData(
          products.map((p) =>
            p._id === product._id
              ? {
                  ...p,
                  active: !newStatus,
                }
              : p,
          ),
        ),
      );

      toast.error(
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
  // ACCESS DENIED
  // ==========================================

  if (!canView) {
    return (
      <div className="content">
        <section className="panel">
          <div className="empty-state">
            You do not have permission to view products.
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="content">
      {/* ========================================
          PRODUCT FORM
      ======================================== */}

      {(canCreate || (editingId && canEdit)) && (
        <ProductForm
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          editingId={editingId}
          saving={saving}
          setSaving={setSaving}
          onReset={resetForm}
          onSaved={async () => {
            dispatch(productActions.clearResource());

            return loadProducts();
          }}
          canCreate={canCreate}
          canEdit={canEdit}
        />
      )}

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
        canDelete={canDelete}
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
