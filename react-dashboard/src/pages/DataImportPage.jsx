import React from 'react'; // Removed useState

// --- Import Chart.js components ---
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// --- Register the components for the Pie chart ---
ChartJS.register(ArcElement, Tooltip, Legend);

// --- Mock data for the pie chart (Export data removed) ---
const importChartData = {
  labels: ['Completed', 'Failed', 'Pending'],
  datasets: [
    {
      label: '# of Imports',
      data: [122, 15, 30],
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)', // Blue
        'rgba(255, 99, 132, 0.7)', // Red
        'rgba(255, 206, 86, 0.7)', // Yellow
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

// --- Mock data for the preview table ---
const previewTableData = [
  { id: '1001', category: 'Wireless', value: 85000, date: '2025-10-20' },
  { id: '1002', category: 'Transport', value: 32000, date: '2025-10-20' },
  { id: '1003', category: 'Wireline', value: 68000, date: '2025-10-21' },
  { id: '1004', category: 'Wireless', value: 7500, date: '2025-10-21' },
  { id: '1005', category: 'Transport', value: 12000, date: '2025-10-22' },
];

// --- This is your Data Import Page Component ---
function DataImportPage() {
  // The [chartView] state has been removed

  return (
    <div className="data-import-layout">
      <div className="content-wrapper">
        
        {/* This is the large main panel on the left */}
        <section className="main-panel">
          <h2>Data Preview</h2>
          <p>When you upload an Excel file, a preview will be shown here before you import it.</p>
          
          <div className="data-preview-table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Value</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {previewTableData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.category}</td>
                    <td>{row.value.toLocaleString()}</td>
                    <td>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        
        {/* This is the smaller panel on the right */}
        <aside className="side-panel">
          
          {/* --- MODIFIED: Import Action Button (Export removed) --- */}
          <div className="action-buttons">
            <button className="btn btn-primary">Upload & Import</button>
          </div>

          {/* --- MODIFIED: Statistics Section --- */}
          <div className="statistics-container">
            <h3>Import Statistics</h3>
            
            {/* The chart-toggle div has been removed */}
            
            {/* --- MODIFIED: Pie Chart --- */}
            <div className="chart-wrapper">
              <Pie 
                data={importChartData} // Data is no longer conditional
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'left', // <-- MOVES LEGEND TO THE LEFT
                    },
                  },
                }}
              />
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}

export default DataImportPage;