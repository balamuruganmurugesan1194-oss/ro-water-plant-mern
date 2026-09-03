import React from "react";

import {
  PictureAsPdf,
  TableView,
} from "@mui/icons-material";

import { exportToExcel } from "../../utils/exportExcel";
import { exportToPDF } from "../../utils/exportPdf";

function ExportButtons({
  data = [],
  columns = [],
  title = "Report",
  fileName = "Report",
  sheetName = "Report",
  filters = {},
  orientation = "landscape",
}) {
  const handleExcelExport = () => {
    exportToExcel({
      data,
      columns,
      title,
      fileName,
      sheetName,
      filters,
    });
  };

  const handlePDFExport = () => {
    exportToPDF({
      data,
      columns,
      title,
      fileName,
      filters,
      orientation,
    });
  };

  const disabled =
    !Array.isArray(data) ||
    data.length === 0;

  return (
    <div className="export-buttons">
      {/* EXCEL */}
      <button
        type="button"
        className="export-btn export-excel"
        onClick={handleExcelExport}
        disabled={disabled}
        title="Export to Excel"
        aria-label="Export to Excel"
      >
        <TableView fontSize="small" />
        <span>Excel</span>
      </button>

      {/* PDF */}
      <button
        type="button"
        className="export-btn export-pdf"
        onClick={handlePDFExport}
        disabled={disabled}
        title="Export to PDF"
        aria-label="Export to PDF"
      >
        <PictureAsPdf fontSize="small" />
        <span>PDF</span>
      </button>
    </div>
  );
}

export default ExportButtons;