import React, {
  useEffect,
  useState,
} from "react";

import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

import UserForm from "../../components/users/UserForm";
import UserTable from "../../components/users/UserTable";

const createBlankForm = () => ({
  name: "",
  email: "",
  password: "",
  role: "",
});

function Users() {
  const {
    isSuperAdmin,
    permissions = [],
  } = useAuth();

  // ==========================================
  // PERMISSIONS
  // ==========================================

  const hasPermission = (
    permission
  ) => {
    if (isSuperAdmin === true) {
      return true;
    }

    if (permissions.includes("*")) {
      return true;
    }

    return permissions.includes(
      permission
    );
  };

  const canView =
    hasPermission("users.view");

  const canCreate =
    hasPermission("users.create");

  const canEdit =
    hasPermission("users.edit");

  const canDelete =
    hasPermission("users.delete");

  // ==========================================
  // STATE
  // ==========================================

  const [items, setItems] =
    useState([]);

  const [roles, setRoles] =
    useState([]);

  const [rolesLoading, setRolesLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [errors, setErrors] =
    useState({});

  const [currentPage, setCurrentPage] =
    useState(1);

  const [itemsPerPage, setItemsPerPage] =
    useState(10);

  const [form, setForm] =
    useState(createBlankForm);

  const [editingId, setEditingId] =
    useState(null);

  // ==========================================
  // LOAD USERS
  // ==========================================

  const load = async () => {
    if (!canView) {
      return;
    }

    try {
      const response =
        await api.get(
          "/settings/users"
        );

      setItems(
        Array.isArray(
          response.data
        )
          ? response.data
          : response.data?.users ||
              []
      );
    } catch (err) {
      console.error(
        "Failed to load users:",
        err
      );

      setItems([]);

      alert(
        err?.response?.data
          ?.message ||
          "Failed to load users"
      );
    }
  };

  // ==========================================
  // LOAD ACTIVE ROLES
  // ==========================================

  const loadRoles = async () => {
    if (!canCreate && !canEdit) {
      return;
    }

    try {
      setRolesLoading(true);

      const response =
        await api.get(
          "/settings/roles/active"
        );

      setRoles(
        Array.isArray(
          response.data
        )
          ? response.data
          : response.data?.roles ||
              []
      );
    } catch (err) {
      console.error(
        "Failed to load roles:",
        err
      );

      setRoles([]);

      alert(
        err?.response?.data
          ?.message ||
          "Failed to load roles"
      );
    } finally {
      setRolesLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (canView) {
      load();
    }

    if (canCreate || canEdit) {
      loadRoles();
    }
  }, [
    canView,
    canCreate,
    canEdit,
  ]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredItems =
    items.filter((item) => {
      const searchValue =
        search
          .toLowerCase()
          .trim();

      if (!searchValue) {
        return true;
      }

      const name =
        item.name?.toLowerCase() ||
        "";

      const email =
        item.email?.toLowerCase() ||
        "";

      const userRole =
        typeof item.role ===
        "string"
          ? item.role.toLowerCase()
          : item.role?.name?.toLowerCase() ||
            "";

      return (
        name.includes(
          searchValue
        ) ||
        email.includes(
          searchValue
        ) ||
        userRole.includes(
          searchValue
        )
      );
    });

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalItems =
    filteredItems.length;

  const totalPages = Math.ceil(
    totalItems / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const endIndex =
    startIndex +
    itemsPerPage;

  const paginatedItems =
    filteredItems.slice(
      startIndex,
      endIndex
    );

  // ==========================================
  // SUBMIT USER
  // ==========================================

  const submit = async () => {
    if (editingId && !canEdit) {
      alert(
        "You do not have permission to edit users."
      );

      return;
    }

    if (!editingId && !canCreate) {
      alert(
        "You do not have permission to create users."
      );

      return;
    }

    const validationErrors =
      {};

    // ========================================
    // VALIDATION
    // ========================================

    if (!form.name.trim()) {
      validationErrors.name =
        "Name is required";
    }

    if (!form.email.trim()) {
      validationErrors.email =
        "Email is required";
    }

    if (
      !editingId &&
      !form.password.trim()
    ) {
      validationErrors.password =
        "Password is required";
    }

    if (
      form.password.trim() &&
      form.password.trim().length <
        6
    ) {
      validationErrors.password =
        "Password must be at least 6 characters";
    }

    if (!form.role) {
      validationErrors.role =
        "Role is required";
    }

    if (
      Object.keys(
        validationErrors
      ).length
    ) {
      setErrors(
        validationErrors
      );

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
          email:
            form.email.trim(),
          role: form.role,
        };

        /*
         * Password only when changed.
         *
         * IMPORTANT:
         * isActive is NOT sent here.
         */

        if (
          form.password.trim()
        ) {
          payload.password =
            form.password.trim();
        }

        const response =
          await api.put(
            `/settings/users/${editingId}`,
            payload
          );

        alert(
          response.data?.message ||
            "User updated successfully."
        );
      }

      // ======================================
      // CREATE
      // ======================================

      else {
        const payload = {
          name: form.name.trim(),
          email:
            form.email.trim(),
          password: form.password,
          role: form.role,

          // New users are always active
          isActive: true,
        };

        const response =
          await api.post(
            "/settings/users",
            payload
          );

        alert(
          response.data?.message ||
            "User saved successfully."
        );
      }

      // ======================================
      // RESET
      // ======================================

      setForm(
        createBlankForm()
      );

      setEditingId(null);

      setErrors({});

      setSearch("");

      setCurrentPage(1);

      // ======================================
      // RELOAD
      // ======================================

      await load();

      if (canCreate || canEdit) {
        await loadRoles();
      }
    } catch (err) {
      console.error(
        editingId
          ? "Failed to update user:"
          : "Failed to save user:",
        err
      );

      alert(
        err?.response?.data
          ?.message ||
          (editingId
            ? "Failed to update user"
            : "Failed to save user")
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (
    item
  ) => {
    if (!canEdit) {
      alert(
        "You do not have permission to edit users."
      );

      return;
    }

    setEditingId(item._id);

    const roleId =
      typeof item.role ===
      "string"
        ? item.role
        : item.role?._id || "";

    setForm({
      name: item.name || "",
      email: item.email || "",
      password: "",
      role: roleId,
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

  const handleCancelEdit =
    () => {
      setEditingId(null);

      setForm(
        createBlankForm()
      );

      setErrors({});
    };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (
    id
  ) => {
    if (!canDelete) {
      alert(
        "You do not have permission to delete users."
      );

      return;
    }

    try {
      await api.delete(
        `/settings/users/${id}`
      );

      alert(
        "User deleted successfully."
      );

      await load();

      const remainingItems =
        items.length - 1;

      const newTotalPages =
        Math.ceil(
          remainingItems /
            itemsPerPage
        );

      if (
        newTotalPages > 0 &&
        currentPage >
          newTotalPages
      ) {
        setCurrentPage(
          newTotalPages
        );
      }
    } catch (err) {
      console.error(
        "Failed to delete user:",
        err
      );

      alert(
        err?.response?.data
          ?.message ||
          "Failed to delete user"
      );
    }
  };

  // ==========================================
  // STATUS TOGGLE
  // ==========================================

  const handleStatusChange =
    async (item) => {
      if (!canEdit) {
        alert(
          "You do not have permission to change user status."
        );

        return;
      }

      // ======================================
      // DEFAULT USER PROTECTION
      // ======================================

      if (
        item.isDefault === true
      ) {
        alert(
          "Default user status cannot be changed."
        );

        return;
      }

      // ======================================
      // CURRENT STATUS
      // ======================================

      const currentStatus =
        item.isActive !== false;

      const newStatus =
        !currentStatus;

      // ======================================
      // OPTIMISTIC UPDATE
      // ======================================

      setItems((previous) =>
        previous.map((user) =>
          user._id === item._id
            ? {
                ...user,
                isActive:
                  newStatus,
              }
            : user
        )
      );

      try {
        // ====================================
        // SEPARATE STATUS API
        // ====================================

        const response =
          await api.patch(
            `/settings/users/${item._id}/status`,
            {
              isActive:
                newStatus,
            }
          );

        // ====================================
        // SERVER RESPONSE
        // ====================================

        if (
          response.data?.user
        ) {
          setItems(
            (previous) =>
              previous.map(
                (user) =>
                  user._id ===
                  response.data
                    .user._id
                    ? response.data
                        .user
                    : user
              )
          );
        }

        console.log(
          newStatus
            ? "User activated"
            : "User deactivated"
        );
      } catch (err) {
        console.error(
          "Failed to update user status:",
          err
        );

        // ====================================
        // ROLLBACK
        // ====================================

        setItems((previous) =>
          previous.map((user) =>
            user._id ===
            item._id
              ? {
                  ...user,
                  isActive:
                    item.isActive,
                }
              : user
          )
        );

        alert(
          err?.response?.data
            ?.message ||
            "Failed to update user status"
        );
      }
    };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (
    name,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ==========================================
  // SEARCH CHANGE
  // ==========================================

  const handleSearchChange =
    (value) => {
      setSearch(value);

      setCurrentPage(1);
    };

  // ==========================================
  // PAGE CHANGE
  // ==========================================

  const handlePageChange =
    (page) => {
      setCurrentPage(page);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
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
  // NO VIEW PERMISSION
  // ==========================================

  if (!canView) {
    return (
      <div className="content">
        <section className="panel">
          <div className="empty-state">
            You do not have permission
            to view users.
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="content">
      {/* USER FORM */}

      {(canCreate || canEdit) && (
        <UserForm
          form={form}
          errors={errors}
          saving={
            saving ||
            rolesLoading
          }
          editingId={editingId}
          roles={roles}
          canCreate={canCreate}
          canEdit={canEdit}
          onChange={
            handleChange
          }
          onSubmit={submit}
          onCancel={
            handleCancelEdit
          }
        />
      )}

      {/* USER TABLE */}

      <UserTable
        items={items}
        filteredItems={
          filteredItems
        }
        paginatedItems={
          paginatedItems
        }
        search={search}
        canEdit={canEdit}
        canDelete={canDelete}
        currentPage={
          currentPage
        }
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={
          itemsPerPage
        }
        onSearchChange={
          handleSearchChange
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={
          handleStatusChange
        }
        onPageChange={
          handlePageChange
        }
        onItemsPerPageChange={
          handleItemsPerPageChange
        }
      />
    </div>
  );
}

export default Users;