import * as XLSX from 'xlsx';

export const exportResultsToExcel = (data, fileName = "Results_Report") => {
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  
  // Save file
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
