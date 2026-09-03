import React, { useEffect, useState } from "react";

import api from "../api/client";

import PartyForm from "../components/parties/PartyForm";
import PartyTable from "../components/parties/PartyTable";

// ==========================================
// INITIAL FORM
// ==========================================

const initialForm = {
  code: "",
  name: "",
  contactNumber: "",
  address: "",
};

// ==========================================
// PARTIES
// ==========================================

function Parties() {
  // ==========================================
  // STATE
  // ==========================================

  const [type, setType] = useState("customer");

  const [items, setItems] = useState([]);

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");

  const [form, setForm] = useState(initialForm);

  // ==========================================
  // PAGINATION
  // ==========================================

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ==========================================
  // LOAD PARTIES
  // ==========================================

  const load = async () => {
    try {
      const response = await api.get(`/parties?type=${type}`);

      setItems(response.data || []);
    } catch (err) {
      console.error("Failed to load parties:", err);

      setItems([]);
    }
  };

  // ==========================================
  // LOAD WHEN TYPE CHANGES
  // ==========================================

  useEffect(() => {
    setCurrentPage(1);

    setSearch("");

    load();
  }, [type]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredItems = items.filter((item) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return (
      item.code?.toLowerCase().includes(searchValue) ||
      item.name?.toLowerCase().includes(searchValue) ||
      item.contactNumber?.includes(searchValue) ||
      item.address?.toLowerCase().includes(searchValue)
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
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setForm(initialForm);

    setErrors({});
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const submit = async () => {
    try {
      setSaving(true);

      await api.post("/parties", {
        code: form.code.trim(),

        name: form.name.trim(),

        contactNumber: form.contactNumber.trim(),

        address: form.address.trim(),

        type,
      });

      // Reset form
      resetForm();

      // Reset search
      setSearch("");

      // First page
      setCurrentPage(1);

      // Reload
      await load();
    } catch (err) {
      console.error("Failed to save party:", err);

      alert(err?.response?.data?.message || "Failed to save party");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    try {
      await api.delete(`/parties/${id}`);

      await load();

      // Calculate page after deletion
      const remainingItems = items.length - 1;

      const newTotalPages = Math.ceil(remainingItems / itemsPerPage);

      if (newTotalPages > 0 && currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error("Failed to delete party:", err);

      alert(err?.response?.data?.message || "Failed to delete party");
    }
  };

  // ==========================================
  // TYPE CHANGE
  // ==========================================

  const handleTypeChange = (newType) => {
    setType(newType);

    setSearch("");

    setErrors({});

    setForm(initialForm);

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

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="content">
      {/* ========================================
          PARTY FORM
      ======================================== */}

      <PartyForm
        type={type}
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
        saving={saving}
        onSubmit={submit}
        onTypeChange={handleTypeChange}
      />

      {/* ========================================
          PARTY TABLE
      ======================================== */}

      <PartyTable
        type={type}
        items={items}
        filteredItems={filteredItems}
        paginatedItems={paginatedItems}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        onDelete={handleDelete}
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

export default Parties;
