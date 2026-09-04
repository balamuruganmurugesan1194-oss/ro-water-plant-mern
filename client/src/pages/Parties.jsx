import React, { useEffect, useState } from "react";

import api from "../api/client";

import { useAuth } from "../context/AuthContext";

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
  // AUTH
  // ==========================================

  const { user } = useAuth();

  const role = user?.role?.toLowerCase();

  const canAdd = role === "admin" || role === "manager";

  const canEdit = role === "admin" || role === "manager";

  const canDelete = role === "admin";

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
  // EDITING
  // ==========================================

  const [editing, setEditing] = useState(false);

  const [editingId, setEditingId] = useState(null);

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

    setEditing(false);
    setEditingId(null);
    setForm(initialForm);
    setErrors({});

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
    setEditing(false);
    setEditingId(null);
  };

  // ==========================================
  // EDIT PARTY
  // ==========================================

  const handleEdit = (party) => {
    if (!canEdit) {
      alert("You are not authorized to edit parties.");

      return;
    }

    setEditing(true);
    setEditingId(party._id);

    setForm({
      code: party.code || "",
      name: party.name || "",
      contactNumber: party.contactNumber || "",
      address: party.address || "",
    });

    setErrors({});

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // SUBMIT
  // ADD / UPDATE
  // ==========================================

  const submit = async () => {
    try {
      setSaving(true);

      // ========================================
      // UPDATE
      // ========================================

      if (editing) {
        if (!canEdit) {
          throw new Error("You are not authorized to edit parties.");
        }

        await api.put(`/parties/${editingId}`, {
          name: form.name.trim(),

          contactNumber: form.contactNumber.trim(),

          address: form.address.trim(),
        });

        alert("Party updated successfully");

        resetForm();

        setSearch("");
        setCurrentPage(1);

        await load();

        return;
      }

      // ========================================
      // CREATE
      // ========================================

      if (!canAdd) {
        throw new Error("You are not authorized to add parties.");
      }

      await api.post("/parties", {
        code: form.code.trim(),

        name: form.name.trim(),

        contactNumber: form.contactNumber.trim(),

        address: form.address.trim(),

        type,
      });

      // Reset form

      resetForm();

      setSearch("");
      setCurrentPage(1);

      // Reload

      await load();
    } catch (err) {
      console.error("Failed to save party:", err);

      alert(
        err?.response?.data?.message || err.message || "Failed to save party",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    if (!canDelete) {
      alert("You are not authorized to delete parties.");

      return;
    }

    try {
      await api.delete(`/parties/${id}`);

      await load();

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
    if (editing) {
      resetForm();
    }

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

      {canAdd || editing ? (
        <PartyForm
          type={type}
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          saving={saving}
          onSubmit={submit}
          onTypeChange={handleTypeChange}
          editing={editing}
          onCancelEdit={resetForm}
        />
      ) : null}

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
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canEdit}
        canDelete={canDelete}
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
