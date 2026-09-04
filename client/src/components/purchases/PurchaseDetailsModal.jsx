import React from "react";
import { X } from "lucide-react";
import { money } from "../../utils/helpers";

function PurchaseDetailsModal({ purchase, onClose }) {
  if (!purchase) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h3>Purchase Details</h3>
            <small>{purchase.purchaseNumber}</small>
          </div>

          <button type="button" className="icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div>
              <span>Supplier</span>
              <strong>{purchase.supplierName}</strong>
            </div>
            <div>
              <span>Date</span>
              <strong>
                {new Date(purchase.date).toLocaleDateString("en-IN")}
              </strong>
            </div>
            <div>
              <span>Payment</span>
              <strong>{purchase.paymentMode}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{purchase.paymentStatus}</strong>
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(purchase.items || []).map((item) => (
                  <tr key={item._id}>
                    <td>{item.product?.name || "Product"}</td>
                    <td>{item.quantity}</td>
                    <td>{money(item.rate)}</td>
                    <td>{money(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sale-total">
            <span>Total Amount</span>
            <strong>{money(purchase.amount)}</strong>
          </div>

          {purchase.notes && (
            <div className="notes-box">
              <b>Notes</b>
              <p>{purchase.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PurchaseDetailsModal;
