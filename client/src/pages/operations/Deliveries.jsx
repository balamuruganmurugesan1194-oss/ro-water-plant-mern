import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import api from "../../api/client";
import {
  fetchParties,
  fetchProducts,
} from "../../app/resourceSlice";

import SearchableSelect from "../../components/common/SearchableSelect";
import Loading from "../../components/common/Loading";
import { today } from "../../utils/helpers";

// import "./Deliveries.css";

export default function Deliveries() {
  const dispatch = useDispatch();

  const products = useSelector(
    (state) => state.products.data,
  );

  const customers = useSelector((state) =>
    state.parties.data.filter(
      (party) => party.type === "customer",
    ),
  );

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    date: today(),
    customer: "",
    items: [
      {
        product: "",
        quantity: "",
      },
    ],
  });

  // =========================================================
  // LOAD DELIVERY REGISTER
  // =========================================================

  const load = async () => {
    setLoading(true);

    try {
      const response = await api.get(
        "/operations/deliveries",
      );

      setRows(response.data || []);
    } catch (error) {
      setRows([]);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load deliveries",
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
  // CUSTOMER OPTIONS
  // =========================================================

  const customerOptions = customers.map((customer) => ({
    value: customer._id,
    label: `${customer.name} (${customer.code})`,
  }));

  // =========================================================
  // PRODUCT OPTIONS FOR ROW
  // PREVENT DUPLICATE PRODUCT SELECTION
  // =========================================================

  const getProductOptions = (index) => {
    const selectedProducts = form.items
      .filter(
        (_, itemIndex) => itemIndex !== index,
      )
      .map((item) => item.product)
      .filter(Boolean);

    return productOptions.filter(
      (option) =>
        !selectedProducts.includes(option.value),
    );
  };

  // =========================================================
  // UPDATE ITEM
  // =========================================================

  const updateItem = (
    index,
    field,
    value,
  ) => {
    setForm((current) => ({
      ...current,

      items: current.items.map(
        (item, itemIndex) =>
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
  // ADD PRODUCT
  // =========================================================

  const addItem = () => {
    setForm((current) => ({
      ...current,

      items: [
        ...current.items,
        {
          product: "",
          quantity: "",
        },
      ],
    }));
  };

  // =========================================================
  // REMOVE PRODUCT
  // =========================================================

  const removeItem = (index) => {
    setForm((current) => ({
      ...current,

      items:
        current.items.length > 1
          ? current.items.filter(
              (_, itemIndex) =>
                itemIndex !== index,
            )
          : current.items,
    }));
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const submit = async (event) => {
    event.preventDefault();

    // -------------------------------------------------------
    // CUSTOMER VALIDATION
    // -------------------------------------------------------

    if (!form.customer) {
      toast.error("Please select a customer");
      return;
    }

    // -------------------------------------------------------
    // ITEM VALIDATION
    // -------------------------------------------------------

    const invalidItem = form.items.some(
      (item) =>
        !item.product ||
        !item.quantity ||
        Number(item.quantity) <= 0,
    );

    if (invalidItem) {
      toast.error(
        "Please select product and enter valid quantity",
      );
      return;
    }

    setSaving(true);

    try {
      await api.post(
        "/operations/deliveries",
        {
          date: form.date,

          customer: form.customer,

          items: form.items.map(
            (item) => ({
              product: item.product,
              quantity: Number(
                item.quantity,
              ),
            }),
          ),
        },
      );

      // -----------------------------------------------------
      // RESET FORM
      // -----------------------------------------------------

      setForm({
        date: today(),

        customer: "",

        items: [
          {
            product: "",
            quantity: "",
          },
        ],
      });

      // -----------------------------------------------------
      // REFRESH REGISTER
      // -----------------------------------------------------

      await load();

      toast.success(
        "Delivery saved successfully",
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to save delivery",
      );
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
          NEW DELIVERY
      ====================================================== */}

      <section className="panel">

        <div className="panel-head">
          <h3>New Delivery</h3>
        </div>

        <form
          className="form-grid"
          onSubmit={submit}
        >

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
              CUSTOMER
          ================================================== */}

          <label>
            Customer

            <SearchableSelect
              value={form.customer}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,

                  customer: value,
                }))
              }
              options={customerOptions}
              placeholder="Select customer"
            />
          </label>

          {/* =================================================
              PRODUCTS
          ================================================== */}

          <div className="sale-items-wrapper full-width">

            {/* HEADER */}

            <div className="sale-items-header">

              <h4>Items</h4>

              <button
                type="button"
                className="secondary"
                disabled={
                  form.items.length >=
                  products.length
                }
                onClick={addItem}
              >
                <Plus size={16} />

                Add Product
              </button>

            </div>

            {/* ITEMS */}

            <div className="sale-items">

              {form.items.map(
                (item, index) => (
                  <div
                    className="sale-item-row delivery-item-row"
                    key={index}
                  >

                    {/* =====================================
                        PRODUCT
                    ====================================== */}

                    <label className="sale-item-product">

                      Product

                      <SearchableSelect
                        value={
                          item.product
                        }
                        onChange={(
                          value,
                        ) =>
                          updateItem(
                            index,
                            "product",
                            value,
                          )
                        }
                        options={getProductOptions(
                          index,
                        )}
                        placeholder="Select product"
                      />

                    </label>

                    {/* =====================================
                        QUANTITY
                    ====================================== */}

                    <label className="delivery-quantity">

                      Quantity

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={
                          item.quantity
                        }
                        onChange={(
                          event,
                        ) =>
                          updateItem(
                            index,
                            "quantity",
                            event.target
                              .value,
                          )
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
                      onClick={() =>
                        removeItem(
                          index,
                        )
                      }
                      disabled={
                        form.items.length ===
                        1
                      }
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                ),
              )}

            </div>

          </div>

          {/* =================================================
              SAVE
          ================================================== */}

          <button
            className="primary"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Delivery"}
          </button>

        </form>

      </section>

      {/* =====================================================
          DELIVERY REGISTER
      ====================================================== */}

      <section className="panel">

        <div className="panel-head">
          <h3>Delivery Register</h3>
        </div>

        <div className="table-wrapper">

          <table className="table">

            <thead>
              <tr>
                <th>Number</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={row._id}>

                    <td>
                      {row.deliveryNumber}
                    </td>

                    <td>
                      {new Date(
                        row.date,
                      ).toLocaleDateString(
                        "en-IN",
                      )}
                    </td>

                    <td>
                      {row.customer?.name ||
                        "-"}
                    </td>

                    <td>
                      {row.status}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="empty-state"
                  >
                    No deliveries found
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