import React from "react";
import { Search } from "lucide-react";

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
  onDelete,
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
  // TYPE LABEL
  // ==========================================

  const typeLabel = type === "customer" ? "customer" : "supplier";

  // ==========================================
  // REGISTER TITLE
  // ==========================================

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

        {/* ====================================
            FILTERS
        ==================================== */}

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
            headers={["Code", "Name", "Contact No", "Area", "Actions"]}
            rows={paginatedItems.map((party) => (
              <tr key={party._id}>
                {/* CODE */}

                <td>{party.code}</td>

                {/* NAME */}

                <td>{party.name}</td>

                {/* CONTACT */}

                <td>{party.contactNumber}</td>

                {/* AREA */}

                <td>{party.address}</td>

                {/* ACTION */}

                <td>
                  <div className="table-actions">
                    <DeleteButton
                      onDelete={() => onDelete(party._id)}
                      itemName={party.name}
                    />
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
