import React from "react";
import {
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";

function DeleteModal({
  open,
  itemName,
  loading,
  error,
  onCancel,
  onConfirm,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="delete-modal-overlay"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !loading
        ) {
          onCancel();
        }
      }}
    >
      <div
        className="delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Header */}
        <div className="delete-modal-header">
          <div className="delete-warning-icon">
            <AlertTriangle size={24} />
          </div>

          <button
            type="button"
            className="delete-modal-close"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="delete-modal-body">
          <h3 id="delete-modal-title">
            Delete item?
          </h3>

          <p>
            Are you sure you want to delete
            this item?
          </p>

          <div className="delete-item-box">
            {itemName}
          </div>

          <span className="delete-modal-note">
            This action cannot be undone.
          </span>

          {error && (
            <div className="delete-modal-error">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="delete-modal-footer">
          <button
            type="button"
            className="delete-cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="delete-confirm-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            <Trash2 size={16} />

            {loading
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;