import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import api from "../../api/client";
import { fetchParties, fetchProducts } from "../../app/resourceSlice";
import Loading from "../common/Loading";
import SearchableSelect from "../common/SearchableSelect";
import { today } from "../../utils/helpers";

const blankItem = (withRate = false) => ({
  product: "",
  quantity: "",
  ...(withRate ? { rate: "" } : {}),
});

export default function OperationResourcePage({ type }) {
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products.data);
  const parties = useSelector((state) => state.parties.data);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    date: today(),
    party: "",
    output: "",
    outputQuantity: "",
    items: [blankItem(type === "purchases")],
  });

  const isOutstanding = type.includes("outstanding");
  const isPurchase = type === "purchases";
  const isProduction = type === "production";
  const isDelivery = type === "deliveries";
  const isJar = type === "jars";

  const title = {
    purchases: "Purchase",
    production: "Production",
    deliveries: "Delivery",
    jars: "Empty Jar",
    "customer-outstanding": "Customer Outstanding",
    "supplier-outstanding": "Supplier Outstanding",
  }[type];

  const load = async () => {
    setLoading(true);

    try {
      const endpoint = isOutstanding
        ? `/reports/${type}`
        : isPurchase
          ? "/purchases"
          : isProduction
            ? "/production"
            : `/operations/${type}`;

      const response = await api.get(endpoint);

      setRows(response.data || []);
    } catch (error) {
      setRows([]);

      toast.error(
        error?.response?.data?.message ||
          `Failed to load ${title.toLowerCase()} records`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchProducts({ active: true }));
    dispatch(fetchParties({}));
    load();
  }, [dispatch, type]);

  const update = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

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

  const addItem = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, blankItem(isPurchase)],
    }));
  };

  const removeItem = (index) => {
    setForm((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setSaving(true);

    try {
      if (isPurchase) {
        await api.post("/purchases", {
          date: form.date,
          supplier: form.party || null,
          items: form.items.map((item) => ({
            product: item.product,
            quantity: Number(item.quantity),
            rate: Number(item.rate),
          })),
        });
      }

      if (isProduction) {
        await api.post("/production", {
          date: form.date,
          output: {
            product: form.output,
            quantity: Number(form.outputQuantity),
          },
          inputs: form.items.map((item) => ({
            product: item.product,
            quantity: Number(item.quantity),
          })),
        });
      }

      if (isDelivery) {
        await api.post("/operations/deliveries", {
          date: form.date,
          customer: form.party,
          items: form.items.map((item) => ({
            product: item.product,
            quantity: Number(item.quantity),
          })),
        });
      }

      if (isJar) {
        await api.post("/operations/jars", {
          date: form.date,
          customer: form.party,
          type: "issued",
          quantity: Number(form.items[0].quantity),
        });
      }

      setForm({
        date: today(),
        party: "",
        output: "",
        outputQuantity: "",
        items: [blankItem(isPurchase)],
      });

      await load();

      toast.success(`${title} saved successfully`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          `Failed to save ${title.toLowerCase()}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const customerOptions = parties
    .filter((party) => party.type === "customer")
    .map((party) => ({
      value: party._id,
      label: `${party.name} (${party.code})`,
    }));

  const supplierOptions = parties
    .filter((party) => party.type === "supplier")
    .map((party) => ({
      value: party._id,
      label: `${party.name} (${party.code})`,
    }));

  const productOptions = products.map((product) => ({
    value: product._id,
    label: `${product.name} (${product.code})`,
  }));

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="content">
      {!isOutstanding && (
        <section className="panel">
          <div className="panel-head">
            <h3>New {title}</h3>
          </div>

          <form className="form-grid" onSubmit={submit}>
            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(event) => update("date", event.target.value)}
                required
              />
            </label>

            {(isPurchase || isDelivery || isJar) && (
              <label>
                {isPurchase ? "Supplier" : "Customer"}

                <SearchableSelect
                  value={form.party}
                  onChange={(value) => update("party", value)}
                  options={isPurchase ? supplierOptions : customerOptions}
                  placeholder={`Select ${isPurchase ? "supplier" : "customer"}`}
                />
              </label>
            )}

            {isProduction && (
              <>
                <label>
                  Output Product
                  <SearchableSelect
                    value={form.output}
                    onChange={(value) => update("output", value)}
                    options={productOptions}
                    placeholder="Select output"
                  />
                </label>

                <label>
                  Output Quantity
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.outputQuantity}
                    onChange={(event) =>
                      update("outputQuantity", event.target.value)
                    }
                    required
                  />
                </label>
              </>
            )}

            <div className="full-width">
              <div className="sale-items-header">
                <h4>{isJar ? "Jar Quantity" : "Items"}</h4>

                {!isJar && (
                  <button type="button" className="secondary" onClick={addItem}>
                    Add Item
                  </button>
                )}
              </div>

              {form.items.map((item, index) => (
                <div className="sale-item-row" key={index}>
                  <label className="sale-item-product">
                    Product
                    <SearchableSelect
                      value={item.product}
                      onChange={(value) => updateItem(index, "product", value)}
                      options={productOptions}
                      placeholder="Select product"
                    />
                  </label>

                  <label className="sale-item-small">
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

                  {isPurchase && (
                    <label className="sale-item-small">
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
                  )}

                  {!isJar && (
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => removeItem(index)}
                      disabled={form.items.length === 1}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" className="primary" disabled={saving}>
              {saving ? "Saving..." : `Save ${title}`}
            </button>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="panel-head">
          <h3>{title} Register</h3>
        </div>

        <OperationTable type={type} rows={rows} />
      </section>
    </div>
  );
}

function OperationTable({ type, rows }) {
  if (!rows.length) {
    return <div className="empty-state">No records found.</div>;
  }

  let headers = ["Number", "Date", "Details"];

  let values = (row) => [
    row.purchaseNumber || row.productionNumber || row.deliveryNumber || "-",
    new Date(row.date).toLocaleDateString("en-IN"),
    row.totalAmount || row.status || "-",
  ];

  if (type.includes("outstanding")) {
    headers = ["Party", "Code", "Billed", "Paid", "Outstanding"];

    values = (row) => [
      row.party?.name,
      row.party?.code,
      row.billed,
      row.paid,
      row.outstanding,
    ];
  }

  if (type === "jars") {
    headers = ["Customer", "Code", "Issued", "Returned", "Outstanding"];

    values = (row) => [
      row.customer,
      row.code,
      row.issued,
      row.returned,
      row.outstanding,
    ];
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={row._id || index}>
              {values(row).map((value, cellIndex) => (
                <td key={cellIndex}>{value ?? "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
