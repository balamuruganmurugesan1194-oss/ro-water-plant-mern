import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import api from "../../api/client";
import Loading from "../../components/common/Loading";
import SearchableSelect from "../../components/common/SearchableSelect";
import { fetchProducts } from "../../App/resourceSlice";

export default function StockEntry({ type }) {
  const dispatch = useDispatch();

  const { data, loading: productsLoading } = useSelector(
    (state) => state.products,
  );

  const products = Array.isArray(data)
    ? data
    : Array.isArray(data?.products)
      ? data.products
      : [];

  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  const title = type === "opening" ? "Opening Stock" : "Stock Adjustment";

  useEffect(() => {
    if (!products.length) {
      dispatch(
        fetchProducts({
          page: 1,
          limit: 1000,
        }),
      );
    }
  }, [dispatch, products.length]);

  const options = products.map((product) => ({
    value: product._id,
    label: `${product.name} (${product.code})`,
  }));

  const submit = async (event) => {
    event.preventDefault();

    if (!form.productId) {
      toast.error("Please select a product");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setSaving(true);

    try {
      await api.post(
        `/inventory/${type === "opening" ? "opening" : "adjustments"}`,
        {
          productId: form.productId,
          quantity: Number(form.quantity),
          notes: form.notes,
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

  if (productsLoading) {
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
              placeholder={
                products.length ? "Select product" : "No products available"
              }
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

          <button
            className="primary"
            type="submit"
            disabled={saving || !products.length}
          >
            {saving ? "Saving..." : `Save ${title}`}
          </button>
        </form>
      </section>
    </div>
  );
}
