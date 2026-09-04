import React from "react";
import { Plus, Trash2 } from "lucide-react";

import SearchableSelect from "../common/SearchableSelect";

function PurchaseItems({
  form,
  setForm,
  errors,
  setErrors,
  products,
  productsLoading,
}) {
  const createBlankItem = () => ({
    product: "",
    quantity: 1,
    rate: 0,
    amount: 0,
  });

  const getAvailableProducts = (currentIndex) => {
    const selected = form.items
      .map((item, index) => (index !== currentIndex ? item.product : ""))
      .filter(Boolean);

    return products.filter((product) => !selected.includes(product._id));
  };

  const calculateTotal = (items) =>
    items.reduce((total, item) => total + Number(item.amount || 0), 0);

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, createBlankItem()],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items, amount: calculateTotal(items) };
    });

    setErrors((prev) => {
      const next = { ...prev };
      delete next[`product_${index}`];
      delete next[`quantity_${index}`];
      delete next[`rate_${index}`];
      return next;
    });
  };

  const updateItem = (index, patch) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], ...patch };

      const item = items[index];
      item.amount =
        Number(item.quantity || 0) * Number(item.rate || 0);

      return {
        ...prev,
        items,
        amount: calculateTotal(items),
      };
    });
  };

  const handleProductChange = (index, productId) => {
    const product = products.find((item) => item._id === productId);
    if (!product) return;

    updateItem(index, {
      product: product._id,
      rate: Number(product.purchaseRate ?? product.rate ?? 0),
    });

    setErrors((prev) => ({
      ...prev,
      [`product_${index}`]: "",
    }));
  };

  const handleQuantityChange = (index, value) => {
    updateItem(index, {
      quantity: value === "" ? "" : Number(value),
    });

    setErrors((prev) => ({
      ...prev,
      [`quantity_${index}`]: "",
    }));
  };

  const handleRateChange = (index, value) => {
    updateItem(index, {
      rate: value === "" ? "" : Number(value),
    });

    setErrors((prev) => ({
      ...prev,
      [`rate_${index}`]: "",
    }));
  };

  return (
    <div className="sale-items-wrapper purchase-items-wrapper">
      <div className="sale-items-header">
        <h4>Purchase Items</h4>

        <button
          type="button"
          className="secondary"
          onClick={addItem}
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
          No products added. Click <strong>Add Product</strong>.
        </div>
      ) : (
        <div className="sale-items">
          {form.items.map((item, index) => {
            const options = getAvailableProducts(index);

            return (
              <div className="sale-item-row" key={index}>
                <div className="sale-item-product">
                  <label>
                    Product
                    <SearchableSelect
                      value={item.product}
                      options={options.map((product) => ({
                        value: product._id,
                        label: product.name,
                        rate: product.purchaseRate ?? product.rate ?? 0,
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

                <div className="sale-item-small">
                  <label>
                    Qty
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(index, e.target.value)
                      }
                    />
                    {errors[`quantity_${index}`] && (
                      <small className="error-text">
                        {errors[`quantity_${index}`]}
                      </small>
                    )}
                  </label>
                </div>

                <div className="sale-item-small">
                  <label>
                    Rate
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.rate}
                      onChange={(e) =>
                        handleRateChange(index, e.target.value)
                      }
                    />
                    {errors[`rate_${index}`] && (
                      <small className="error-text">
                        {errors[`rate_${index}`]}
                      </small>
                    )}
                  </label>
                </div>

                <div className="sale-item-small">
                  <label>
                    Amount
                    <input type="text" value={item.amount} readOnly />
                  </label>
                </div>

                <button
                  type="button"
                  className="icon danger"
                  title="Remove product"
                  onClick={() => removeItem(index)}
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
  );
}

export default PurchaseItems;
