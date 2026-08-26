import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import api from "../api/client";
import { money, today } from "../utils/helpers";
import Table from "../components/Table";
import Loading from "../components/Loading";
import { paymentMethods, paymentStatus } from "../data/payment.json";
import DeleteButton from "../components/DeleteButton";
import { useAuth } from "../context/AuthContext";
function Sales() {
  // ==========================================
  // STATE
  // ==========================================
  const { role } = useAuth();
  const canEdit = role === "admin";
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [type, setType] = useState("retail");
  const [month, setMonth] = useState("2026-08");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // ==========================================
  // BLANK FORM
  // ==========================================

  const createBlankForm = () => ({
    date: today(),

    customerName: "",

    contactNumber: "",

    area: "",

    product: "",

    quantity: 0,

    rate: 0,

    jarsDelivered: 0,

    jarsReturned: 0,

    paymentMode: "Cash",

    paymentStatus: "Paid",

    notes: "",

    amount: 0,
  });

  const [form, setForm] = useState(createBlankForm());

  // ==========================================
  // SELECTED PRODUCT
  // ==========================================

  const selectedProduct = products.find(
    (product) => product.name === form.product,
  );

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  const loadProducts = async () => {
    try {
      setProductsLoading(true);

      const response = await api.get("/products?active=true");

      const activeProducts = response.data || [];

      setProducts(activeProducts);

      // Set first product automatically
      if (activeProducts.length > 0 && !form.product) {
        const firstProduct = activeProducts[0];

        setForm((prev) => ({
          ...prev,

          product: firstProduct.name,

          rate: firstProduct.rate,

          jarsDelivered: firstProduct.jarTracking ? prev.quantity : 0,

          jarsReturned: 0,
        }));
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  // ==========================================
  // LOAD SALES
  // ==========================================

  const load = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/sales?month=${month}&type=${type}&search=${encodeURIComponent(
          search,
        )}`,
      );

      setSales(response.data || []);
    } catch (error) {
      console.error("Failed to load sales:", error);
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
  // LOAD SALES WHEN FILTER CHANGES
  // ==========================================

  useEffect(() => {
    load();
  }, [month, type, search]);

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Remove field validation error
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // ==========================================
  // PRODUCT CHANGE
  // ==========================================

  const handleProductChange = (productName) => {
    const product = products.find((item) => item.name === productName);

    if (!product) {
      return;
    }

    setForm((prev) => ({
      ...prev,

      product: product.name,

      rate: product.rate,

      amount: form.quantity * product.rate,
    }));

    setErrors((prev) => ({
      ...prev,
      product: "",
      rate: "",
      jarsDelivered: "",
      jarsReturned: "",
    }));
  };

  // ==========================================
  // QUANTITY CHANGE
  // ==========================================

  const handleQuantityChange = (value) => {
    setForm((prev) => ({
      ...prev,

      quantity: value,

      amount: value * form.rate,
    }));

    if (errors.quantity) {
      setErrors((prev) => ({
        ...prev,
        quantity: "",
      }));
    }
  };

  // ==========================================
  // VALIDATION
  // ==========================================

  const validateForm = () => {
    const newErrors = {};

    // Date
    if (!form.date) {
      newErrors.date = "Date is required";
    }

    // Customer name
    if (!form.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    } else if (form.customerName.trim().length < 2) {
      newErrors.customerName = "Enter a valid customer name";
    }

    // Contact
    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.contactNumber.trim())) {
      newErrors.contactNumber = "Enter a valid 10-digit mobile number";
    }

    // Product
    if (!form.product) {
      newErrors.product = "Product is required";
    }

    // Quantity
    if (form.quantity === "" || Number(form.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    // Rate
    if (form.rate === "" || Number(form.rate) <= 0) {
      newErrors.rate = "Rate must be greater than 0";
    }

    if (form.amount === "" || Number(form.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    // Payment method
    if (!form.paymentMode) {
      newErrors.paymentMode = "Payment method is required";
    }

    // Payment status
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
      const payload = {
        ...form,

        type,

        quantity: Number(form.quantity),

        rate: Number(form.rate),

        amount: Number(form.quantity) * Number(form.rate),
      };

      await api.post("/sales", payload);

      // Clear form
      const newForm = createBlankForm();

      // Keep first product selected
      if (products.length > 0) {
        const firstProduct = products[0];

        newForm.product = firstProduct.name;

        newForm.rate = firstProduct.rate;
      }

      setForm(newForm);

      // Clear errors
      setErrors({});

      // Reload sales
      await load();
    } catch (error) {
      console.error("Failed to save sale:", error);

      alert(error?.response?.data?.message || "Failed to save sale");
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const del = async (id) => {
    try {
      await api.delete(`/sales/${id}`);

      await load();
    } catch (error) {
      console.error("Failed to delete sale:", error);

      alert(error?.response?.data?.message || "Failed to delete sale");
    }
  };

  // ==========================================
  // CHANGE SALE TYPE
  // ==========================================

  const handleTypeChange = (newType) => {
    setType(newType);

    setErrors({});

    const newForm = createBlankForm();

    const firstProduct = products[0];

    newForm.product = firstProduct.name;

    newForm.rate = firstProduct.rate;

    newForm.amount = firstProduct.quantity * firstProduct.rate;

    setForm(newForm);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="content">
      {/* ========================================
          NEW SALE
      ======================================== */}

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

        <form className="form-grid" onSubmit={submit}>
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

          {/* CONTACT */}

          <label>
            Contact
            <input
              type="tel"
              value={form.contactNumber}
              maxLength={10}
              inputMode="numeric"
              placeholder="10-digit mobile"
              className={errors.contactNumber ? "input-error" : ""}
              onChange={(e) =>
                handleChange("contactNumber", e.target.value.replace(/\D/g, ""))
              }
            />
            {errors.contactNumber && (
              <small className="error-text">{errors.contactNumber}</small>
            )}
          </label>

          {/* AREA */}

          <label>
            Area / Route
            <input
              type="text"
              value={form.area}
              placeholder="Area / Route"
              onChange={(e) => handleChange("area", e.target.value)}
            />
          </label>

          {/* ======================================
              PRODUCT
          ====================================== */}

          {/* PRODUCT */}

          <label>
            Product
            {productsLoading ? (
              <select disabled>
                <option>Loading products...</option>
              </select>
            ) : (
              <select
                value={form.product}
                className={errors.product ? "input-error" : ""}
                onChange={(e) => handleProductChange(e.target.value)}
              >
                <option value="">Select Product</option>

                {products.map((product) => (
                  <option key={product._id} value={product.name}>
                    {product.name} - ₹{product.rate}
                  </option>
                ))}
              </select>
            )}
            {errors.product && (
              <small className="error-text">{errors.product}</small>
            )}
          </label>

          {/* QUANTITY */}

          <label>
            Qty
            <input
              type="number"
              min="1"
              value={form.quantity}
              className={errors.quantity ? "input-error" : ""}
              onChange={(e) => handleQuantityChange(e.target.value)}
            />
            {errors.quantity && (
              <small className="error-text">{errors.quantity}</small>
            )}
          </label>

          {/* RATE */}

          <label>
            Rate
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.rate}
              className={errors.rate ? "input-error" : ""}
              onChange={(e) => handleChange("rate", e.target.value)}
              readOnly
            />
            {errors.rate && <small className="error-text">{errors.rate}</small>}
          </label>

          <label>
            Amount
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              placeholder="Enter amount"
              className={errors.amount ? "input-error" : ""}
              onChange={(e) => handleChange("amount", e.target.value)}
              readOnly
            />
            {errors.amount && (
              <small className="error-text">{errors.amount}</small>
            )}
          </label>
          {/* ======================================
              PAYMENT MODE
          ====================================== */}

          <label>
            Payment Mode
            <select
              value={form.paymentMode}
              className={errors.paymentMode ? "input-error" : ""}
              onChange={(e) => handleChange("paymentMode", e.target.value)}
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
            {errors.paymentMode && (
              <small className="error-text">{errors.paymentMode}</small>
            )}
          </label>

          {/* ======================================
              PAYMENT STATUS
          ====================================== */}

          <label>
            Status
            <select
              value={form.paymentStatus}
              className={errors.paymentStatus ? "input-error" : ""}
              onChange={(e) => handleChange("paymentStatus", e.target.value)}
            >
              {paymentStatus.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {errors.paymentStatus && (
              <small className="error-text">{errors.paymentStatus}</small>
            )}
          </label>

          {/* ======================================
              SAVE
          ====================================== */}

          <button className="primary" type="submit" disabled={productsLoading}>
            <Plus size={18} />
            Save Sale
          </button>
        </form>
      </section>

      {/* ========================================
          SALES REGISTER
      ======================================== */}

      <section className="panel">
        <div className="panel-head">
          <h3>Sales Register</h3>

          <div className="filters">
            {/* MONTH */}

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />

            {/* SEARCH */}

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
          <Table
            headers={[
              "Date",
              "Type",
              "Customer",
              "Product",
              "Qty",
              "Rate",
              "Amount",
              "Payment",
              "Status",
              "",
            ]}
            rows={sales.map((sale) => (
              <tr key={sale._id}>
                {/* DATE */}

                <td>{new Date(sale.date).toLocaleDateString("en-IN")}</td>

                {/* TYPE */}

                <td>{sale.type}</td>

                {/* CUSTOMER */}

                <td>{sale.customerName}</td>

                {/* PRODUCT */}

                <td>{sale.product || "—"}</td>

                {/* QTY */}

                <td>{sale.quantity || "—"}</td>

                {/* RATE */}

                <td>{sale.rate ? money(sale.rate) : "—"}</td>

                {/* AMOUNT */}

                <td>{money(sale.amount)}</td>

                {/* PAYMENT */}

                <td>{sale.paymentMode}</td>

                {/* STATUS */}

                <td>{sale.paymentStatus}</td>

                {/* DELETE */}

                <td>
                  {canEdit && (
                    <DeleteButton
                      onDelete={() => del(sale._id)}
                      itemName={`${sale.customerName} - ${sale.type} - ${new Date(sale.date).toLocaleDateString("en-IN")}`}
                    />
                  )}
                </td>
              </tr>
            ))}
          />
        )}
      </section>
    </div>
  );
}

export default Sales;
