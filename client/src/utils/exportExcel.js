import * as XLSX from "xlsx";

import { prepareExportData, safeFileName } from "./exportUtils";

// =========================================================
// EXPORT TO EXCEL
// =========================================================

export const exportToExcel = ({
  data = [],
  columns = [],
  title = "Report",
  fileName = "Report",
  sheetName = "Report",
  filters = {},
}) => {
  if (!Array.isArray(data)) {
    console.error("Export Excel: data must be an array");

    return;
  }

  if (!data.length) {
    alert("No data available to export.");

    return;
  }

  // =======================================================
  // DATA
  // =======================================================

  const rows = prepareExportData(data, columns);

  // =======================================================
  // WORKSHEET
  // =======================================================

  const worksheet = XLSX.utils.json_to_sheet([]);

  // Title
  XLSX.utils.sheet_add_aoa(worksheet, [[title]], {
    origin: "A1",
  });

  // Filters
  const filterRows = Object.entries(filters)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(([key, value]) => [`${key}:`, value]);

  if (filterRows.length) {
    XLSX.utils.sheet_add_aoa(worksheet, filterRows, {
      origin: "A3",
    });
  }

  const headerRow = filterRows.length + 5;

  // Table data
  XLSX.utils.sheet_add_json(worksheet, rows, {
    origin: `A${headerRow}`,
    skipHeader: false,
  });

  // =======================================================
  // COLUMN WIDTH
  // =======================================================

  worksheet["!cols"] = columns.map((column) => ({
    wch: Math.max(
      12,
      Math.min(35, String(column.label || column.key || "").length + 5),
    ),
  }));

  // =======================================================
  // FREEZE HEADER
  // =======================================================

  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: headerRow,
  };

  // =======================================================
  // WORKBOOK
  // =======================================================

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));

  // =======================================================
  // DOWNLOAD
  // =======================================================

  XLSX.writeFile(workbook, `${safeFileName(fileName)}.xlsx`);
};
