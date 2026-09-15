import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
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
    items: [{ product: "", quantity: "", rate: "" }],
  });
  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get("/purchases");
      setRows(response.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    dispatch(fetchProducts({ active: true }));
    dispatch(fetchParties({}));
    load();
  }, [dispatch]);
  const updateItem = (index, field, value) =>
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/purchases", {
        date: form.date,
        supplier: form.supplier || null,
        items: form.items.map((item) => ({
          product: item.product,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        })),
      });
      setForm({
        date: today(),
        supplier: "",
        items: [{ product: "", quantity: "", rate: "" }],
      });
      await load();
      alert("Purchase saved successfully");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to save purchase");
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <Loading />;
  const productOptions = products.map((product) => ({
    value: product._id,
    label: `${product.name} (${product.code})`,
  }));
  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier._id,
    label: `${supplier.name} (${supplier.code})`,
  }));
  const getProductOptions = (index) => {
    const selected = form.items
      .filter((_, itemIndex) => itemIndex !== index)
      .map((item) => item.product)
      .filter(Boolean);

    return productOptions.filter((option) => !selected.includes(option.value));
  };
  return (
    <div className="content">
      <section className="panel">
        <div className="panel-head">
          <h3>New Purchase</h3>
        </div>
        <form className="form-grid" onSubmit={submit}>
          <label>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((current) => ({ ...current, date: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Supplier
            <SearchableSelect
              value={form.supplier}
              onChange={(value) =>
                setForm((current) => ({ ...current, supplier: value }))
              }
              options={supplierOptions}
              placeholder="Select supplier"
            />
          </label>
          <div className="sale-items-wrapper full-width">
            <div className="sale-items-header">
              <h4>Items</h4>
              <button
                type="button"
                className="secondary"
                disabled={form.items.length >= products.length}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    items: [
                      ...current.items,
                      { product: "", quantity: "", rate: "" },
                    ],
                  }))
                }
              >
                Add Item
              </button>
            </div>
            {form.items.map((item, index) => (
              <div className="sale-item-row" key={index}>
                <label className="sale-item-product">
                  Product
                  <SearchableSelect
                    value={item.product}
                    onChange={(value) => updateItem(index, "product", value)}
                    options={getProductOptions(index)}
                    placeholder="Select product"
                  />
                </label>
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
                <button
                  type="button"
                  className="icon danger"
                  title="Remove product"
                  aria-label="Remove product"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      items:
                        current.items.length > 1
                          ? current.items.filter(
                              (_, itemIndex) => itemIndex !== index,
                            )
                          : current.items,
                    }))
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button className="primary" disabled={saving}>
            Save Purchase
          </button>
        </form>
      </section>
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
              {rows.map((row) => (
                <tr key={row._id}>
                  <td>{row.purchaseNumber}</td>
                  <td>{new Date(row.date).toLocaleDateString("en-IN")}</td>
                  <td>{row.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
