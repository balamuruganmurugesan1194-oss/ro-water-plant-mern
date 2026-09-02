import React from "react";

import Table from "../../components/Table";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";
import DeleteButton from "../../components/DeleteButton";
import { money } from "../../utils/helpers";
import ExportButtons from "../../components/ExportButtons";

function SalesRegister({
  sales,
  allSales,
  loading,
  month,
  type,
  search,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  canEdit,
  onMonthChange,
  onSearchChange,
  onPageChange,
  onItemsPerPageChange,
  onDelete,
  onViewSale,
}) {
  const salesExportColumns = [
    {
      key: "date",
      label: "Date",
      type: "date",
    },

    {
      key: "partyName",
      label: "Party Name",
    },

    {
      key: "type",
      label: "Type",
    },

    {
      key: "paymentMode",
      label: "Payment Mode",
    },

    {
      key: "paymentStatus",
      label: "Payment Status",
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
  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Sales Register</h3>

        <div className="filters">
          <input
            type="month"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
          />

          <input
            type="search"
            placeholder="Search party/product..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <ExportButtons
            data={allSales}
            columns={salesExportColumns}
            title="Sales Register"
            fileName={`Sales_Register_${month}`}
            sheetName="Sales Register"
            filters={{
              Month: month,
              Type: type,
              Search: search,
            }}
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <Table
            headers={[
              "Date",
              "Type",
              "Party",
              "Amount",
              "Payment",
              "Status",
              "Action",
            ]}
            rows={sales.map((sale) => (
              <tr key={sale._id}>
                <td>{new Date(sale.date).toLocaleDateString("en-IN")}</td>

                <td>{sale.type}</td>

                <td>{sale.partyName}</td>

                <td>
                  <button
                    type="button"
                    className="amount-link"
                    onClick={() => onViewSale(sale)}
                  >
                    {money(sale.amount)}
                  </button>
                </td>

                <td>{sale.paymentMode}</td>

                <td>{sale.paymentStatus}</td>

                <td>
                  <div className="table-actions">
                    {canEdit && (
                      <DeleteButton
                        onDelete={() => onDelete(sale._id)}
                        itemName={`${sale.partyName} - ${sale.type}`}
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

export default SalesRegister;
