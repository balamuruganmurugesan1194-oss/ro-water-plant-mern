import React, { useEffect, useRef, useState } from "react";

import api from "../api/client";
import { today } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

import PurchaseForm from "../components/purchases/PurchaseForm";
import PurchaseRegister from "../components/purchases/PurchaseRegister";
import PurchaseDetailsModal from "../components/purchases/PurchaseDetailsModal";

function Purchases() {
  const { role } = useAuth();
  const canEdit = role === "admin";

  const createBlankForm = () => ({
    date: today(),
    supplierId: "",
    supplierName: "",
    items: [],
    paymentMode: "cash",
    paymentStatus: "paid",
    notes: "",
    amount: 0,
  });

  const [form, setForm] = useState(createBlankForm());
  const [errors, setErrors] = useState({});

  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const throttleRef = useRef(null);
  const lastSearchRef = useRef(0);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await api.get("/products?active=true");
      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await api.get("/parties?type=supplier");
      const data = response.data?.data || response.data || [];
      setSuppliers(data.filter((party) => party.type === "supplier"));
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      setSuppliers([]);
    }
  };

  const loadPurchases = async (searchValue = search) => {
    try {
      setLoading(true);

      const response = await api.get(
        `/purchases?month=${month}&search=${encodeURIComponent(searchValue)}`,
      );

      setPurchases(response.data || []);
    } catch (error) {
      console.error("Failed to load purchases:", error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadSuppliers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    loadPurchases(search);
  }, [month]);

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastSearchRef.current;
    const delay = elapsed >= 500 ? 0 : 500 - elapsed;

    clearTimeout(throttleRef.current);

    throttleRef.current = setTimeout(() => {
      lastSearchRef.current = Date.now();
      setCurrentPage(1);
      loadPurchases(search);
    }, delay);

    return () => clearTimeout(throttleRef.current);
  }, [search]);

  const handleSave = async (purchaseForm) => {
    try {
      setSaving(true);

      const payload = {
        date: purchaseForm.date,
        supplierId: purchaseForm.supplierId,
        items: purchaseForm.items.map((item) => ({
          product: item.product,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
        paymentMode: purchaseForm.paymentMode,
        paymentStatus: purchaseForm.paymentStatus,
        notes: purchaseForm.notes?.trim() || "",
      };

      await api.post("/purchases", payload);

      setForm(createBlankForm());
      setErrors({});
      setCurrentPage(1);

      await loadPurchases(search);
    } catch (error) {
      console.error("Failed to save purchase:", error);
      alert(error?.response?.data?.message || "Failed to save purchase");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/purchases/${id}`);
      await loadPurchases(search);
    } catch (error) {
      console.error("Failed to delete purchase:", error);
      alert(error?.response?.data?.message || "Failed to delete purchase");
    }
  };

  const totalPages = Math.ceil(purchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPurchases = purchases.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="content">
      <PurchaseForm
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
        suppliers={suppliers}
        products={products}
        productsLoading={productsLoading}
        saving={saving}
        onSave={handleSave}
      />

      <PurchaseRegister
        purchases={paginatedPurchases}
        allPurchases={purchases}
        loading={loading}
        month={month}
        search={search}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={purchases.length}
        itemsPerPage={itemsPerPage}
        canEdit={canEdit}
        onMonthChange={setMonth}
        onSearchChange={setSearch}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        onDelete={handleDelete}
        onViewPurchase={setSelectedPurchase}
      />

      <PurchaseDetailsModal
        purchase={selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
      />
    </div>
  );
}

export default Purchases;
