import Inventory from "../models/Inventory.js";
import StockMovement from "../models/StockMovement.js";

const getUserId = (req) => req?.user?.id || req?.user?._id || null;

export const changeStock = async ({
  productId,
  quantity,
  type,
  referenceId = null,
  referenceNumber = "",
  reason = "",
  req = null,
}) => {
  const change = Number(quantity);

  if (!Number.isFinite(change) || change === 0) {
    throw new Error("Stock change must be a non-zero number");
  }

  const current = await Inventory.findOne({ product: productId }).lean();
  const currentQuantity = Number(current?.quantity || 0);
  const nextQuantity = currentQuantity + change;

  if (nextQuantity < 0) {
    throw new Error("Insufficient stock");
  }

  const inventory = await Inventory.findOneAndUpdate(
    { product: productId },
    {
      $inc: { quantity: change },
      $set: { updatedBy: getUserId(req) },
      $setOnInsert: { product: productId, minimumStock: 0 },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await StockMovement.create({
    product: productId,
    type,
    quantity: change,
    balanceAfter: nextQuantity,
    referenceId,
    referenceNumber,
    reason,
    createdBy: getUserId(req),
  });

  return inventory;
};
