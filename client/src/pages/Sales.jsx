import React, { useEffect, useRef, useState } from "react";

import { Plus, Trash2 } from "lucide-react";

import api from "../api/client";
import { money, today } from "../utils/helpers";

import Table from "../components/Table";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import DeleteButton from "../components/DeleteButton";
import SearchableSelect from "../components/SearchableSelect";
import SaleDetailsModal from "../components/SaleDetailsModal";

import { paymentMethods, paymentStatus } from "../data/payment.json";

import { useAuth } from "../context/AuthContext";

function Sales() {
  // ==========================================
  // AUTH
  // ==========================================

  const { role } = useAuth();

  const canEdit = role === "admin";

  // ==========================================
  // SALES
  // ==========================================

  const [sales, setSales] = useState([]);

  const [products, setProducts] = useState([]);

  // ==========================================
  // FILTERS
  // ==========================================

  const [type, setType] = useState("retail");

  // const [month, setMonth] = useState("2026-08");
  const [month, setMonth] = useState(() => today().slice(0, 7));

  const [search, setSearch] = useState("");

  // ==========================================
  // LOADING
  // ==========================================

  const [loading, setLoading] = useState(false);

  const [productsLoading, setProductsLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  // ==========================================
  // FORM
  // ==========================================

  const [errors, setErrors] = useState({});

  const [selectedSale, setSelectedSale] = useState(null);

  // ==========================================
  // PAGINATION
  // ==========================================

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ==========================================
  // SEARCH THROTTLE
  // ==========================================

  const throttleTimeoutRef = useRef(null);

  const lastSearchTimeRef = useRef(0);

  // ==========================================
  // BLANK FORM
  // ==========================================

  const createBlankForm = () => ({
    date: today(),
    customerName: "",
    items: [],
    paymentMode: "Cash",
    paymentStatus: "Paid",
    notes: "",
    amount: 0,
  });

  const [form, setForm] = useState(createBlankForm());

  // ==========================================
  // BLANK ITEM
  // ==========================================

  const createBlankItem = () => ({
    product: "",
    quantity: 1,
    rate: 0,
    amount: 0,
  });

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  const loadProducts = async () => {
    try {
      setProductsLoading(true);

      const response = await api.get("/products?active=true");

      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  // ==========================================
  // LOAD SALES
  // ==========================================

  const loadSales = async (searchValue = search) => {
    try {
      setLoading(true);

      const response = await api.get(
        `/sales?month=${month}&type=${type}&search=${encodeURIComponent(
          searchValue,
        )}`,
      );

      setSales(response.data || []);
    } catch (error) {
      console.error("Failed to load sales:", error);

      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadProducts();
  }, []);

  // ==========================================
  // LOAD SALES
  // MONTH / TYPE
  // ==========================================

  useEffect(() => {
    setCurrentPage(1);

    loadSales(search);
  }, [month, type]);

  // ==========================================
  // SEARCH THROTTLING
  // ==========================================

  useEffect(() => {
    const now = Date.now();

    const elapsed = now - lastSearchTimeRef.current;

    const delay = elapsed >= 500 ? 0 : 500 - elapsed;

    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
    }

    throttleTimeoutRef.current = setTimeout(() => {
      lastSearchTimeRef.current = Date.now();

      setCurrentPage(1);

      loadSales(search);
    }, delay);

    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [search]);

  // ==========================================
  // CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []);

  // ==========================================
  // PAGINATION CALCULATION
  // ==========================================

  const totalPages = Math.ceil(sales.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const paginatedSales = sales.slice(startIndex, endIndex);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // ==========================================
  // AVAILABLE PRODUCTS
  // ==========================================

  const getAvailableProducts = (currentIndex) => {
    const selectedProducts = form.items
      .map((item, index) => (index !== currentIndex ? item.product : ""))
      .filter(Boolean);

    return products.filter(
      (product) => !selectedProducts.includes(product._id),
    );
  };

  // ==========================================
  // ADD PRODUCT
  // ==========================================

  const addProductItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, createBlankItem()],
    }));

    setErrors((prev) => ({
      ...prev,
      items: "",
    }));
  };

  // ==========================================
  // REMOVE PRODUCT
  // ==========================================

  const removeProductItem = (index) => {
    setForm((prev) => {
      const items = prev.items.filter((_, i) => i !== index);

      const totalAmount = items.reduce(
        (total, item) => total + Number(item.amount || 0),
        0,
      );

      return {
        ...prev,
        items,
        amount: totalAmount,
      };
    });

    setErrors((prev) => {
      const newErrors = {
        ...prev,
      };

      delete newErrors[`product_${index}`];

      delete newErrors[`quantity_${index}`];

      delete newErrors[`rate_${index}`];

      return newErrors;
    });
  };

  // ==========================================
  // PRODUCT CHANGE
  // ==========================================

  const handleProductChange = (index, productId) => {
    const product = products.find((item) => item._id === productId);

    if (!product) {
      return;
    }

    setForm((prev) => {
      const items = [...prev.items];

      const quantity = Number(items[index]?.quantity || 1);

      const rate = Number(product.rate || 0);

      items[index] = {
        ...items[index],

        product: product._id,

        quantity,

        rate,

        amount: quantity * rate,
      };

      const totalAmount = items.reduce(
        (total, item) => total + Number(item.amount || 0),
        0,
      );

      return {
        ...prev,
        items,
        amount: totalAmount,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [`product_${index}`]: "",
    }));
  };

  // ==========================================
  // QUANTITY CHANGE
  // ==========================================

  const handleItemQuantityChange = (index, value) => {
    const quantity = value === "" ? "" : Number(value);

    setForm((prev) => {
      const items = [...prev.items];

      const item = items[index];

      if (!item) {
        return prev;
      }

      const amount = quantity === "" ? 0 : quantity * Number(item.rate || 0);

      items[index] = {
        ...item,
        quantity,
        amount,
      };

      const totalAmount = items.reduce(
        (total, item) => total + Number(item.amount || 0),
        0,
      );

      return {
        ...prev,
        items,
        amount: totalAmount,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [`quantity_${index}`]: "",
    }));
  };

  // ==========================================
  // VALIDATION
  // ==========================================

  const validateForm = () => {
    const newErrors = {};

    // DATE

    if (!form.date) {
      newErrors.date = "Date is required";
    }

    // CUSTOMER

    if (!form.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    } else if (form.customerName.trim().length < 2) {
      newErrors.customerName = "Enter a valid customer name";
    }

    // ITEMS

    if (!form.items.length) {
      newErrors.items = "Add at least one product";
    }

    form.items.forEach((item, index) => {
      if (!item.product) {
        newErrors[`product_${index}`] = "Product is required";
      }

      if (item.quantity === "" || Number(item.quantity) <= 0) {
        newErrors[`quantity_${index}`] = "Quantity must be greater than 0";
      }

      if (item.rate === "" || Number(item.rate) <= 0) {
        newErrors[`rate_${index}`] = "Rate must be greater than 0";
      }
    });

    // AMOUNT

    if (form.amount === "" || Number(form.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    // PAYMENT MODE

    if (!form.paymentMode) {
      newErrors.paymentMode = "Payment method is required";
    }

    // PAYMENT STATUS

    if (!form.paymentStatus) {
      newErrors.paymentStatus = "Payment status is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        date: form.date,

        customerName: form.customerName.trim(),

        type,

        items: form.items.map((item) => ({
          product: item.product,

          quantity: Number(item.quantity),

          rate: Number(item.rate),

          amount: Number(item.quantity) * Number(item.rate),
        })),

        amount: form.items.reduce(
          (total, item) => total + Number(item.quantity) * Number(item.rate),
          0,
        ),

        paymentMode: form.paymentMode,

        paymentStatus: form.paymentStatus,

        notes: form.notes,
      };

      console.log("SALE PAYLOAD:", payload);

      await api.post("/sales", payload);

      setForm(createBlankForm());

      setErrors({});

      setCurrentPage(1);

      await loadSales(search);
    } catch (error) {
      console.error("Failed to save sale:", error);

      alert(error?.response?.data?.message || "Failed to save sale");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const del = async (id) => {
    try {
      await api.delete(`/sales/${id}`);

      await loadSales(search);

      const newTotalPages = Math.ceil((sales.length - 1) / itemsPerPage);

      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error("Failed to delete sale:", error);

      alert(error?.response?.data?.message || "Failed to delete sale");
    }
  };

  // ==========================================
  // TYPE CHANGE
  // ==========================================

  const handleTypeChange = (newType) => {
    setType(newType);

    setErrors({});

    setCurrentPage(1);

    setForm(createBlankForm());
  };

  // ==========================================
  // ITEMS PER PAGE
  // ==========================================

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);

    setCurrentPage(1);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="content">
      {/* ======================================
          NEW SALE
      ====================================== */}

      <section className="panel">
        <div className="panel-head">
          <h3>New Sale</h3>

          <div className="tabs">
            {["retail", "supplier", "other"].map((x) => (
              <button
                type="button"
                className={type === x ? "tab active" : "tab"}
                onClick={() => handleTypeChange(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        <form className="form-grid" onSubmit={submit} noValidate>
          {/* DATE */}

          <label>
            Date
            <input
              type="date"
              value={form.date}
              className={errors.date ? "input-error" : ""}
              onChange={(e) => handleChange("date", e.target.value)}
            />
            {errors.date && <small className="error-text">{errors.date}</small>}
          </label>

          {/* CUSTOMER */}

          <label>
            Name
            <input
              type="text"
              value={form.customerName}
              placeholder="Customer name"
              className={errors.customerName ? "input-error" : ""}
              onChange={(e) => handleChange("customerName", e.target.value)}
            />
            {errors.customerName && (
              <small className="error-text">{errors.customerName}</small>
            )}
          </label>

          {/* PAYMENT MODE */}

          <div className="form-field">
            <label>Payment Mode</label>

            <SearchableSelect
              value={form.paymentMode}
              options={paymentMethods.map((method) => ({
                value: method.value,
                label: method.label,
              }))}
              placeholder="Select Payment Mode"
              error={!!errors.paymentMode}
              onChange={(value) => handleChange("paymentMode", value)}
            />

            {errors.paymentMode && (
              <small className="error-text">{errors.paymentMode}</small>
            )}
          </div>

          {/* PAYMENT STATUS */}

          <div className="form-field">
            <label>Status</label>

            <SearchableSelect
              value={form.paymentStatus}
              options={paymentStatus.map((status) => ({
                value: status.value,
                label: status.label,
              }))}
              placeholder="Select Status"
              error={!!errors.paymentStatus}
              onChange={(value) => handleChange("paymentStatus", value)}
            />

            {errors.paymentStatus && (
              <small className="error-text">{errors.paymentStatus}</small>
            )}
          </div>

          {/* ======================================
              PRODUCTS
          ====================================== */}

          <div className="sale-items-wrapper">
            <div className="sale-items-header">
              <h4>Products</h4>

              <button
                type="button"
                className="secondary"
                onClick={addProductItem}
                disabled={
                  productsLoading || form.items.length >= products.length
                }
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>

            {productsLoading ? (
              <div className="product-loading">Loading products...</div>
            ) : form.items.length === 0 ? (
              <div className="empty-state">
                No products added. Click
                <strong> Add Product</strong>.
              </div>
            ) : (
              <div className="sale-items">
                {form.items.map((item, index) => {
                  const availableProducts = getAvailableProducts(index);

                  return (
                    <div className="sale-item-row" key={index}>
                      {/* PRODUCT */}

                      <div className="sale-item-product">
                        <label>
                          Product
                          <SearchableSelect
                            value={item.product}
                            options={availableProducts.map((product) => ({
                              value: product._id,
                              label: product.name,
                              rate: product.rate,
                            }))}
                            placeholder="Select Product"
                            error={!!errors[`product_${index}`]}
                            onChange={(value) =>
                              handleProductChange(index, value)
                            }
                            renderOption={(option) => (
                              <div className="product-option">
                                <span>{option.label}</span>

                                <span className="product-rate">
                                  ₹{option.rate}
                                </span>
                              </div>
                            )}
                          />
                          {errors[`product_${index}`] && (
                            <small className="error-text">
                              {errors[`product_${index}`]}
                            </small>
                          )}
                        </label>
                      </div>

                      {/* QUANTITY */}

                      <div className="sale-item-small">
                        <label>
                          Qty
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            className={
                              errors[`quantity_${index}`] ? "input-error" : ""
                            }
                            onChange={(e) =>
                              handleItemQuantityChange(index, e.target.value)
                            }
                          />
                          {errors[`quantity_${index}`] && (
                            <small className="error-text">
                              {errors[`quantity_${index}`]}
                            </small>
                          )}
                        </label>
                      </div>

                      {/* RATE */}

                      <div className="sale-item-small">
                        <label>
                          Rate
                          <input type="number" value={item.rate} readOnly />
                        </label>
                      </div>

                      {/* AMOUNT */}

                      <div className="sale-item-small">
                        <label>
                          Amount
                          <input
                            type="text"
                            value={money(item.amount || 0)}
                            readOnly
                          />
                        </label>
                      </div>

                      {/* DELETE */}

                      <button
                        type="button"
                        className="icon danger"
                        title="Remove product"
                        onClick={() => removeProductItem(index)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {errors.items && (
              <small className="error-text">{errors.items}</small>
            )}
          </div>

          {/* ======================================
              TOTAL + SAVE
          ====================================== */}

          <div className="sale-footer">
            <div className="sale-total">
              <span>Total Amount</span>

              <strong>{money(form.amount || 0)}</strong>
            </div>

            <div className="form-actions">
              <button className="primary" type="submit" disabled={saving}>
                <Plus size={18} />

                {saving ? "Saving..." : "Save Sale"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* ======================================
          SALES REGISTER
      ====================================== */}

      <section className="panel">
        <div className="panel-head">
          <h3>Sales Register</h3>

          <div className="filters">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />

            <input
              type="search"
              placeholder="Search customer/product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              rows={paginatedSales.map((sale) => (
                <tr key={sale._id}>
                  {/* DATE */}

                  <td>{new Date(sale.date).toLocaleDateString("en-IN")}</td>

                  {/* TYPE */}

                  <td>{sale.type}</td>

                  {/* CUSTOMER */}

                  <td>{sale.customerName}</td>

                  {/* AMOUNT */}

                  <td>
                    <button
                      type="button"
                      className="amount-link"
                      onClick={() => setSelectedSale(sale)}
                      title="View sale details"
                    >
                      {money(sale.amount)}
                    </button>
                  </td>

                  {/* PAYMENT */}

                  <td>{sale.paymentMode}</td>

                  {/* STATUS */}

                  <td>{sale.paymentStatus}</td>

                  {/* ACTION */}

                  <td>
                    <div className="table-actions">
                      {canEdit && (
                        <DeleteButton
                          onDelete={() => del(sale._id)}
                          itemName={`${sale.customerName} - ${
                            sale.type
                          } - ${new Date(sale.date).toLocaleDateString(
                            "en-IN",
                          )}`}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            />

            {/* GLOBAL PAGINATION */}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={sales.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </section>

      {/* ======================================
          SALE DETAILS MODAL
      ====================================== */}

      <SaleDetailsModal
        sale={selectedSale}
        onClose={() => setSelectedSale(null)}
      />
    </div>
  );
}

export default Sales;
