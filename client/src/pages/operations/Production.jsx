import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import api from "../../api/client";
import { fetchProducts } from "../../app/resourceSlice";
import SearchableSelect from "../../components/common/SearchableSelect";
import Loading from "../../components/common/Loading";
import { today } from "../../utils/helpers";

export default function Production() {
  const dispatch = useDispatch();

  const products = useSelector(
    (state) => state.products.data,
  );

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    date: today(),
    output: "",
    outputQuantity: "",
    inputs: [
      {
        product: "",
        quantity: "",
      },
    ],
  });

  // =========================================================
  // LOAD PRODUCTION
  // =========================================================

  const load = async () => {
    setLoading(true);

    try {
      const response = await api.get("/production");

      setRows(response.data || []);
    } catch (error) {
      setRows([]);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load production records",
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
  // INPUT PRODUCT OPTIONS
  // PREVENT DUPLICATE INPUT PRODUCTS
  // =========================================================

  const getInputOptions = (index) => {
    const selectedProducts = form.inputs
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
  // UPDATE INPUT
  // =========================================================

  const updateInput = (
    index,
    field,
    value,
  ) => {
    setForm((current) => ({
      ...current,

      inputs: current.inputs.map(
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
  // ADD INPUT
  // =========================================================

  const addInput = () => {
    setForm((current) => ({
      ...current,

      inputs: [
        ...current.inputs,
        {
          product: "",
          quantity: "",
        },
      ],
    }));
  };

  // =========================================================
  // REMOVE INPUT
  // =========================================================

  const removeInput = (index) => {
    setForm((current) => ({
      ...current,

      inputs:
        current.inputs.length > 1
          ? current.inputs.filter(
              (_, itemIndex) =>
                itemIndex !== index,
            )
          : current.inputs,
    }));
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const submit = async (event) => {
    event.preventDefault();

    // -------------------------------------------------------
    // OUTPUT VALIDATION
    // -------------------------------------------------------

    if (!form.output) {
      toast.error("Please select output product");
      return;
    }

    if (
      !form.outputQuantity ||
      Number(form.outputQuantity) <= 0
    ) {
      toast.error(
        "Please enter a valid output quantity",
      );
      return;
    }

    // -------------------------------------------------------
    // INPUT VALIDATION
    // -------------------------------------------------------

    const invalidInput = form.inputs.some(
      (item) =>
        !item.product ||
        !item.quantity ||
        Number(item.quantity) <= 0,
    );

    if (invalidInput) {
      toast.error(
        "Please select input product and enter valid quantity",
      );
      return;
    }

    setSaving(true);

    try {
      await api.post("/production", {
        date: form.date,

        output: {
          product: form.output,
          quantity: Number(
            form.outputQuantity,
          ),
        },

        inputs: form.inputs.map(
          (item) => ({
            product: item.product,
            quantity: Number(
              item.quantity,
            ),
          }),
        ),
      });

      // -----------------------------------------------------
      // RESET FORM
      // -----------------------------------------------------

      setForm({
        date: today(),
        output: "",
        outputQuantity: "",
        inputs: [
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
        "Production saved successfully",
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to save production",
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
          NEW PRODUCTION
      ====================================================== */}

      <section className="panel">

        <div className="panel-head">
          <h3>New Production</h3>
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
              OUTPUT PRODUCT
          ================================================== */}

          <label>
            Output Product

            <SearchableSelect
              value={form.output}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  output: value,
                }))
              }
              options={productOptions}
              placeholder="Select output"
            />
          </label>

          {/* =================================================
              OUTPUT QUANTITY
          ================================================== */}

          <label>
            Output Quantity

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.outputQuantity}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  outputQuantity:
                    event.target.value,
                }))
              }
              required
            />
          </label>

          {/* =================================================
              INPUT MATERIALS
          ================================================== */}

          <div className="sale-items-wrapper full-width">

            <div className="sale-items-header">

              <h4>Input Materials</h4>

              <button
                type="button"
                className="secondary"
                disabled={
                  form.inputs.length >=
                  products.length
                }
                onClick={addInput}
              >
                <Plus size={16} />
                Add Input
              </button>

            </div>

            <div className="sale-items">

              {form.inputs.map(
                (item, index) => (
                  <div
                    className="sale-item-row production-item-row"
                    key={index}
                  >

                    {/* =====================================
                        INPUT PRODUCT
                    ====================================== */}

                    <label className="sale-item-product">
                      Input Product

                      <SearchableSelect
                        value={
                          item.product
                        }
                        onChange={(
                          value,
                        ) =>
                          updateInput(
                            index,
                            "product",
                            value,
                          )
                        }
                        options={getInputOptions(
                          index,
                        )}
                        placeholder="Select input"
                      />
                    </label>

                    {/* =====================================
                        QUANTITY
                    ====================================== */}

                    <label className="production-quantity">
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
                          updateInput(
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
                      title="Remove input"
                      aria-label="Remove input"
                      onClick={() =>
                        removeInput(
                          index,
                        )
                      }
                      disabled={
                        form.inputs.length ===
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
            type="submit"
            className="primary"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Production"}
          </button>

        </form>

      </section>

      {/* =====================================================
          PRODUCTION REGISTER
      ====================================================== */}

      <section className="panel">

        <div className="panel-head">
          <h3>Production Register</h3>
        </div>

        <div className="table-wrapper">

          <table className="table">

            <thead>
              <tr>
                <th>Number</th>
                <th>Date</th>
                <th>Output</th>
                <th>Quantity</th>
              </tr>
            </thead>

            <tbody>

              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={row._id}>

                    <td>
                      {row.productionNumber}
                    </td>

                    <td>
                      {new Date(
                        row.date,
                      ).toLocaleDateString(
                        "en-IN",
                      )}
                    </td>

                    <td>
                      {row.output?.product
                        ?.name || "-"}
                    </td>

                    <td>
                      {row.output?.quantity ??
                        "-"}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="empty-state"
                  >
                    No production records found
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