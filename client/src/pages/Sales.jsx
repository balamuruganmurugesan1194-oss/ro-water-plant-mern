import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import api from "../api/client";
import { today } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

import SalesForm from "../components/sales/SalesForm";
import SalesRegister from "../components/sales/SalesRegister";
import SaleDetailsModal from "../components/sales/SaleDetailsModal";

import {
  fetchParties,
  fetchProducts,
  fetchSales,
  saleActions,
} from "../app/resourceSlice";

function Sales() {
  const dispatch = useDispatch();

  const productsState = useSelector((state) => state.products);
  const partiesState = useSelector((state) => state.parties);
  const salesState = useSelector((state) => state.sales);

  const products = productsState.data;

  const customers = partiesState.data.filter(
    (party) => party.type === "customer",
  );

  const suppliers = partiesState.data.filter(
    (party) => party.type === "supplier",
  );

  const sales = salesState.data;

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

  const canView = hasPermission("sales.view");
  const canCreate = hasPermission("sales.create");
  const canEdit = hasPermission("sales.edit");
  const canDelete = hasPermission("sales.delete");

  // ==========================================
  // STATE
  // ==========================================

  const [type, setType] = useState("retail");

  const [month, setMonth] = useState(() => today().slice(0, 7));

  const [search, setSearch] = useState("");

  const [saving, setSaving] = useState(false);

  // ==========================================
  // SALE NUMBER
  // ==========================================

  const [saleNumber, setSaleNumber] = useState("");

  const [selectedSale, setSelectedSale] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const throttleTimeoutRef = useRef(null);

  const lastSearchTimeRef = useRef(0);

  // ==========================================
  // FORM
  // ==========================================

  const createBlankForm = () => ({
    date: today(),
    partyId: "",
    partyName: "",
    items: [],
    paymentMode: "Cash",
    paymentStatus: "Paid",
    notes: "",
    amount: 0,
  });

  const [form, setForm] = useState(createBlankForm());

  const [errors, setErrors] = useState({});

  // ==========================================
  // LOAD NEXT SALE NUMBER
  // ==========================================

  const loadNextSaleNumber = async () => {
    if (!canCreate) {
      setSaleNumber("");
      return;
    }

    try {
      const response = await api.get("/sales/next-number");

      const nextNumber = response.data?.saleNumber || "";

      setSaleNumber(nextNumber);
    } catch (error) {
      console.error("Failed to load next sale number:", error);

      setSaleNumber("");

      toast.error(
        error?.response?.data?.message || "Failed to load next sale number",
      );
    }
  };

  // ==========================================
  // LOAD PARTIES
  // ==========================================

  const loadParties = async () => {
    if (!canCreate) {
      return;
    }

    try {
      await dispatch(fetchParties({}));
    } catch (error) {
      console.error("Failed to load parties:", error);

      toast.error(error?.response?.data?.message || "Failed to load parties");
    }
  };

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  const loadProducts = async () => {
    if (!canCreate) {
      return;
    }

    try {
      await dispatch(fetchProducts({ active: true }));
    } catch (error) {
      console.error("Failed to load products:", error);

      toast.error(error?.response?.data?.message || "Failed to load products");
    }
  };

  // ==========================================
  // LOAD SALES
  // ==========================================

  const loadSales = async (searchValue = search) => {
    if (!canView) {
      return;
    }

    try {
      await dispatch(
        fetchSales({
          month,
          type,
          search: searchValue,
          page: currentPage,
          limit: itemsPerPage,
        }),
      );
    } catch (error) {
      console.error("Failed to load sales:", error);

      toast.error(error?.response?.data?.message || "Failed to load sales");
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (!canView) {
      return;
    }

    loadSales(search);

    if (canCreate) {
      loadProducts();
      loadParties();
      loadNextSaleNumber();
    }
  }, [canView, canCreate]);

  // ==========================================
  // MONTH / TYPE CHANGE
  // ==========================================

  useEffect(() => {
    if (!canView) {
      return;
    }

    setCurrentPage(1);

    loadSales(search);
  }, [month, type, canView]);

  // ==========================================
  // SEARCH
  // ==========================================

  useEffect(() => {
    if (!canView) {
      return;
    }

    const now = Date.now();

    const elapsed = now - lastSearchTimeRef.current;

    const delay = elapsed >= 500 ? 0 : 500 - elapsed;

    clearTimeout(throttleTimeoutRef.current);

    throttleTimeoutRef.current = setTimeout(() => {
      lastSearchTimeRef.current = Date.now();

      setCurrentPage(1);

      loadSales(search);
    }, delay);

    return () => clearTimeout(throttleTimeoutRef.current);
  }, [search, canView]);

  useEffect(() => {
    if (canView) {
      loadSales(search);
    }
  }, [currentPage, itemsPerPage]);

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
    if (!canCreate) {
      toast.error("You do not have permission to create sales.");

      return;
    }

    try {
      setSaving(true);

      // ========================================
      // CALCULATE ITEMS
      // ========================================

      const items = saleForm.items.map((item) => ({
        product: item.product,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        amount: Number(item.quantity) * Number(item.rate),
      }));

      // ========================================
      // CALCULATE TOTAL
      // ========================================

      const totalAmount = saleForm.items.reduce(
        (total, item) => total + Number(item.quantity) * Number(item.rate),
        0,
      );

      // ========================================
      // PAYLOAD
      // ========================================

      const payload = {
        date: saleForm.date,

        // PARTY
        partyId: saleForm.partyId || null,

        partyName: saleForm.partyName?.trim() || "",

        type,

        // PRODUCTS
        items,

        amount: totalAmount,

        // PAYMENT
        paymentMode: saleForm.paymentMode,

        paymentStatus: saleForm.paymentStatus,

        // NOTES
        notes: saleForm.notes?.trim() || "",
      };

      // ========================================
      // BACKEND GENERATES SALE NUMBER
      // ========================================

      const response = await api.post("/sales", payload);

      console.log("Sale created:", response.data);

      // ========================================
      // SUCCESS TOAST
      // ========================================

      toast.success("Sale saved successfully");

      // ========================================
      // RESET FORM
      // ========================================

      setForm(createBlankForm());

      setErrors({});

      setCurrentPage(1);

      // ========================================
      // RELOAD SALES
      // ========================================

      dispatch(saleActions.clearResource());

      await loadSales(search);

      // ========================================
      // GET NEXT SALE NUMBER
      // ========================================

      await loadNextSaleNumber();
    } catch (error) {
      console.error("Failed to save sale:", error);

      toast.error(error?.response?.data?.message || "Failed to save sale");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // SOFT DELETE SALE
  // ==========================================

  const handleDelete = async (id) => {
    if (!canDelete) {
      toast.error("You do not have permission to delete sales.");

      return;
    }

    try {
      await api.delete(`/sales/${id}`);

      // Reload after soft delete
      dispatch(saleActions.clearResource());

      await loadSales(search);

      // ========================================
      // SUCCESS TOAST
      // ========================================

      toast.success("Sale deleted successfully");

      setCurrentPage((page) => {
        const remainingItems = Math.max(sales.length - 1, 0);

        const newTotalPages = Math.ceil(remainingItems / itemsPerPage);

        if (newTotalPages > 0 && page > newTotalPages) {
          return newTotalPages;
        }

        return page;
      });
    } catch (error) {
      console.error("Failed to delete sale:", error);

      toast.error(error?.response?.data?.message || "Failed to delete sale");
    }
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = salesState.pagination?.totalPages || 0;

  const paginatedSales = sales;

  // ==========================================
  // NO VIEW PERMISSION
  // ==========================================

  if (!canView) {
    return (
      <div className="content">
        <section className="panel">
          <div className="empty-state">
            You do not have permission to view sales.
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
      {/* ======================================
          SALES FORM
      ====================================== */}

      {canCreate && (
        <SalesForm
          type={type}
          onTypeChange={handleTypeChange}
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          products={products}
          productsLoading={productsState.loading}
          saving={saving}
          onSave={handleSaveSale}
          customers={customers}
          suppliers={suppliers}
          saleNumber={saleNumber}
          canCreate={canCreate}
        />
      )}

      {/* ======================================
          SALES REGISTER
      ====================================== */}

      <SalesRegister
        sales={paginatedSales}
        allSales={sales}
        loading={salesState.loading}
        month={month}
        type={type}
        search={search}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={salesState.pagination?.total || sales.length}
        itemsPerPage={itemsPerPage}
        canEdit={canEdit}
        canDelete={canDelete}
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

      {/* ======================================
          SALE DETAILS MODAL
      ====================================== */}

      <SaleDetailsModal
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </div>
  );
}

export default Sales;
