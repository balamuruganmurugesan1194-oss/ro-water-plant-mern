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
  // SEARCH PRODUCTS
  // ==========================================

  const filteredProducts = products.filter((product) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return true;

    return (
      product.name?.toLowerCase().includes(searchText) ||
      product.code?.toLowerCase().includes(searchText) ||
      product.category?.toLowerCase().includes(searchText) ||
      product.unit?.toLowerCase().includes(searchText)
    );
  });

  // ==========================================
  // EXPORT COLUMNS
  // ==========================================

  const productExportColumns = [
    {
      key: "code",
      label: "Product Code",
    },
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
      {/* HEADER */}

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

      {/* LOADING / EMPTY / TABLE */}

      {loading ? (
        <Loading />
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          {search ? `No products found for "${search}"` : "No products found."}
        </div>
      ) : (
        <>
          {/* TABLE */}

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Rate</th>

                  {canEdit && <th>Action</th>}
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    {/* CODE */}

                    <td>{product.code}</td>

                    {/* PRODUCT */}

                    <td>{product.name}</td>
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
                          <ProductStatusToggle
                            isActive={product.active}
                            disabled={togglingId === product._id}
                            onChange={() => onToggleActive(product)}
                          />
                          {/* EDIT */}

                          <button
                            type="button"
                            className="icon-button edit-button"
                            title="Edit Expense"
                            onClick={() => onEdit(product)}
                          >
                            <Pencil size={16} />
                          </button>

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

export default ProductTable;
