import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import api from "../../api/client";
import Loading from "../../components/common/Loading";
import SearchableSelect from "../../components/common/SearchableSelect";

export default function StockEntry({ type }) {
  const products = useSelector((state) => state.products.data);

  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = type === "opening" ? "Opening Stock" : "Stock Adjustment";

  const options = products.map((product) => ({
    value: product._id,
    label: `${product.name} (${product.code})`,
  }));

  useEffect(() => {
    if (!products.length) {
      setLoading(false);
    }
  }, [products]);

  const submit = async (event) => {
    event.preventDefault();

    setSaving(true);

    try {
      await api.post(
        `/inventory/${type === "opening" ? "opening" : "adjustments"}`,
        {
          ...form,
          quantity: Number(form.quantity),
        },
      );

      setForm({
        productId: "",
        quantity: "",
        notes: "",
      });

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

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="content">
      <section className="panel">
        <div className="panel-head">
          <h3>{title}</h3>
        </div>

        <form className="form-grid" onSubmit={submit}>
          <label>
            Product
            <SearchableSelect
              value={form.productId}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  productId: value,
                }))
              }
              options={options}
              placeholder="Select product"
            />
          </label>

          <label>
            Quantity
            <input
              type="number"
              min={type === "opening" ? "0" : "0.01"}
              step="0.01"
              value={form.quantity}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  quantity: event.target.value,
                }))
              }
              required
            />
          </label>

          <label className="full-width">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
          </label>

          <button className="primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : `Save ${title}`}
          </button>
        </form>
      </section>
    </div>
  );
}
