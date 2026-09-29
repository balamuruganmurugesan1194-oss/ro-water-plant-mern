import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import api from "../../api/client";
import { fetchParties, fetchProducts } from "../../app/resourceSlice";
import SearchableSelect from "../../components/common/SearchableSelect";
import Loading from "../../components/common/Loading";
import { today } from "../../utils/helpers";

export default function Purchases() {
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products.data);

  const suppliers = useSelector((state) =>
    state.parties.data.filter((party) => party.type === "supplier"),
  );

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    date: today(),
    supplier: "",
    items: [
      {
        product: "",
        quantity: "",
        rate: "",
      },
    ],
  });

  // =========================================================
  // LOAD PURCHASES
  // =========================================================

  const load = async () => {
    setLoading(true);

    try {
      const response = await api.get("/purchases");

      setRows(response.data || []);
    } catch (error) {
      setRows([]);

      toast.error(
        error?.response?.data?.message || "Failed to load purchase records",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    dispatch(fetchProducts({ active: true }));
    dispatch(fetchParties({}));
    load();
  }, [dispatch]);

  // =========================================================
  // PRODUCT OPTIONS
  // =========================================================

  const productOptions = products.map((product) => ({
    value: product._id,
    label: `${product.name} (${product.code})`,
  }));

  // =========================================================
  // SUPPLIER OPTIONS
  // =========================================================

  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier._id,
    label: `${supplier.name} (${supplier.code})`,
  }));

  // =========================================================
  // PRODUCT OPTIONS FOR EACH ROW
  // PREVENT DUPLICATE PRODUCT
  // =========================================================

  const getProductOptions = (index) => {
    const selectedProducts = form.items
      .filter((_, itemIndex) => itemIndex !== index)
      .map((item) => item.product)
      .filter(Boolean);

    return productOptions.filter(
      (option) => !selectedProducts.includes(option.value),
    );
  };

  // =========================================================
  // UPDATE ITEM
  // =========================================================

  const updateItem = (index, field, value) => {
    setForm((current) => ({
      ...current,

      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  };

  // =========================================================
  // ADD ITEM
  // =========================================================

  const addItem = () => {
    setForm((current) => ({
      ...current,

      items: [
        ...current.items,
        {
          product: "",
          quantity: "",
          rate: "",
        },
      ],
    }));
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const removeItem = (index) => {
    setForm((current) => ({
      ...current,

      items:
        current.items.length > 1
          ? current.items.filter((_, itemIndex) => itemIndex !== index)
          : current.items,
    }));
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const submit = async (event) => {
    event.preventDefault();

    // -------------------------------------------------------
    // SUPPLIER VALIDATION
    // -------------------------------------------------------

    if (!form.supplier) {
      toast.error("Please select a supplier");
      return;
    }

    // -------------------------------------------------------
    // ITEM VALIDATION
    // -------------------------------------------------------

    const invalidItem = form.items.some(
      (item) =>
        !item.product ||
        !item.quantity ||
        Number(item.quantity) <= 0 ||
        item.rate === "" ||
        Number(item.rate) < 0,
    );

    if (invalidItem) {
      toast.error("Please select product and enter valid quantity and rate");
      return;
    }

    setSaving(true);

    try {
      await api.post("/purchases", {
        date: form.date,

        supplier: form.supplier,

        items: form.items.map((item) => ({
          product: item.product,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
      });

      // -----------------------------------------------------
      // RESET FORM
      // -----------------------------------------------------

      setForm({
        date: today(),
        supplier: "",
        items: [
          {
            product: "",
            quantity: "",
            rate: "",
          },
        ],
      });

      // -----------------------------------------------------
      // REFRESH REGISTER
      // -----------------------------------------------------

      await load();

      toast.success("Purchase saved successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save purchase");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return <Loading />;
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="content">
      {/* =====================================================
          NEW PURCHASE
      ====================================================== */}

      <section className="panel">
        <div className="panel-head">
          <h3>New Purchase</h3>
        </div>

        <form className="form-grid" onSubmit={submit}>
          {/* =================================================
              DATE
          ================================================== */}

          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
              required
            />
          </label>

          {/* =================================================
              SUPPLIER
          ================================================== */}

          <label>
            Supplier
            <SearchableSelect
              value={form.supplier}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  supplier: value,
                }))
              }
              options={supplierOptions}
              placeholder="Select supplier"
            />
          </label>

          {/* =================================================
              ITEMS
          ================================================== */}

          <div className="sale-items-wrapper full-width">
            <div className="sale-items-header">
              <h4>Items</h4>

              <button
                type="button"
                className="secondary"
                disabled={form.items.length >= products.length}
                onClick={addItem}
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            <div className="sale-items">
              {form.items.map((item, index) => (
                <div className="sale-item-row purchase-item-row" key={index}>
                  {/* =====================================
                        PRODUCT
                    ====================================== */}

                  <label className="sale-item-product">
                    Product
                    <SearchableSelect
                      value={item.product}
                      onChange={(value) => updateItem(index, "product", value)}
                      options={getProductOptions(index)}
                      placeholder="Select product"
                    />
                  </label>

                  {/* =====================================
                        QUANTITY
                    ====================================== */}

                  <label>
                    Quantity
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(index, "quantity", event.target.value)
                      }
                      required
                    />
                  </label>

                  {/* =====================================
                        RATE
                    ====================================== */}

                  <label>
                    Rate
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(event) =>
                        updateItem(index, "rate", event.target.value)
                      }
                      required
                    />
                  </label>

                  {/* =====================================
                        DELETE
                    ====================================== */}

                  <button
                    type="button"
                    className="icon danger"
                    title="Remove product"
                    aria-label="Remove product"
                    onClick={() => removeItem(index)}
                    disabled={form.items.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* =================================================
              SAVE
          ================================================== */}

          <button type="submit" className="primary" disabled={saving}>
            {saving ? "Saving..." : "Save Purchase"}
          </button>
        </form>
      </section>

      {/* =====================================================
          PURCHASE REGISTER
      ====================================================== */}

      <section className="panel">
        <div className="panel-head">
          <h3>Purchase Register</h3>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Date</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={row._id}>
                    <td>{row.purchaseNumber}</td>

                    <td>{new Date(row.date).toLocaleDateString("en-IN")}</td>

                    <td>{row.totalAmount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="empty-state">
                    No purchase records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
