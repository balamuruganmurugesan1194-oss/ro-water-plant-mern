import React, { useEffect, useState } from "react";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { today } from "../utils/helpers";

import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseTable from "../components/expenses/ExpenseTable";

const createBlankForm = () => ({
  date: today(),
  category: "",
  amount: "",
  vendor: "",
  notes: "",
});

function Expenses() {
  const { role } = useAuth();

  // ADMIN ONLY
  const canEdit = role === "admin";

  const [items, setItems] = useState([]);

  const [month, setMonth] = useState(() => today().slice(0, 7));

  const [search, setSearch] = useState("");

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [form, setForm] = useState(createBlankForm);

  // ==========================================
  // EDITING
  // ==========================================

  const [editingId, setEditingId] = useState(null);

  const [expenseNumber, setExpenseNumber] = useState("");

  // ==========================================
  // EXPENSE NUMBER
  // ==========================================

  const loadNextExpenseNumber = async () => {
    try {
      const response = await api.get("/expenses/next-number");

      setExpenseNumber(response.data?.expenseNumber || "");
    } catch (err) {
      console.error("Failed to load next expense number:", err);

      setExpenseNumber("");
    }
  };

  // ==========================================
  // LOAD EXPENSES
  // ==========================================

  const load = async () => {
    try {
      const response = await api.get(`/expenses?month=${month}`);

      setItems(response.data || []);
    } catch (err) {
      console.error("Failed to load expenses:", err);

      setItems([]);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadNextExpenseNumber();
  }, []);

  // ==========================================
  // LOAD WHEN MONTH CHANGES
  // ==========================================

  useEffect(() => {
    setCurrentPage(1);
    setSearch("");

    load();
  }, [month]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredItems = items.filter((item) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    const date = item.date
      ? new Date(item.date).toLocaleDateString("en-IN").toLowerCase()
      : "";

    const expenseNumber = item.expenseNumber?.toLowerCase() || "";

    const category = item.category?.toLowerCase() || "";

    const vendor = item.vendor?.toLowerCase() || "";

    const notes = item.notes?.toLowerCase() || "";

    const amount =
      item.amount !== undefined && item.amount !== null
        ? String(item.amount).toLowerCase()
        : "";

    return (
      expenseNumber.includes(searchValue) ||
      date.includes(searchValue) ||
      category.includes(searchValue) ||
      vendor.includes(searchValue) ||
      notes.includes(searchValue) ||
      amount.includes(searchValue)
    );
  });

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalItems = filteredItems.length;

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // ==========================================
  // SUBMIT / CREATE / UPDATE
  // ==========================================

  const submit = async () => {
    try {
      setSaving(true);

      const payload = {
        date: form.date,
        category: form.category,
        amount: Number(form.amount),
        vendor: form.vendor,
        notes: form.notes,
      };

      // ======================================
      // UPDATE
      // ======================================

      if (editingId) {
        await api.put(`/expenses/${editingId}`, payload);

        alert("Expense updated successfully.");
      }

      // ======================================
      // CREATE
      // ======================================
      else {
        await api.post("/expenses", payload);

        alert("Expense saved successfully.");
      }

      // ======================================
      // RESET
      // ======================================

      setForm(createBlankForm());

      setEditingId(null);

      setErrors({});

      setSearch("");

      setCurrentPage(1);

      // ======================================
      // RELOAD
      // ======================================

      await load();

      // ======================================
      // GET NEXT EXPENSE NUMBER
      // ======================================

      await loadNextExpenseNumber();
    } catch (err) {
      console.error(
        editingId ? "Failed to update expense:" : "Failed to save expense:",
        err,
      );

      alert(
        err?.response?.data?.message ||
          (editingId ? "Failed to update expense" : "Failed to save expense"),
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (item) => {
    // Extra frontend protection
    if (!canEdit) {
      return;
    }

    setEditingId(item._id);

    setExpenseNumber(item.expenseNumber || "");

    setForm({
      date: item.date
        ? new Date(item.date).toISOString().split("T")[0]
        : today(),

      category: item.category || "",

      amount:
        item.amount !== undefined && item.amount !== null
          ? String(item.amount)
          : "",

      vendor: item.vendor || "",

      notes: item.notes || "",
    });

    setErrors({});

    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancelEdit = () => {
    setEditingId(null);

    setForm(createBlankForm());

    setErrors({});

    loadNextExpenseNumber();
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    // Extra frontend protection
    if (!canEdit) {
      return;
    }

    try {
      await api.delete(`/expenses/${id}`);

      await load();

      await loadNextExpenseNumber();

      const remainingItems = items.length - 1;

      const newTotalPages = Math.ceil(remainingItems / itemsPerPage);

      if (newTotalPages > 0 && currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error("Failed to delete expense:", err);

      alert(err?.response?.data?.message || "Failed to delete expense");
    }
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ==========================================
  // SEARCH CHANGE
  // ==========================================

  const handleSearchChange = (value) => {
    setSearch(value);

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
  // ITEMS PER PAGE
  // ==========================================

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);

    setCurrentPage(1);
  };

  return (
    <div className="content">
      {/* ======================================
          ADMIN EXPENSE FORM
      ====================================== */}

      {canEdit && (
        <ExpenseForm
          form={form}
          expenseNumber={editingId ? expenseNumber : expenseNumber}
          errors={errors}
          saving={saving}
          editingId={editingId}
          onChange={handleChange}
          onSubmit={submit}
          onCancel={handleCancelEdit}
        />
      )}

      {/* ======================================
          EXPENSE TABLE
      ====================================== */}

      <ExpenseTable
        items={items}
        filteredItems={filteredItems}
        paginatedItems={paginatedItems}
        month={month}
        search={search}
        canEdit={canEdit}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onMonthChange={(value) => setMonth(value)}
        onSearchChange={handleSearchChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}

export default Expenses;
