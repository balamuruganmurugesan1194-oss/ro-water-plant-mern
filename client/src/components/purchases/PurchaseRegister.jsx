import React from "react";

import Table from "../common/Table";
import Loading from "../common/Loading";
import Pagination from "../common/Pagination";
import DeleteButton from "../common/DeleteButton";
import ExportButtons from "../common/ExportButtons";
import { money } from "../../utils/helpers";

function PurchaseRegister({
  purchases,
  allPurchases,
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
  onViewPurchase,
}) {
  const columns = [
    { key: "purchaseNumber", label: "Purchase No" },
    { key: "date", label: "Date", type: "date" },
    { key: "supplierName", label: "Supplier" },
    { key: "paymentMode", label: "Payment Mode" },
    { key: "paymentStatus", label: "Payment Status" },
    { key: "amount", label: "Amount", type: "currency" },
    { key: "notes", label: "Notes" },
  ];

  return (
    <section className="panel">
      <div className="panel-head">
        <h3>Purchase Register</h3>

        <div className="filters">
          <input
            type="month"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
          />

          <input
            type="search"
            placeholder="Search supplier/product/purchase no..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />

          <ExportButtons
            data={allPurchases}
            columns={columns}
            title="Purchase Register"
            fileName={`Purchase_Register_${month}`}
            sheetName="Purchase Register"
            filters={{ Month: month, Search: search }}
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <Table
            headers={[
              "Purchase No",
              "Date",
              "Supplier",
              "Amount",
              "Payment",
              "Status",
              "Action",
            ]}
            rows={purchases.map((purchase) => (
              <tr key={purchase._id}>
                <td>{purchase.purchaseNumber}</td>
                <td>
                  {new Date(purchase.date).toLocaleDateString("en-IN")}
                </td>
                <td>{purchase.supplierName}</td>
                <td>
                  <button
                    type="button"
                    className="amount-link"
                    onClick={() => onViewPurchase(purchase)}
                  >
                    {money(purchase.amount)}
                  </button>
                </td>
                <td>{purchase.paymentMode}</td>
                <td>{purchase.paymentStatus}</td>
                <td>
                  {canEdit && (
                    <DeleteButton
                      onDelete={() => onDelete(purchase._id)}
                      itemName={`${purchase.purchaseNumber} - ${purchase.supplierName}`}
                    />
                  )}
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

export default PurchaseRegister;
