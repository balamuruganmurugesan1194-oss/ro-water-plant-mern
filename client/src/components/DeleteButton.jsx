import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import DeleteModal from "./DeleteModal";

function DeleteButton({
  onDelete,
  itemName = "this item",
  size = 16,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    try {
      setError("");
      setLoading(true);

      await onDelete();

      setOpen(false);
    } catch (err) {
      console.error("Delete failed:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to delete item"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;

    setError("");
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="icon danger"
        onClick={() => setOpen(true)}
        disabled={loading}
        title="Delete"
      >
        <Trash2 size={size} />
      </button>

      <DeleteModal
        open={open}
        itemName={itemName}
        loading={loading}
        error={error}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export default DeleteButton;