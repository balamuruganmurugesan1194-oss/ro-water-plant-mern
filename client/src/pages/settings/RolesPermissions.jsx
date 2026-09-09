import React, {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import RoleForm from "../../components/roles/RoleForm";
import RoleTable from "../../components/roles/RoleTable";

import {
  fetchRoles,
  fetchPermissions,
  createRole,
  updateRole,
  deleteRole,
} from "../../features/roles/roleSlice";

const createBlankForm = () => ({
  name: "",
  description: "",
  permissions: [],
});

function RolesPermissions() {
  const dispatch = useDispatch();

  const {
    roles,
    permissions,
    loading,
  } = useSelector(
    (state) => state.roles,
  );

  const [form, setForm] = useState(
    createBlankForm,
  );

  const [editingId, setEditingId] =
    useState(null);

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

  /*
   * =========================================================
   * PERMISSION PANEL OPEN / CLOSE
   * =========================================================
   */

  const [showPermissions, setShowPermissions] =
    useState(false);

  /*
   * =========================================================
   * LOAD
   * =========================================================
   */

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchPermissions());
  }, [dispatch]);

  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const filteredRoles = roles.filter(
    (role) => {
      const value = search
        .toLowerCase()
        .trim();

      if (!value) {
        return true;
      }

      return (
        role.name
          ?.toLowerCase()
          .includes(value) ||
        role.description
          ?.toLowerCase()
          .includes(value)
      );
    },
  );

  /*
   * =========================================================
   * PAGINATION
   * =========================================================
   */

  const totalItems =
    filteredRoles.length;

  const totalPages = Math.ceil(
    totalItems / itemsPerPage,
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const paginatedRoles =
    filteredRoles.slice(
      startIndex,
      startIndex + itemsPerPage,
    );

  /*
   * =========================================================
   * CHANGE
   * =========================================================
   */

  const handleChange = (
    name,
    value,
  ) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    /*
     * Remove permission validation error
     * immediately after selecting permission.
     */

    if (
      name === "permissions" &&
      value &&
      value.length > 0
    ) {
      setErrors((previous) => ({
        ...previous,
        permissions: "",
      }));
    }
  };

  /*
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const handleSubmit = async () => {
    const nextErrors = {};

    /*
     * ROLE NAME VALIDATION
     */

    if (!form.name.trim()) {
      nextErrors.name =
        "Role name is required";
    }

    /*
     * PERMISSION VALIDATION
     */

    if (
      !form.permissions ||
      form.permissions.length === 0
    ) {
      nextErrors.permissions =
        "Select at least one permission";

      /*
       * IMPORTANT:
       * Automatically open permission
       * matrix when validation fails.
       */

      setShowPermissions(true);
    }

    /*
     * STOP SUBMIT
     */

    if (
      Object.keys(nextErrors).length
    ) {
      setErrors(nextErrors);

      return;
    }

    /*
     * =======================================================
     * SAVE
     * =======================================================
     */

    try {
      setSaving(true);

      /*
       * UPDATE
       */

      if (editingId) {
        await dispatch(
          updateRole({
            id: editingId,
            data: form,
          }),
        ).unwrap();

        alert(
          "Role updated successfully.",
        );
      } else {
        /*
         * CREATE
         */

        await dispatch(
          createRole(form),
        ).unwrap();

        alert(
          "Role created successfully.",
        );
      }

      /*
       * RESET
       */

      resetForm();

      /*
       * REFRESH ROLES
       */

      dispatch(fetchRoles());
    } catch (error) {
      alert(
        error || "Failed to save role",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =========================================================
   * EDIT
   * =========================================================
   */

  const handleEdit = (role) => {
    setEditingId(role._id);

    setForm({
      name: role.name || "",
      description:
        role.description || "",
      permissions:
        role.permissions?.map(
          (permission) =>
            permission._id,
        ) || [],
    });

    setErrors({});

    /*
     * Keep permission section closed
     * when opening edit form.
     */

    setShowPermissions(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * =========================================================
   * RESET
   * =========================================================
   */

  const resetForm = () => {
    setEditingId(null);

    setForm(createBlankForm());

    setErrors({});

    /*
     * Close permission matrix
     */

    setShowPermissions(false);
  };

  /*
   * =========================================================
   * CANCEL
   * =========================================================
   */

  const handleCancel = () => {
    resetForm();
  };

  /*
   * =========================================================
   * DELETE
   * =========================================================
   */

  const handleDelete = async (
    id,
  ) => {
    try {
      await dispatch(
        deleteRole(id),
      ).unwrap();

      alert(
        "Role deleted successfully.",
      );

      if (
        paginatedRoles.length === 1 &&
        currentPage > 1
      ) {
        setCurrentPage(
          currentPage - 1,
        );
      }
    } catch (error) {
      alert(
        error || "Failed to delete role",
      );
    }
  };

  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const handleSearch = (
    value,
  ) => {
    setSearch(value);

    setCurrentPage(1);
  };

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  const handlePageChange = (
    page,
  ) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * =========================================================
   * ITEMS PER PAGE
   * =========================================================
   */

  const handleItemsPerPageChange =
    (value) => {
      setItemsPerPage(value);

      setCurrentPage(1);
    };

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <div className="content">
      <RoleForm
        form={form}
        errors={errors}
        saving={saving || loading}
        editingId={editingId}
        permissions={permissions}

        /*
         * Permission arrow state
         */

        showPermissions={
          showPermissions
        }

        setShowPermissions={
          setShowPermissions
        }

        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      <RoleTable
        roles={roles}
        filteredRoles={filteredRoles}
        paginatedRoles={
          paginatedRoles
        }
        search={search}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onSearchChange={
          handleSearch
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
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

export default RolesPermissions;