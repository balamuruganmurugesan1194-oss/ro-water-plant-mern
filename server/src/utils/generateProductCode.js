import Counter from "../models/counter.js";

const generateProductCode = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "product" },
    {
      $inc: {
        sequence: 1,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return `PROD-${String(counter.sequence).padStart(4, "0")}`;
};

export default generateProductCode;