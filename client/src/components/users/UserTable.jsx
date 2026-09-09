import React from "react";

import {
  Search,
  Pencil,
} from "lucide-react";

import Table from "../common/Table";
import Pagination from "../common/Pagination";
import DeleteButton from "../common/DeleteButton";
import ExportButtons from "../common/ExportButtons";

import UserStatusToggle from "./UserStatusToggle";

const userExportColumns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "role",
    label: "Role",
  },
  {
    key: "isActive",
    label: "Status",
  },
  {
    key: "createdAt",
    label: "Created Date",
    type: "date",
  },
];

function UserTable({
  items,
  filteredItems,
  paginatedItems,
  search,
  canEdit,
  canDelete,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onSearchChange,
  onEdit,
  onDelete,
  onStatusChange,
  onPageChange,
  onItemsPerPageChange,
}) {
  const canShowActions =
    canEdit || canDelete;

  const getRoleLabel = (role) => {
    if (!role) {
      return "—";
    }

    if (typeof role === "object") {
      return role.name || "—";
    }

    if (typeof role === "string") {
      if (role === "power_user") {
        return "Power User";
      }

      return (
        role.charAt(0).toUpperCase() +
        role.slice(1)
      );
    }

    return "—";
  };

  return (
    <section className="panel">
      {/* HEADER */}

      <div className="panel-head">
        <h3>User Register</h3>

        <div className="filters">
          {/* SEARCH */}

          <div className="search-box">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search name, email, role..."
              value={search}
              onChange={(e) =>
                onSearchChange(
                  e.target.value
                )
              }
            />
          </div>

          {/* EXPORT */}

          <ExportButtons
            data={items}
            columns={userExportColumns}
            title="User Register"
            fileName="User_Register"
            sheetName="Users"
            filters={{
              Search:
                search || "All",
            }}
          />
        </div>
      </div>

      {/* EMPTY */}

      {items.length === 0 ? (
        <div className="empty-state">
          No users found.
        </div>
      ) : filteredItems.length ===
        0 ? (
        <div className="empty-state">
          No matching users found.
        </div>
      ) : (
        <>
          <Table
            headers={[
              "Name",
              "Email",
              "Role",
              "Status",
              ...(canShowActions
                ? ["Actions"]
                : []),
            ]}
            rows={paginatedItems.map(
              (item) => (
                <tr key={item._id}>
                  {/* NAME */}

                  <td>
                    {item.name || "—"}

                    {item.isDefault ===
                      true && (
                      <span
                        style={{
                          marginLeft:
                            "8px",
                          fontSize:
                            "11px",
                          padding:
                            "3px 7px",
                          borderRadius:
                            "10px",
                          background:
                            "#e0f2fe",
                          color:
                            "#0369a1",
                          fontWeight:
                            600,
                        }}
                      >
                        Default
                      </span>
                    )}
                  </td>

                  {/* EMAIL */}

                  <td>
                    {item.email || "—"}
                  </td>

                  {/* ROLE */}

                  <td>
                    {getRoleLabel(
                      item.role
                    )}
                  </td>

                  {/* STATUS */}

                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "8px",
                      }}
                    >
                      <UserStatusToggle
                        isActive={
                          item.isActive !==
                          false
                        }
                        onChange={() =>
                          onStatusChange(
                            item
                          )
                        }
                        disabled={
                          !canEdit ||
                          item.isDefault ===
                            true
                        }
                      />

                    </div>
                  </td>

                  {/* ACTIONS */}

                  {canShowActions && (
                    <td>
                      <div className="table-actions">
                        {/* EDIT */}

                        {canEdit && (
                          <button
                            type="button"
                            className="icon-button edit-button"
                            title="Edit User"
                            onClick={() =>
                              onEdit(item)
                            }
                          >
                            <Pencil
                              size={16}
                            />
                          </button>
                        )}

                        {/* DELETE */}

                        {canDelete &&
                          item.isDefault !==
                            true && (
                            <DeleteButton
                              onDelete={() =>
                                onDelete(
                                  item._id
                                )
                              }
                              itemName={
                                item.name ||
                                "User"
                              }
                            />
                          )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            )}
          />

          <Pagination
            currentPage={
              currentPage
            }
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={
              itemsPerPage
            }
            onPageChange={
              onPageChange
            }
            onItemsPerPageChange={
              onItemsPerPageChange
            }
          />
        </>
      )}
    </section>
  );
}

export default UserTable;