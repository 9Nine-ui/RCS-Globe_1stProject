// import React, { useState, useRef } from 'react';
// import ImportModal from '../components/ImportModal.jsx';
// import { Pie } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// // --- Register Chart.js components ---
// ChartJS.register(ArcElement, Tooltip, Legend);

// // --- Mock data for the pie chart ---
// const importChartData = {
//   labels: ['Completed', 'Failed', 'Pending'],
//   datasets: [
//     {
//       label: '# of Imports',
//       data: [122, 15, 30],
//       backgroundColor: [
//         'rgba(54, 162, 235, 0.7)', // Blue
//         'rgba(255, 99, 132, 0.7)', // Red
//         'rgba(255, 206, 86, 0.7)', // Yellow
//       ],
//       borderColor: [
//         'rgba(54, 162, 235, 1)',
//         'rgba(255, 99, 132, 1)',
//         'rgba(255, 206, 86, 1)',
//       ],
//       borderWidth: 1,
//     },
//   ],
// };

// // --- Mock data for the preview table ---
// const previewTableData = [
//   { id: '1001', category: 'Wireless', value: 85000, date: '2025-10-20' },
//   { id: '1002', category: 'Transport', value: 32000, date: '2025-10-20' },
//   { id: '1003', category: 'Wireline', value: 68000, date: '2025-10-21' },
//   { id: '1004', category: 'Wireless', value: 7500, date: '2025-10-21' },
//   { id: '1005', category: 'Transport', value: 12000, date: '2025-10-22' },
// ];

// // --- Data Import Page Component ---
// function DataImportPage() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentPreviewFile, setCurrentPreviewFile] = useState(null);

//   // Function to open the modal
//   const handleOpenModal = () => {
//     setIsModalOpen(true);
//   };

//   // Function to handle the import confirmation from the modal
//   const handleImportConfirm = (file) => {
//     setCurrentPreviewFile(file);
//     alert(`File selected for preview: ${file.name}`);
//   };

//   // Function for the trash icon (clear preview)
//   const handleClearPreview = () => {
//     setCurrentPreviewFile(null);
//     alert('Preview cleared!');
//   };

//   // Function for the delete icon (delete selected rows)
//   const handleDeleteSelected = () => {
//     alert('Delete Selected Rows clicked!');
//     // Add logic here to determine which rows are checked and delete them
//   };

//   return (
//     <div className="data-import-layout">
//       {/* --- Import Modal --- */}
//       <ImportModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onImportConfirm={handleImportConfirm}
//       />

//       {/* --- Content Wrapper --- */}
//       <div className="content-wrapper">

//         {/* --- Main Panel --- */}
//         <section className="main-panel">
//           {/* --- Header for Data Preview --- */}
//           <div className="data-preview-header">
//             <h2>Data Preview</h2>
//             {/* --- Container for Buttons --- */}
//             <div className="preview-header-buttons">
//               {/* Trash icon only shows if there's data to clear */}
//               {currentPreviewFile && (
//                 <button className="clear-preview-btn icon-btn" onClick={handleClearPreview} title="Clear Preview">
//                   <span className="material-icons">delete_outline</span>
//                 </button>
//               )}
//               {/* --- DELETE ICON BUTTON --- */}
//               {currentPreviewFile && ( // Only show if there's a preview
//                  <button className="delete-rows-btn icon-btn" onClick={handleDeleteSelected} title="Delete Selected Rows">
//                    <span className="material-icons">delete</span>
//                  </button>
//               )}
//               {/* --- END DELETE BUTTON --- */}
//             </div>
//           </div>
//           <p>
//             {currentPreviewFile
//               ? `Previewing: ${currentPreviewFile.name}`
//               : 'Import an Excel file to see a preview.'}
//           </p>

//           {/* --- Preview Table --- */}
//           <div className="data-preview-table-container">
//             <table>
//               <thead>
//                 <tr>
//                   <th><input type="checkbox" /></th>
//                   <th>ID</th>
//                   <th>Category</th>
//                   <th>Value</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {previewTableData.map((row) => (
//                   <tr key={row.id}>
//                     <td><input type="checkbox" /></td>
//                     <td>{row.id}</td>
//                     <td>{row.category}</td>
//                     <td>{row.value.toLocaleString()}</td>
//                     <td>{row.date}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </section>

//         {/* --- Side Panel --- */}
//         <aside className="side-panel">
//           {/* --- Import Button --- */}
//           <div className="action-buttons">
//             <button
//               className="btn btn-primary"
//               onClick={handleOpenModal}
//             >
//               Import Data
//             </button>
//           </div>

//           {/* --- Statistics Section --- */}
//           <div className="statistics-container">
//             <h3>Import Statistics</h3>
//             <div className="chart-wrapper">
//               <Pie
//                 data={importChartData}
//                 options={{
//                   responsive: true,
//                   maintainAspectRatio: false,
//                   plugins: {
//                     legend: {
//                       position: 'left',
//                     },
//                   },
//                 }}
//               />
//             </div>
//           </div>
//         </aside>

//       </div>
//     </div>
//   );
// }

// export default DataImportPage;

import React, { useState } from 'react';
import ImportModal from '../components/ImportModal.jsx';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// ...existing code...

// --- Register Chart.js components ---
ChartJS.register(ArcElement, Tooltip, Legend);

// --- Mock data for the pie chart ---
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

// --- Data Import Page Component ---
function DataImportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPreviewFile, setCurrentPreviewFile] = useState(null);

  const handleOpenModal = () => setIsModalOpen(true);

  const handleImportConfirm = (file) => {
    setCurrentPreviewFile(file);
    // Replace alerts with app notifications as needed
    alert(`File selected for preview: ${file.name}`);
    setIsModalOpen(false);
  };

  const handleClearPreview = () => {
    setCurrentPreviewFile(null);
    alert('Preview cleared!');
  };

  const handleDeleteSelected = () => {
    // Wire up actual delete logic when row-selection state exists.
    alert('Delete Selected Rows clicked!');
  };

  return (
    <div className="data-import-layout">
      <ImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImportConfirm={handleImportConfirm}
      />

      <div className="content-wrapper">
        <section className="main-panel">
          <div className="data-preview-header">
            <h2>Data Preview</h2>

            <div className="preview-header-buttons">
              {/* Clear preview (only when a file is loaded) */}
              {currentPreviewFile && (
                <button
                  className="clear-preview-btn icon-btn"
                  onClick={handleClearPreview}
                  title="Clear Preview"
                >
                  <span className="material-icons">delete_outline</span>
                </button>
              )}

              {/* Delete rows (visible when there are rows to delete) */}
              {previewTableData.length > 0 && (
                <button
                  className="delete-rows-btn icon-btn"
                  onClick={handleDeleteSelected}
                  title="Delete Selected Rows"
                >
                  <span className="material-icons">delete</span>
                </button>
              )}
            </div>
          </div>

          <p>
            {currentPreviewFile
              ? `Previewing: ${currentPreviewFile.name}`
              : 'Import an Excel file to see a preview.'}
          </p>

          <div className="data-preview-table-container">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" aria-label="select all" /></th>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Value</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {previewTableData.map((row) => (
                  <tr key={row.id}>
                    <td><input type="checkbox" aria-label={`select ${row.id}`} /></td>
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

        <aside className="side-panel">
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleOpenModal}>
              Import Data
            </button>
          </div>

          <div className="statistics-container">
            <h3>Import Statistics</h3>
            <div className="chart-wrapper" style={{ height: 200 }}>
              <Pie
                data={importChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'left' } },
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

// ...existing code...