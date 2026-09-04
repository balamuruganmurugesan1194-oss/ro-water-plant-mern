import Counter from "../models/Counter.js";

export const getNextNumber = async (counterName, prefix, padding = 6) => {
  const counter = await Counter.findOneAndUpdate(
    {
      name: counterName,
    },
    {
      $inc: {
        seq: 1,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  const number = String(counter.seq).padStart(padding, "0");

  return `${prefix}${number}`;
};
