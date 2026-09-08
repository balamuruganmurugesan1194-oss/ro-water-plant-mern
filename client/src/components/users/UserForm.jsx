import React from "react";
import { Plus, Save, X } from "lucide-react";

import SearchableSelect from "../common/SearchableSelect";

function UserForm({
  form,
  errors,
  saving,
  editingId,
  roles = [],
  canCreate = false,
  canEdit = false,
  onChange,
  onSubmit,
  onCancel,
}) {
  const isEditing = Boolean(editingId);

  const canSubmit = isEditing
    ? canEdit
    : canCreate;

  const roleOptions = roles.map((role) => ({
    value: role._id,
    label: role.name,
  }));

  return (
    <section className="panel">
      <h3>
        {isEditing
          ? `Edit User - ${form.name}`
          : "New User"}
      </h3>

      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();

          if (!canSubmit) {
            alert(
              isEditing
                ? "You do not have permission to edit users."
                : "You do not have permission to create users."
            );

            return;
          }

          onSubmit();
        }}
      >
        {/* NAME */}

        <label>
          Name

          <input
            type="text"
            value={form.name || ""}
            className={
              errors.name
                ? "input-error"
                : ""
            }
            placeholder="Enter user name"
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

        {/* EMAIL */}

        <label>
          Email

          <input
            type="email"
            value={form.email || ""}
            className={
              errors.email
                ? "input-error"
                : ""
            }
            placeholder="Enter email address"
            onChange={(event) =>
              onChange(
                "email",
                event.target.value
              )
            }
          />

          {errors.email && (
            <span className="error-text">
              {errors.email}
            </span>
          )}
        </label>

        {/* PASSWORD */}

        <label>
          Password

          <input
            type="password"
            value={form.password || ""}
            className={
              errors.password
                ? "input-error"
                : ""
            }
            placeholder={
              isEditing
                ? "Leave blank to keep current password"
                : "Enter password"
            }
            onChange={(event) =>
              onChange(
                "password",
                event.target.value
              )
            }
          />

          {errors.password && (
            <span className="error-text">
              {errors.password}
            </span>
          )}
        </label>

        {/* ROLE */}

        <label>
          Role

          <SearchableSelect
            options={roleOptions}
            value={form.role || ""}
            onChange={(value) =>
              onChange("role", value)
            }
            placeholder="Search role..."
          />

          {errors.role && (
            <span className="error-text">
              {errors.role}
            </span>
          )}
        </label>

        {/* BUTTONS */}

        <div className="form-submit">
          {isEditing ? (
            <>
              {canEdit && (
                <button
                  className="primary"
                  type="submit"
                  disabled={saving}
                >
                  <Save size={18} />

                  {saving
                    ? "Updating..."
                    : "Update User"}
                </button>
              )}

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
            canCreate && (
              <button
                className="primary"
                type="submit"
                disabled={saving}
              >
                <Plus size={18} />

                {saving
                  ? "Saving..."
                  : "Save User"}
              </button>
            )
          )}
        </div>
      </form>
    </section>
  );
}

export default UserForm;