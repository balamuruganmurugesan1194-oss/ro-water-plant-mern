export const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

export const today = () => new Date().toISOString().slice(0, 10);
