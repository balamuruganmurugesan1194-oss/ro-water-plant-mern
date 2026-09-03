import React from "react";
import { Search } from "lucide-react";

import { money } from "../../utils/helpers";

import Table from "../common/Table";
import Pagination from "../common/Pagination";
import DeleteButton from "../common/DeleteButton";
import ExportButtons from "../common/ExportButtons";

const expenseExportColumns = [
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
    key: "vendor",
    label: "Vendor",
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
  onDelete,
  onPageChange,
  onItemsPerPageChange,
}) {
  return (
    <section className="panel">
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

      {/* EMPTY STATE */}

      {items.length === 0 ? (
        <div className="empty-state">No expenses found for this month.</div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">No matching expenses found.</div>
      ) : (
        <>
          {/* TABLE */}

          <Table
            headers={["Date", "Category", "Amount", "Vendor", "Notes", ""]}
            rows={paginatedItems.map((item) => (
              <tr key={item._id}>
                {/* DATE */}

                <td>{new Date(item.date).toLocaleDateString("en-IN")}</td>

                {/* CATEGORY */}

                <td>{item.category}</td>

                {/* AMOUNT */}

                <td>{money(item.amount)}</td>

                {/* VENDOR */}

                <td>{item.vendor || "—"}</td>

                {/* NOTES */}

                <td>{item.notes || "—"}</td>

                {/* ACTION */}

                <td>
                  {canEdit && (
                    <DeleteButton
                      onDelete={() => onDelete(item._id)}
                      itemName={`${item.category} - ${new Date(
                        item.date,
                      ).toLocaleDateString("en-IN")}`}
                    />
                  )}
                </td>
              </tr>
            ))}
          />

          {/* PAGINATION */}

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
