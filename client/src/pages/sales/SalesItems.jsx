import React from "react";
import { Plus, Trash2 } from "lucide-react";

import SearchableSelect from "../../components/SearchableSelect";

function SaleItems({
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
    const selectedProducts = form.items
      .map((item, index) =>
        index !== currentIndex
          ? item.product
          : ""
      )
      .filter(Boolean);

    return products.filter(
      (product) =>
        !selectedProducts.includes(product._id)
    );
  };

  const addProductItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        createBlankItem(),
      ],
    }));

    setErrors((prev) => ({
      ...prev,
      items: "",
    }));
  };

  const removeProductItem = (index) => {
    setForm((prev) => {
      const items = prev.items.filter(
        (_, i) => i !== index
      );

      const totalAmount = items.reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );

      return {
        ...prev,
        items,
        amount: totalAmount,
      };
    });
  };

  const handleProductChange = (
    index,
    productId
  ) => {
    const product = products.find(
      (item) => item._id === productId
    );

    if (!product) return;

    setForm((prev) => {
      const items = [...prev.items];

      const quantity = Number(
        items[index]?.quantity || 1
      );

      const rate = Number(
        product.rate || 0
      );

      items[index] = {
        ...items[index],
        product: product._id,
        quantity,
        rate,
        amount: quantity * rate,
      };

      const totalAmount = items.reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
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

  const handleQuantityChange = (
    index,
    value
  ) => {
    const quantity =
      value === "" ? "" : Number(value);

    setForm((prev) => {
      const items = [...prev.items];
      const item = items[index];

      if (!item) return prev;

      const amount =
        quantity === ""
          ? 0
          : quantity * Number(item.rate || 0);

      items[index] = {
        ...item,
        quantity,
        amount,
      };

      const totalAmount = items.reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
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

  return (
    <div className="sale-items-wrapper">

      <div className="sale-items-header">
        <h4>Products</h4>

        <button
          type="button"
          className="secondary"
          onClick={addProductItem}
          disabled={
            productsLoading ||
            form.items.length >= products.length
          }
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {productsLoading ? (
        <div className="product-loading">
          Loading products...
        </div>
      ) : form.items.length === 0 ? (
        <div className="empty-state">
          No products added. Click{" "}
          <strong>Add Product</strong>.
        </div>
      ) : (
        <div className="sale-items">

          {form.items.map((item, index) => {
            const availableProducts =
              getAvailableProducts(index);

            return (
              <div
                className="sale-item-row"
                key={index}
              >

                {/* PRODUCT */}

                <div className="sale-item-product">
                  <label>
                    Product

                    <SearchableSelect
                      value={item.product}
                      options={availableProducts.map(
                        (product) => ({
                          value: product._id,
                          label: product.name,
                          rate: product.rate,
                        })
                      )}
                      placeholder="Select Product"
                      error={
                        !!errors[
                          `product_${index}`
                        ]
                      }
                      onChange={(value) =>
                        handleProductChange(
                          index,
                          value
                        )
                      }
                      renderOption={(option) => (
                        <div className="product-option">
                          <span>
                            {option.label}
                          </span>

                          <span className="product-rate">
                            ₹{option.rate}
                          </span>
                        </div>
                      )}
                    />

                    {errors[
                      `product_${index}`
                    ] && (
                      <small className="error-text">
                        {
                          errors[
                            `product_${index}`
                          ]
                        }
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
                      onChange={(e) =>
                        handleQuantityChange(
                          index,
                          e.target.value
                        )
                      }
                    />
                  </label>
                </div>

                {/* RATE */}

                <div className="sale-item-small">
                  <label>
                    Rate

                    <input
                      type="number"
                      value={item.rate}
                      readOnly
                    />
                  </label>
                </div>

                {/* AMOUNT */}

                <div className="sale-item-small">
                  <label>
                    Amount

                    <input
                      type="text"
                      value={item.amount}
                      readOnly
                    />
                  </label>
                </div>

                {/* DELETE */}

                <button
                  type="button"
                  className="icon danger"
                  title="Remove product"
                  onClick={() =>
                    removeProductItem(index)
                  }
                >
                  <Trash2 size={18} />
                </button>

              </div>
            );
          })}

        </div>
      )}

      {errors.items && (
        <small className="error-text">
          {errors.items}
        </small>
      )}

    </div>
  );
}

export default SaleItems;