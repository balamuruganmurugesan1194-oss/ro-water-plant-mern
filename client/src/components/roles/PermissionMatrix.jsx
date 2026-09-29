import React from "react";

const CRUD_COLUMNS = [
  {
    action: "create",
    label: "Create",
  },
  {
    action: "view",
    label: "Read",
  },
  {
    action: "edit",
    label: "Update",
  },
  {
    action: "delete",
    label: "Delete",
  },
];

function PermissionMatrix({
  permissions = [],
  selectedPermissions = [],
  onChange,
}) {
  /*
   * =========================================================
   * GROUP PERMISSIONS BY MODULE
   * =========================================================
   */

  const grouped = permissions.reduce(
    (result, permission) => {
      const module = permission.module;

      if (!result[module]) {
        result[module] = [];
      }

      result[module].push(permission);

      return result;
    },
    {},
  );

  /*
   * =========================================================
   * FIND CRUD PERMISSION
   * =========================================================
   */

  const getPermission = (
    modulePermissions,
    action,
  ) => {
    return modulePermissions.find(
      (permission) =>
        permission.key.endsWith(`.${action}`),
    );
  };

  /*
   * =========================================================
   * GET PERMISSION IDS
   * =========================================================
   */

  const getPermissionIds = (
    modulePermissions,
  ) => {
    return modulePermissions
      .map((permission) => permission._id)
      .filter(Boolean);
  };

  /*
   * =========================================================
   * TOGGLE INDIVIDUAL PERMISSION
   * =========================================================
   */

  const togglePermission = (permissionId) => {
    if (!permissionId) {
      return;
    }

    if (
      selectedPermissions.includes(
        permissionId,
      )
    ) {
      onChange(
        selectedPermissions.filter(
          (id) => id !== permissionId,
        ),
      );
    } else {
      onChange([
        ...selectedPermissions,
        permissionId,
      ]);
    }
  };

  /*
   * =========================================================
   * CHECK COMPLETE ROW
   * =========================================================
   */

  const isRowSelected = (
    modulePermissions,
  ) => {
    const ids =
      getPermissionIds(modulePermissions);

    return (
      ids.length > 0 &&
      ids.every((id) =>
        selectedPermissions.includes(id),
      )
    );
  };

  /*
   * =========================================================
   * CHECK PARTIAL ROW
   * =========================================================
   */

  const isRowPartial = (
    modulePermissions,
  ) => {
    const ids =
      getPermissionIds(modulePermissions);

    const selectedCount = ids.filter((id) =>
      selectedPermissions.includes(id),
    ).length;

    return (
      selectedCount > 0 &&
      selectedCount < ids.length
    );
  };

  /*
   * =========================================================
   * TOGGLE COMPLETE ROW
   * =========================================================
   */

  const toggleRow = (
    modulePermissions,
  ) => {
    const ids =
      getPermissionIds(modulePermissions);

    const rowSelected =
      isRowSelected(modulePermissions);

    if (rowSelected) {
      onChange(
        selectedPermissions.filter(
          (id) => !ids.includes(id),
        ),
      );
    } else {
      onChange([
        ...new Set([
          ...selectedPermissions,
          ...ids,
        ]),
      ]);
    }
  };

  /*
   * =========================================================
   * ALL PERMISSION IDS
   * =========================================================
   */

  const allPermissionIds = permissions
    .map((permission) => permission._id)
    .filter(Boolean);

  /*
   * =========================================================
   * CHECK ALL SELECTED
   * =========================================================
   */

  const allSelected =
    allPermissionIds.length > 0 &&
    allPermissionIds.every((id) =>
      selectedPermissions.includes(id),
    );

  /*
   * =========================================================
   * CHECK SOME SELECTED
   * =========================================================
   */

  const someSelected =
    allPermissionIds.some((id) =>
      selectedPermissions.includes(id),
    );

  /*
   * =========================================================
   * TOGGLE ALL
   * =========================================================
   */

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(allPermissionIds);
    }
  };

  /*
   * =========================================================
   * NO PERMISSIONS
   * =========================================================
   */

  if (!permissions.length) {
    return (
      <div className="permission-matrix">
        <div className="permission-matrix-head">
          <h4>Permissions</h4>
        </div>

        <div className="empty-state">
          No permissions available.
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <div className="permission-matrix">
      {/* HEADER */}

      <div className="permission-matrix-head">
        <h4>Permissions</h4>

        <label className="permission-select-all">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(element) => {
              if (element) {
                element.indeterminate =
                  someSelected &&
                  !allSelected;
              }
            }}
            onChange={toggleAll}
          />

          <span>Select All</span>
        </label>
      </div>

      {/* TABLE */}

      <div className="permission-table-wrapper">
        <table className="permission-table">
          <thead>
            <tr>
              <th className="permission-module-column">
                Module
              </th>

              <th className="permission-select-column">
                Select
              </th>

              {CRUD_COLUMNS.map(
                (column) => (
                  <th
                    key={column.action}
                    className="permission-action-column"
                  >
                    {column.label}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {Object.entries(grouped).map(
              ([
                module,
                modulePermissions,
              ]) => {
                const rowSelected =
                  isRowSelected(
                    modulePermissions,
                  );

                const rowPartial =
                  isRowPartial(
                    modulePermissions,
                  );

                return (
                  <tr key={module}>
                    {/* MODULE */}

                    <td className="permission-module">
                      <strong>
                        {module}
                      </strong>
                    </td>

                    {/* ROW SELECT */}

                    <td className="permission-checkbox-cell">
                      <input
                        type="checkbox"
                        checked={
                          rowSelected
                        }
                        ref={(element) => {
                          if (element) {
                            element.indeterminate =
                              rowPartial;
                          }
                        }}
                        onChange={() =>
                          toggleRow(
                            modulePermissions,
                          )
                        }
                        title={`Select all ${module} permissions`}
                      />
                    </td>

                    {/* CRUD */}

                    {CRUD_COLUMNS.map(
                      (column) => {
                        const permission =
                          getPermission(
                            modulePermissions,
                            column.action,
                          );

                        return (
                          <td
                            key={
                              column.action
                            }
                            className="permission-checkbox-cell"
                          >
                            {permission ? (
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(
                                  permission._id,
                                )}
                                onChange={() =>
                                  togglePermission(
                                    permission._id,
                                  )
                                }
                                title={`${module} - ${column.label}`}
                              />
                            ) : (
                              <span className="permission-not-available">
                                —
                              </span>
                            )}
                          </td>
                        );
                      },
                    )}
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PermissionMatrix;