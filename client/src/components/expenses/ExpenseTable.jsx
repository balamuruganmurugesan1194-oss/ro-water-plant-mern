import React from "react";
import { Search, Pencil } from "lucide-react";

import { money } from "../../utils/helpers";

import Table from "../common/Table";
import Pagination from "../common/Pagination";
import DeleteButton from "../common/DeleteButton";
import ExportButtons from "../common/ExportButtons";

const expenseExportColumns = [
  {
    key: "expenseNumber",
    label: "Expense Number",
  },
  {
    key: "date",
    label: "Date",
    type: "date",
  },
  {
    key: "category",
    label: "Category",
  },
  {
    key: "amount",
    label: "Amount",
    type: "currency",
  },
  {
    key: "notes",
    label: "Notes",
  },
];

function ExpenseTable({
  items,
  filteredItems,
  paginatedItems,
  month,
  search,
  canEdit,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onMonthChange,
  onSearchChange,
  onEdit,
  onDelete,
  onPageChange,
  onItemsPerPageChange,
}) {
  return (
    <section className="panel">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="panel-head">
        <h3>Expense Register</h3>

        <div className="filters">
          {/* MONTH */}

          <input
            type="month"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
          />

          {/* SEARCH */}

          <div className="search-box">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search category, vendor, notes..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* EXPORT */}

          <ExportButtons
            data={items}
            columns={expenseExportColumns}
            title="Expense Register"
            fileName={`Expense_Register_${month}`}
            sheetName="Expenses"
            filters={{
              Month: month,
              Search: search || "All",
            }}
          />
        </div>
      </div>

      {/* ======================================
          EMPTY STATE
      ====================================== */}

      {items.length === 0 ? (
        <div className="empty-state">No expenses found for this month.</div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">No matching expenses found.</div>
      ) : (
        <>
          {/* ==================================
              TABLE
          ================================== */}

          <Table
            headers={[
              "Expense Number",
              "Date",
              "Category",
              "Amount",
              "Notes",
              ...(canEdit ? ["Actions"] : []),
            ]}
            rows={paginatedItems.map((item) => (
              <tr key={item._id}>
                {/* EXPENSE NUMBER */}

                <td>{item.expenseNumber}</td>

                {/* DATE */}

                <td>{new Date(item.date).toLocaleDateString("en-IN")}</td>

                {/* CATEGORY */}

                <td>{item.category}</td>

                {/* AMOUNT */}

                <td>{money(item.amount)}</td>

                {/* NOTES */}

                <td>{item.notes || "—"}</td>

                {/* =================================
                    ACTIONS - ADMIN ONLY
                ================================= */}

                {canEdit && (
                  <td>
                    <div className="table-actions">
                      {/* EDIT */}

                      <button
                        type="button"
                        className="icon-button edit-button"
                        title="Edit Expense"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil size={16} />
                      </button>

                      {/* DELETE */}

                      <DeleteButton
                        onDelete={() => onDelete(item._id)}
                        itemName={`${item.category} - ${new Date(
                          item.date,
                        ).toLocaleDateString("en-IN")}`}
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

export default ExpenseTable;
