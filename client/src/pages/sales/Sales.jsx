import React, { useEffect, useRef, useState } from "react";

import api from "../../api/client";
import { today } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

import SalesForm from "./SalesForm";
import SalesRegister from "./SalesRegister";
import SaleDetailsModal from "../../components/SaleDetailsModal";

function Sales() {
  const { role } = useAuth();

  const canEdit = role === "admin";

  // ==========================================
  // STATE
  // ==========================================

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [type, setType] = useState("retail");

  const [month, setMonth] = useState(() =>
    today().slice(0, 7),
  );

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedSale, setSelectedSale] =
    useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] =
    useState(10);

  const throttleTimeoutRef = useRef(null);
  const lastSearchTimeRef = useRef(0);

  // ==========================================
  // FORM
  // ==========================================

  const createBlankForm = () => ({
    date: today(),

    // Only used in frontend
    // Backend receives partyId
    partyId: "",

    // Only used in frontend
    // Backend receives partyName
    partyName: "",

    items: [],

    paymentMode: "Cash",

    paymentStatus: "Paid",

    notes: "",

    amount: 0,
  });

  const [form, setForm] =
    useState(createBlankForm());

  const [errors, setErrors] = useState({});

  // ==========================================
  // LOAD PARTIES
  // ==========================================

  const loadParties = async () => {
    try {
      const response = await api.get("/parties");

      const data =
        response.data?.data ||
        response.data ||
        [];

      const customerList = data.filter(
        (party) => party.type === "customer",
      );

      const supplierList = data.filter(
        (party) => party.type === "supplier",
      );

      setCustomers(customerList);
      setSuppliers(supplierList);
    } catch (error) {
      console.error(
        "Failed to load parties:",
        error,
      );

      setCustomers([]);
      setSuppliers([]);
    }
  };

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  const loadProducts = async () => {
    try {
      setProductsLoading(true);

      const response = await api.get(
        "/products?active=true",
      );

      setProducts(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load products:",
        error,
      );

      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // ==========================================
  // LOAD SALES
  // ==========================================

  const loadSales = async (
    searchValue = search,
  ) => {
    try {
      setLoading(true);

      const response = await api.get(
        `/sales?month=${month}&type=${type}&search=${encodeURIComponent(
          searchValue,
        )}`,
      );

      setSales(response.data || []);
    } catch (error) {
      console.error(
        "Failed to load sales:",
        error,
      );

      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadProducts();
    loadParties();
  }, []);

  // ==========================================
  // MONTH / TYPE CHANGE
  // ==========================================

  useEffect(() => {
    setCurrentPage(1);

    loadSales(search);
  }, [month, type]);

  // ==========================================
  // SEARCH
  // ==========================================

  useEffect(() => {
    const now = Date.now();

    const elapsed =
      now - lastSearchTimeRef.current;

    const delay =
      elapsed >= 500 ? 0 : 500 - elapsed;

    clearTimeout(
      throttleTimeoutRef.current,
    );

    throttleTimeoutRef.current =
      setTimeout(() => {
        lastSearchTimeRef.current =
          Date.now();

        setCurrentPage(1);

        loadSales(search);
      }, delay);

    return () =>
      clearTimeout(
        throttleTimeoutRef.current,
      );
  }, [search]);

  // ==========================================
  // TYPE CHANGE
  // ==========================================

  const handleTypeChange = (newType) => {
    setType(newType);

    setErrors({});

    setCurrentPage(1);

    setForm(createBlankForm());
  };

  // ==========================================
  // SAVE SALE
  // ==========================================

  const handleSaveSale = async (saleForm) => {
    try {
      setSaving(true);

      const payload = {
        date: saleForm.date,

        // =====================================
        // PARTY
        // =====================================

        partyId:
          saleForm.partyId || null,

        partyName:
          saleForm.partyName?.trim() || "",

        type,

        // =====================================
        // PRODUCTS
        // =====================================

        items: saleForm.items.map(
          (item) => ({
            product: item.product,

            quantity: Number(
              item.quantity,
            ),

            rate: Number(item.rate),

            amount:
              Number(item.quantity) *
              Number(item.rate),
          }),
        ),

        amount:
          saleForm.items.reduce(
            (total, item) =>
              total +
              Number(item.quantity) *
                Number(item.rate),
            0,
          ),

        // =====================================
        // PAYMENT
        // =====================================

        paymentMode:
          saleForm.paymentMode,

        paymentStatus:
          saleForm.paymentStatus,

        // =====================================
        // NOTES
        // =====================================

        notes:
          saleForm.notes?.trim() || "",
      };

      await api.post(
        "/sales",
        payload,
      );

      setForm(createBlankForm());

      setErrors({});

      setCurrentPage(1);

      await loadSales(search);
    } catch (error) {
      console.error(
        "Failed to save sale:",
        error,
      );

      alert(
        error?.response?.data?.message ||
          "Failed to save sale",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // SOFT DELETE SALE
  // ==========================================

  const handleDelete = async (id) => {
    try {
      await api.delete(
        `/sales/${id}`,
      );

      // Reload after soft delete
      await loadSales(search);

      setCurrentPage((page) => {
        const remainingItems =
          Math.max(
            sales.length - 1,
            0,
          );

        const newTotalPages =
          Math.ceil(
            remainingItems /
              itemsPerPage,
          );

        if (
          newTotalPages > 0 &&
          page > newTotalPages
        ) {
          return newTotalPages;
        }

        return page;
      });
    } catch (error) {
      console.error(
        "Failed to delete sale:",
        error,
      );

      alert(
        error?.response?.data?.message ||
          "Failed to delete sale",
      );
    }
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.ceil(
    sales.length / itemsPerPage,
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const paginatedSales =
    sales.slice(
      startIndex,
      startIndex +
        itemsPerPage,
    );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="content">
      <SalesForm
        type={type}
        onTypeChange={handleTypeChange}
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
        products={products}
        productsLoading={
          productsLoading
        }
        saving={saving}
        onSave={handleSaveSale}
        customers={customers}
        suppliers={suppliers}
      />

      <SalesRegister
        sales={paginatedSales}
        loading={loading}
        month={month}
        search={search}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sales.length}
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
        onViewSale={setSelectedSale}
      />

      <SaleDetailsModal
        sale={selectedSale}
        onClose={() =>
          setSelectedSale(null)
        }
      />
    </div>
  );
}

export default Sales;