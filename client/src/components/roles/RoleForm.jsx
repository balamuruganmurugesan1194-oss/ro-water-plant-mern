import React from "react";
import {
  Plus,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import PermissionMatrix from "./PermissionMatrix";

function RoleForm({
  form,
  errors,
  saving,
  editingId,
  permissions,
  showPermissions,
  setShowPermissions,
  onChange,
  onSubmit,
  onCancel,
}) {
  const isEditing = Boolean(editingId);

  return (
    <section className="panel">
      <h3>
        {isEditing
          ? `Edit Role - ${form.name}`
          : "New Role"}
      </h3>

      <form
        className="form-grid role-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {/* =================================================
            ROLE NAME + DESCRIPTION
        ================================================= */}

        <div className="role-basic-fields">
          {/* ROLE NAME */}

          <label>
            Role Name

            <input
              type="text"
              value={form.name || ""}
              className={
                errors.name ? "input-error" : ""
              }
              placeholder="Enter role name"
              onChange={(event) =>
                onChange(
                  "name",
                  event.target.value
                )
              }
            />

            {errors.name && (
              <span className="error-text">
                {errors.name}
              </span>
            )}
          </label>

          {/* DESCRIPTION + ARROW */}

          <div className="description-with-arrow">
            <label>
              Description

              <input
                type="text"
                value={form.description || ""}
                placeholder="Enter role description"
                onChange={(event) =>
                  onChange(
                    "description",
                    event.target.value
                  )
                }
              />
            </label>

            {/* ONLY ARROW */}

            <button
              type="button"
              className="permission-arrow"
              onClick={() =>
                setShowPermissions(
                  (previous) => !previous
                )
              }
              aria-label={
                showPermissions
                  ? "Hide permissions"
                  : "Show permissions"
              }
              title={
                showPermissions
                  ? "Hide permissions"
                  : "Show permissions"
              }
            >
              {showPermissions ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>
        </div>

        {/* =================================================
            PERMISSION MATRIX
        ================================================= */}

        {showPermissions && (
          <div className="role-permissions-field">
            <PermissionMatrix
              permissions={permissions}
              selectedPermissions={
                form.permissions || []
              }
              onChange={(value) =>
                onChange(
                  "permissions",
                  value
                )
              }
            />

            {errors.permissions && (
              <span className="error-text">
                {errors.permissions}
              </span>
            )}
          </div>
        )}

        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="form-submit">
          {isEditing ? (
            <>
              <button
                className="primary"
                type="submit"
                disabled={saving}
              >
                <Save size={18} />

                {saving
                  ? "Updating..."
                  : "Update Role"}
              </button>

              <button
                type="button"
                className="secondary"
                onClick={onCancel}
                disabled={saving}
              >
                <X size={18} />

                Cancel
              </button>
            </>
          ) : (
            <button
              className="primary"
              type="submit"
              disabled={saving}
            >
              <Plus size={18} />

              {saving
                ? "Saving..."
                : "Save Role"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default RoleForm;