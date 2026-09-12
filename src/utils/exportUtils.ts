/**
 * Utility functions for exporting data to Excel (CSV with UTF-8 BOM) and generating printable PDF reports
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  // Create UTF-8 BOM so Excel opens Arabic text correctly without garbled symbols
  let csvContent = '\uFEFF';
  
  // Add headers
  csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';
  
  // Add rows
  rows.forEach(row => {
    const formattedRow = row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',');
    csvContent += formattedRow + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
