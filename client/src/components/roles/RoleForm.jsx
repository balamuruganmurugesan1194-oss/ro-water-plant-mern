import React from "react";
import { Plus, Save, X } from "lucide-react";

import PermissionMatrix from "./PermissionMatrix";

function RoleForm({
  form,
  errors,
  saving,
  editingId,
  permissions,
  onChange,
  onSubmit,
  onCancel,
}) {
  const isEditing = Boolean(editingId);

  return (
    <section className="panel">
      <h3>{isEditing ? `Edit Role - ${form.name}` : "New Role"}</h3>

      <form
        className="form-grid role-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {/* =================================================
            ROLE NAME + DESCRIPTION
            SAME ROW
        ================================================= */}

        <div className="role-basic-fields">
          {/* ROLE NAME */}

          <label>
            Role Name
            <input
              type="text"
              value={form.name || ""}
              className={errors.name ? "input-error" : ""}
              placeholder="Enter role name"
              onChange={(event) => onChange("name", event.target.value)}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </label>

          {/* DESCRIPTION */}

          <label>
            Description
            <input
              type="text"
              value={form.description || ""}
              placeholder="Enter role description"
              onChange={(event) => onChange("description", event.target.value)}
            />
          </label>
        </div>

        {/* =================================================
            PERMISSIONS
            BELOW BASIC FORM
        ================================================= */}

        <div className="role-permissions-field">
          <PermissionMatrix
            permissions={permissions}
            selectedPermissions={form.permissions || []}
            onChange={(value) => onChange("permissions", value)}
          />

          {errors.permissions && (
            <span className="error-text">{errors.permissions}</span>
          )}
        </div>

        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="form-submit">
          {isEditing ? (
            <>
              <button className="primary" type="submit" disabled={saving}>
                <Save size={18} />

                {saving ? "Updating..." : "Update Role"}
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
            <button className="primary" type="submit" disabled={saving}>
              <Plus size={18} />

              {saving ? "Saving..." : "Save Role"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default RoleForm;
