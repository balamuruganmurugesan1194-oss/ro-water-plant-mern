import React from "react";

import Table from "../../components/Table";
import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";
import DeleteButton from "../../components/DeleteButton";

import { money } from "../../utils/helpers";

function SalesRegister({
  sales,
  loading,
  month,
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
  return (
    <section className="panel">

      <div className="panel-head">
        <h3>Sales Register</h3>

        <div className="filters">

          <input
            type="month"
            value={month}
            onChange={(e) =>
              onMonthChange(e.target.value)
            }
          />

          <input
            type="search"
            placeholder="Search customer/product..."
            value={search}
            onChange={(e) =>
              onSearchChange(e.target.value)
            }
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
              "Customer",
              "Amount",
              "Payment",
              "Status",
              "Action",
            ]}
            rows={sales.map((sale) => (
              <tr key={sale._id}>

                <td>
                  {new Date(
                    sale.date
                  ).toLocaleDateString("en-IN")}
                </td>

                <td>{sale.type}</td>

                <td>{sale.customerName}</td>

                <td>
                  <button
                    type="button"
                    className="amount-link"
                    onClick={() =>
                      onViewSale(sale)
                    }
                  >
                    {money(sale.amount)}
                  </button>
                </td>

                <td>
                  {sale.paymentMode}
                </td>

                <td>
                  {sale.paymentStatus}
                </td>

                <td>
                  <div className="table-actions">

                    {canEdit && (
                      <DeleteButton
                        onDelete={() =>
                          onDelete(sale._id)
                        }
                        itemName={`${sale.customerName} - ${sale.type}`}
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
            onItemsPerPageChange={
              onItemsPerPageChange
            }
          />
        </>
      )}

    </section>
  );
}

export default SalesRegister;