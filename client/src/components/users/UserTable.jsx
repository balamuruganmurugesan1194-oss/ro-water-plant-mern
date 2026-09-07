import React from "react";

import { Search, Pencil } from "lucide-react";

import Table from "../common/Table";
import Pagination from "../common/Pagination";
import DeleteButton from "../common/DeleteButton";
import ExportButtons from "../common/ExportButtons";

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
  // ==========================================
  // ROLE LABEL
  // ==========================================

  const getRoleLabel = (role) => {
    if (!role) {
      return "—";
    }

    // New dynamic Role object
    // Example:
    // {
    //   _id: "...",
    //   name: "Manager",
    //   description: "...",
    //   isActive: true
    // }
    if (typeof role === "object") {
      return role.name || "—";
    }

    // Backward compatibility for old string roles
    if (typeof role === "string") {
      if (role === "power_user") {
        return "Power User";
      }

      return role.charAt(0).toUpperCase() + role.slice(1);
    }

    return "—";
  };

  return (
    <section className="panel">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="panel-head">
        <h3>User Register</h3>

        <div className="filters">
          {/* ==================================
              SEARCH
          ================================== */}

          <div className="search-box">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search name, email, role..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* ==================================
              EXPORT
          ================================== */}

          <ExportButtons
            data={items}
            columns={userExportColumns}
            title="User Register"
            fileName="User_Register"
            sheetName="Users"
            filters={{
              Search: search || "All",
            }}
          />
        </div>
      </div>

      {/* ======================================
          EMPTY STATE
      ====================================== */}

      {items.length === 0 ? (
        <div className="empty-state">No users found.</div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">No matching users found.</div>
      ) : (
        <>
          {/* ==================================
              TABLE
          ================================== */}

          <Table
            headers={["Name", "Email", "Role", ...(canEdit ? ["Actions"] : [])]}
            rows={paginatedItems.map((item) => (
              <tr key={item._id}>
                {/* ==========================
                    NAME
                ========================== */}

                <td>{item.name || "—"}</td>

                {/* ==========================
                    EMAIL
                ========================== */}

                <td>{item.email || "—"}</td>

                {/* ==========================
                    ROLE NAME
                ========================== */}

                <td>{getRoleLabel(item.role)}</td>

                {/* ==========================
                    ACTIONS
                ========================== */}

                {canEdit && (
                  <td>
                    <div className="table-actions">
                      {/* EDIT */}

                      <button
                        type="button"
                        className="icon-button edit-button"
                        title="Edit User"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil size={16} />
                      </button>

                      {/* DELETE */}

                      <DeleteButton
                        onDelete={() => onDelete(item._id)}
                        itemName={item.name || "User"}
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          />

          {/* ==================================
              PAGINATION
          ================================== */}

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

export default UserTable;
