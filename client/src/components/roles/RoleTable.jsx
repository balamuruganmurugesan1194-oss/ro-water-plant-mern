import React from "react";
import { Search, Pencil } from "lucide-react";

import Table from "../common/Table";
import DeleteButton from "../common/DeleteButton";
import Pagination from "../common/Pagination";

function RoleTable({
  roles,
  filteredRoles,
  paginatedRoles,
  search,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onSearchChange,
  onEdit,
  onDelete,
  onPageChange,
  onItemsPerPageChange,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Roles & Permissions</h3>

        <div className="filters">
          <div className="search-box">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search roles..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>
      </div>

      {roles.length === 0 ? (
        <div className="empty-state">No roles found.</div>
      ) : filteredRoles.length === 0 ? (
        <div className="empty-state">No matching roles found.</div>
      ) : (
        <>
          <Table
            headers={[
              "Role",
              "Description",
              "Permissions",
              "Type",
              "Status",
              "Actions",
            ]}
            rows={paginatedRoles.map((role) => (
              <tr key={role._id}>
                <td>
                  <strong>{role.name}</strong>
                </td>

                <td>{role.description || "—"}</td>

                <td>{role.permissions?.length || 0}</td>

                <td>{role.isSystemRole ? "System" : "Custom"}</td>

                <td>{role.isActive ? "Active" : "Inactive"}</td>

                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="icon-button edit-button"
                      title="Edit Role"
                      onClick={() => onEdit(role)}
                    >
                      <Pencil size={16} />
                    </button>

                    {!role.isSystemRole && (
                      <DeleteButton
                        onDelete={() => onDelete(role._id)}
                        itemName={role.name}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </>
      )}
    </section>
  );
}

export default RoleTable;
