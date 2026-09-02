// =========================================================
// COMMON EXPORT HELPERS
// =========================================================

export const formatExportDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN");
};

export const formatExportCurrency = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const getNestedValue = (object, path) => {
  if (!object || !path) return "";

  return path.split(".").reduce((current, key) => current?.[key], object);
};

export const getExportValue = (row, column) => {
  let value;

  if (typeof column.value === "function") {
    value = column.value(row);
  } else {
    value = getNestedValue(row, column.key);
  }

  if (column.type === "date") {
    return formatExportDate(value);
  }

  if (column.type === "currency") {
    return formatExportCurrency(value);
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

export const prepareExportData = (data = [], columns = []) => {
  return data.map((row, index) => {
    const result = {};

    columns.forEach((column) => {
      const key = column.label || column.key;

      result[key] = getExportValue(row, column);
    });

    return result;
  });
};

export const getExportHeaders = (columns = []) => {
  return columns.map((column) => column.label || column.key);
};

export const getExportRows = (data = [], columns = []) => {
  return data.map((row) =>
    columns.map((column) => getExportValue(row, column)),
  );
};

export const calculateColumnTotal = (data = [], key) => {
  return data.reduce((total, row) => {
    const value =
      typeof key === "function" ? key(row) : getNestedValue(row, key);

    return total + Number(value || 0);
  }, 0);
};

export const safeFileName = (fileName) => {
  return String(fileName || "Export")
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_");
};
