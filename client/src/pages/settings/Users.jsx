import React, { useEffect, useState } from "react";

import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

import UserForm from "../../components/users/UserForm";
import UserTable from "../../components/users/UserTable";

const createBlankForm = () => ({
  name: "",
  email: "",
  password: "",
  role: "",
  isActive: true,
});

function Users() {
  const { role } = useAuth();

  // ==========================================
  // ADMIN ONLY
  // ==========================================

  const currentRole =
    typeof role === "string"
      ? role.toLowerCase()
      : role?.name?.toLowerCase() || "";

  const canEdit = currentRole === "admin";

  // ==========================================
  // STATE
  // ==========================================

  const [items, setItems] = useState([]);

  const [roles, setRoles] = useState([]);

  const [rolesLoading, setRolesLoading] = useState(false);

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

  // ==========================================
  // LOAD USERS
  // ==========================================

  const load = async () => {
    try {
      const response = await api.get("/settings/users");

      setItems(response.data?.users || response.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);

      setItems([]);

      alert(err?.response?.data?.message || "Failed to load users");
    }
  };

  // ==========================================
  // LOAD ACTIVE ROLES
  // ==========================================

  const loadRoles = async () => {
    try {
      setRolesLoading(true);

      const response = await api.get("/settings/roles/active");

      setRoles(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to load roles:", err);

      setRoles([]);

      alert(err?.response?.data?.message || "Failed to load roles");
    } finally {
      setRolesLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (!canEdit) {
      return;
    }

    load();
    loadRoles();
  }, [canEdit]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredItems = items.filter((item) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    const name = item.name?.toLowerCase() || "";

    const email = item.email?.toLowerCase() || "";

    /*
     * User role can now be:
     *
     * {
     *   _id: "...",
     *   name: "Manager"
     * }
     *
     * OR a string for old users.
     */

    const userRole =
      typeof item.role === "string"
        ? item.role.toLowerCase()
        : item.role?.name?.toLowerCase() || "";

    return (
      name.includes(searchValue) ||
      email.includes(searchValue) ||
      userRole.includes(searchValue)
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
  // SUBMIT
  // ==========================================

  const submit = async () => {
    const validationErrors = {};

    // ========================================
    // VALIDATION
    // ========================================

    if (!form.name.trim()) {
      validationErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      validationErrors.email = "Email is required";
    }

    if (!editingId && !form.password.trim()) {
      validationErrors.password = "Password is required";
    }

    if (form.password.trim() && form.password.trim().length < 6) {
      validationErrors.password = "Password must be at least 6 characters";
    }

    if (!form.role) {
      validationErrors.role = "Role is required";
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);

      // ======================================
      // UPDATE
      // ======================================

      if (editingId) {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          isActive: form.isActive,
        };

        /*
         * Only update password
         * if entered.
         */

        if (form.password.trim()) {
          payload.password = form.password.trim();
        }

        await api.put(`/settings/users/${editingId}`, payload);

        alert("User updated successfully.");
      }

      // ======================================
      // CREATE
      // ======================================
      else {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          isActive: form.isActive,
        };

        await api.post("/settings/users", payload);

        alert("User saved successfully.");
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
      // RELOAD USERS
      // ======================================

      await load();

      /*
       * Reload roles too.
       *
       * This is useful if an admin has
       * recently activated/deactivated
       * a role.
       */

      await loadRoles();
    } catch (err) {
      console.error(
        editingId ? "Failed to update user:" : "Failed to save user:",
        err,
      );

      alert(
        err?.response?.data?.message ||
          (editingId ? "Failed to update user" : "Failed to save user"),
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (item) => {
    if (!canEdit) {
      return;
    }

    setEditingId(item._id);

    /*
     * IMPORTANT:
     *
     * User.role is now a Role ObjectId
     * and normally populated by backend.
     *
     * SearchableSelect needs:
     *
     * role: "ROLE_OBJECT_ID"
     */

    const roleId =
      typeof item.role === "string" ? item.role : item.role?._id || "";

    setForm({
      name: item.name || "",
      email: item.email || "",
      password: "",
      role: roleId,
      isActive: item.isActive !== false,
    });

    setErrors({});

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
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    if (!canEdit) {
      return;
    }

    try {
      await api.delete(`/settings/users/${id}`);

      await load();

      const remainingItems = items.length - 1;

      const newTotalPages = Math.ceil(remainingItems / itemsPerPage);

      if (newTotalPages > 0 && currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error("Failed to delete user:", err);

      alert(err?.response?.data?.message || "Failed to delete user");
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

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="content">
      {/* ======================================
          ADMIN USER FORM
      ====================================== */}

      {canEdit && (
        <UserForm
          form={form}
          errors={errors}
          saving={saving || rolesLoading}
          editingId={editingId}
          /*
           * Dynamic active roles
           */

          roles={roles}
          onChange={handleChange}
          onSubmit={submit}
          onCancel={handleCancelEdit}
        />
      )}

      {/* ======================================
          USER TABLE
      ====================================== */}

      <UserTable
        items={items}
        filteredItems={filteredItems}
        paginatedItems={paginatedItems}
        search={search}
        canEdit={canEdit}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onSearchChange={handleSearchChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
}

export default Users;
