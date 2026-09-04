import React from "react";
import { Search, Pencil } from "lucide-react";

import Table from "../common/Table";
import DeleteButton from "../common/DeleteButton";
import Pagination from "../common/Pagination";
import ExportButtons from "../common/ExportButtons";

// ==========================================
// PARTY TABLE
// ==========================================

function PartyTable({
  type,
  items,
  filteredItems,
  paginatedItems,
  search,
  onSearchChange,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) {
  // ==========================================
  // EXPORT COLUMNS
  // ==========================================

  const partyExportColumns = [
    {
      key: "code",
      label: "Code",
    },

    {
      key: "name",
      label: "Party Name",
    },

    {
      key: "type",
      label: "Type",
      value: (row) =>
        row.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1) : "",
    },

    {
      key: "contactNumber",
      label: "Contact No",
    },

    {
      key: "address",
      label: "Area",
    },
  ];

  // ==========================================
  // LABELS
  // ==========================================

  const typeLabel = type === "customer" ? "customer" : "supplier";

  const registerTitle =
    type === "customer" ? "Customer Register" : "Supplier Register";

  const fileName =
    type === "customer" ? "Customer_Register" : "Supplier_Register";

  const sheetName = type === "customer" ? "Customers" : "Suppliers";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="panel">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="panel-head">
        <h3>{type === "customer" ? "Customers" : "Suppliers"}</h3>

        <div className="filters">
          {/* SEARCH */}

          <div className="search-box">
            <Search size={17} />

            <input
              type="search"
              placeholder={`Search ${typeLabel}...`}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* EXPORT */}

          <ExportButtons
            data={items}
            columns={partyExportColumns}
            title={registerTitle}
            fileName={fileName}
            sheetName={sheetName}
          />
        </div>
      </div>

      {/* ======================================
          EMPTY STATES
      ====================================== */}

      {items.length === 0 ? (
        <div className="empty-state">
          No {type === "customer" ? "customers" : "suppliers"} found.
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          No matching {type === "customer" ? "customers" : "suppliers"} found.
        </div>
      ) : (
        <>
          {/* ==================================
              TABLE
          ================================== */}

          <Table
            headers={["Code", "Name", "Contact No", "Area", ...(canEdit || canDelete ? ["Actions"] : [])]}
            rows={paginatedItems.map((party) => (
              <tr key={party._id}>
                {/* CODE */}

                <td>{party.code}</td>

                {/* NAME */}

                <td>{party.name}</td>

                {/* CONTACT */}

                <td>{party.contactNumber}</td>

                {/* AREA */}

                <td>{party.address || "-"}</td>

                {/* ACTIONS */}

                <td>
                  <div className="table-actions">
                    {/* EDIT */}

                    {canEdit && (
                      <button
                        type="button"
                        className="icon-button edit-button"
                        title="Edit"
                        onClick={() => onEdit(party)}
                      >
                        <Pencil size={16} />
                      </button>
                    )}

                    {/* DELETE */}

                    {canDelete && (
                      <DeleteButton
                        onDelete={() => onDelete(party._id)}
                        itemName={party.name}
                      />
                    )}

                  </div>
                </td>
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

export default PartyTable;
