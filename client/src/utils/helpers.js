export const money = (n) =>
  `${Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  })}`;

export const today = () => new Date().toISOString().slice(0, 10);
