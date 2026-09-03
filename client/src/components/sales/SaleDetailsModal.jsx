import React from "react";
import { X } from "lucide-react";
import { money } from "../../utils/helpers";

function SaleDetailsModal({ sale, onClose }) {
  if (!sale) {
    return null;
  }

  const items = sale.items || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal sale-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="modal-head">
          <div>
            <h3>Sale Details</h3>

            <p>
              {sale.customerName || "Customer"} -{" "}
              {sale.date
                ? new Date(sale.date).toLocaleDateString("en-IN")
                : "—"}
            </p>
          </div>

          <button
            type="button"
            className="icon"
            onClick={onClose}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* SALE INFORMATION */}
        <div className="sale-detail-info">
          <div>
            <span>Date</span>
            <strong>
              {sale.date
                ? new Date(sale.date).toLocaleDateString("en-IN")
                : "—"}
            </strong>
          </div>

          <div>
            <span>Type</span>
            <strong>{sale.type || "—"}</strong>
          </div>

          <div>
            <span>Customer</span>
            <strong>{sale.customerName || "—"}</strong>
          </div>

          <div>
            <span>Payment</span>
            <strong>{sale.paymentMode || "—"}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{sale.paymentStatus || "—"}</strong>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="sale-detail-products">
          <h4>Products</h4>

          {items.length > 0 ? (
            <div className="detail-table-wrapper">
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => {
                    const productName =
                      item.product?.name ||
                      item.product?.code ||
                      (typeof item.product === "string" ? item.product : "—");

                    const quantity = Number(item.quantity || 0);
                    const rate = Number(item.rate || 0);

                    const amount = Number(item.amount || 0) || quantity * rate;

                    return (
                      <tr key={item._id || index}>
                        <td>{index + 1}</td>

                        <td>{productName}</td>

                        <td>{quantity}</td>

                        <td>{money(rate)}</td>

                        <td>{money(amount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No products found.</div>
          )}
        </div>

        {/* TOTAL */}
        <div className="sale-detail-total">
          <span>Total Amount</span>

          <strong>{money(sale.amount || 0)}</strong>
        </div>

        {/* NOTES */}
        {sale.notes && (
          <div className="sale-detail-notes">
            <span>Notes</span>
            <p>{sale.notes}</p>
          </div>
        )}

        {/* FOOTER */}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaleDetailsModal;
