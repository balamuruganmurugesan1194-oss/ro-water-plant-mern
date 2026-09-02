import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { getExportHeaders, getExportRows, safeFileName } from "./exportUtils";

// =========================================================
// EXPORT TO PDF
// =========================================================

export const exportToPDF = ({
  data = [],
  columns = [],
  title = "Report",
  fileName = "Report",
  filters = {},
  orientation = "landscape",
  pageSize = "a4",
}) => {
  if (!Array.isArray(data)) {
    console.error("Export PDF: data must be an array");

    return;
  }

  if (!data.length) {
    alert("No data available to export.");

    return;
  }

  // =======================================================
  // DOCUMENT
  // =======================================================

  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: pageSize,
  });

  // =======================================================
  // HEADER
  // =======================================================

  doc.setFontSize(18);

  doc.text("RO WATER PLANT MANAGEMENT", 14, 15);

  doc.setFontSize(13);

  doc.text(title, 14, 23);

  // =======================================================
  // FILTERS
  // =======================================================

  const filterText = Object.entries(filters)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(([key, value]) => `${key}: ${value}`)
    .join("    ");

  if (filterText) {
    doc.setFontSize(9);

    doc.text(filterText, 14, 31);
  }

  // =======================================================
  // TABLE
  // =======================================================

  const headers = getExportHeaders(columns);

  const rows = getExportRows(data, columns);

  autoTable(doc, {
    startY: filterText ? 37 : 31,

    head: [headers],

    body: rows,

    theme: "grid",

    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      overflow: "linebreak",
    },

    headStyles: {
      fontSize: 8,
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },

    margin: {
      left: 10,
      right: 10,
    },

    didDrawPage: () => {
      const pageNumber = doc.internal.getNumberOfPages();

      doc.setFontSize(8);

      doc.text(
        `Page ${pageNumber}`,
        doc.internal.pageSize.getWidth() - 25,
        doc.internal.pageSize.getHeight() - 8,
      );
    },
  });

  // =======================================================
  // FOOTER
  // =======================================================

  const totalPages = doc.internal.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    doc.setFontSize(8);

    doc.text(
      `RO Water Plant Management`,
      10,
      doc.internal.pageSize.getHeight() - 8,
    );

    doc.text(
      `Page ${page} of ${totalPages}`,
      doc.internal.pageSize.getWidth() - 35,
      doc.internal.pageSize.getHeight() - 8,
    );
  }

  // =======================================================
  // DOWNLOAD
  // =======================================================

  doc.save(`${safeFileName(fileName)}.pdf`);
};
