import React from "react";
import { Pencil, Search } from "lucide-react";

import Loading from "../common/Loading";
import DeleteButton from "../common/DeleteButton";
import Pagination from "../common/Pagination";
import ExportButtons from "../common/ExportButtons";

import ProductStatusToggle from "./ProductStatusToggle";

import { money } from "../../utils/helpers";

// ==========================================
// PRODUCT TABLE
// ==========================================

function ProductTable({
  products,
  allProducts,
  loading,
  search,
  onSearchChange,
  canEdit,
  togglingId,
  onEdit,
  onDelete,
  onToggleActive,
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

  const productExportColumns = [
    {
      key: "name",
      label: "Product Name",
    },

    {
      key: "category",
      label: "Category",
    },

    {
      key: "unit",
      label: "Unit",
    },

    {
      key: "sellingPrice",
      label: "Selling Price",
      type: "currency",
    },

    {
      key: "active",
      label: "Status",

      value: (row) => (row.active ? "Active" : "Inactive"),
    },
  ];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="panel">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="panel-head">
        <h3>Products</h3>

        <div className="filters">
          {/* SEARCH */}

          <div className="search-box">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search product..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* EXPORT */}

          <ExportButtons
            data={allProducts}
            columns={productExportColumns}
            title="Product Register"
            fileName="Product_Register"
            sheetName="Products"
          />
        </div>
      </div>

      {/* ======================================
          LOADING / EMPTY / TABLE
      ====================================== */}

      {loading ? (
        <Loading />
      ) : allProducts.length === 0 ? (
        <div className="empty-state">No products found.</div>
      ) : (
        <>
          {/* ==================================
              TABLE
          ================================== */}

          <div className="table-wrapper">
            <table className="table">
              {/* TABLE HEAD */}

              <thead>
                <tr>
                  <th>Product</th>

                  <th>Code</th>

                  <th>Category</th>

                  <th>Unit</th>

                  <th>Rate</th>

                  {canEdit && <th>Action</th>}
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    {/* PRODUCT */}

                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    {/* CODE */}

                    <td>{product.code}</td>

                    {/* CATEGORY */}

                    <td>{product.category}</td>

                    {/* UNIT */}

                    <td>{product.unit}</td>

                    {/* RATE */}

                    <td>{money(product.rate)}</td>

                    {/* ACTION */}

                    {canEdit && (
                      <td>
                        <div className="table-actions">
                          {/* STATUS */}

                          <ProductStatusToggle
                            isActive={product.active}
                            disabled={togglingId === product._id}
                            onChange={() => onToggleActive(product)}
                          />

                          {/* EDIT */}

                          <button
                            type="button"
                            className="icon"
                            title="Edit"
                            onClick={() => onEdit(product)}
                          >
                            <Pencil size={16} />
                          </button>

                          {/* DELETE */}

                          <DeleteButton
                            onDelete={() => onDelete(product._id)}
                            itemName={product.name}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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

export default ProductTable;
