// import React from 'react';
// import Card from './Card.jsx';
// import { Link } from 'react-router-dom';
// import { 
//   importData, 
//   overviewSummaryData,
//   wirelessPreviewData,
//   transportPreviewData,
//   wirelinePreviewData,
//   totalPreviewData
// } from '../data/mockData.js';
// import UploadChart from './UploadChart.jsx'; // The bottom-left bar chart

// // --- NEW: Function to get data for the preview table ---
// const getPreviewTableData = (previewCategory) => {
//   switch (previewCategory) {
//     case 'wireless':
//       return wirelessPreviewData;
//     case 'transport':
//       return transportPreviewData;
//     case 'wireline':
//       return wirelinePreviewData;
//     case 'total no. of data': // Make sure this matches the card title
//       return totalPreviewData;
//     default:
//       return wirelessPreviewData;
//   }
// };

// // --- Your DashboardContent Component ---
// function DashboardContent({ activePreview, onCardClick }) {
  
//   const summaryData = overviewSummaryData; 
//   const chartTitle = `Preview of ${activePreview} Data`;
//   const tableData = getPreviewTableData(activePreview); // Get dynamic table data

//   return (
//     <>
//       {/* --- SECTION 1: Summary Cards --- */}
//       <section className="summary-cards">
//         {summaryData.map((data) => (
//           <Card
//             key={data.title}
//             title={data.title}
//             value={data.value}
//             stats={data.stats}
//             onClick={() => onCardClick(data.title)} 
//             isActive={activePreview === data.title} 
//           />
//         ))}
//       </section>

//       {/* --- SECTION 2: Main Data Preview (MODIFIED) --- */}
//       <section className="chart-container">
        
//         <div className="chart-header">
//           <h2>{chartTitle}</h2>
//           <Link 
//             to={`/dashboard/data/${activePreview === 'total no. of data' ? 'total' : activePreview}`} // Pass the category to the URL
//             className="view-all-btn btn btn-secondary"
//           >
//             View All
//           </Link>
//         </div>
        
//         {/* --- REPLACED: This is now a preview table --- */}
//         <div className="dashboard-preview-table-container">
//           <table>
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Name</th>
//                 <th>Status</th>
//                 <th>Value</th>
//               </tr>
//             </thead>
//             <tbody>
//               {tableData.map((row) => (
//                 <tr key={row.id}>
//                   <td>{row.id}</td>
//                   <td>{row.name}</td>
//                   <td>{row.status}</td>
//                   <td>{row.value.toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </section>

//       {/* --- SECTION 3: Bottom Row Content --- */}
//       <section className="bottom-content">
//         <div className="content-panel upload-chart-panel">
//           <UploadChart />
//         </div>
//         <div className="content-panel import-list">
//           <h2>Recent Import List of Data</h2>
//           <table>
//             {/* ... table content ... */}
//           </table>
//         </div>
//       </section>
//     </>
//   );
// }

// export default DashboardContent;

import React from 'react';
import Card from './Card.jsx';
import { Link } from 'react-router-dom';
import { 
  importData, // <-- Makes sure this is imported
  overviewSummaryData,
  wirelessPreviewData,
  transportPreviewData,
  wirelinePreviewData,
  totalPreviewData
} from '../data/mockData.js';
import UploadChart from './UploadChart.jsx';

// --- Function to get data for the preview table ---
const getPreviewTableData = (previewCategory) => {
  switch (previewCategory) {
    case 'wireless':
      return wirelessPreviewData;
    case 'transport':
      return transportPreviewData;
    case 'wireline':
      return wirelinePreviewData;
    case 'total no. of data': // Make sure this matches the card title
      return totalPreviewData;
    default:
      return wirelessPreviewData;
  }
};

// --- Your DashboardContent Component ---
function DashboardContent({ activePreview, onCardClick }) {
  
  const summaryData = overviewSummaryData; 
  const chartTitle = `Preview of ${activePreview} Data`;
  const tableData = getPreviewTableData(activePreview); 

  return (
    <>
      {/* --- SECTION 1: Summary Cards --- */}
      <section className="summary-cards">
        {summaryData.map((data) => (
          <Card
            key={data.title}
            title={data.title}
            value={data.value}
            stats={data.stats}
            onClick={() => onCardClick(data.title)} 
            isActive={activePreview === data.title} 
          />
        ))}
      </section>

      {/* --- SECTION 2: Main Data Preview --- */}
      <section className="chart-container">
        
        <div className="chart-header">
          <h2>{chartTitle}</h2>
          <Link 
            to={`/dashboard/data/${activePreview === 'total no. of data' ? 'total' : activePreview}`}
            className="view-all-btn btn btn-secondary"
          >
            View All
          </Link>
        </div>
        
        <div className="dashboard-preview-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.status}</td>
                  <td>{row.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- SECTION 3: Bottom Row Content --- */}
      <section className="bottom-content">
        
        {/* Panel 1: Bar Chart */}
        <div className="content-panel upload-chart-panel">
          <UploadChart />
        </div>
        
        {/* Panel 2: Recent Import List (FIXED) */}
        <div className="content-panel import-list">
          <h2>Recent Import List of Data</h2>
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            {/* --- THIS IS THE CODE THAT WAS MISSING --- */}
            <tbody>
              {importData.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.date}</td>
                  <td className={`status ${item.statusClass}`}>{item.status}</td>
                </tr>
              ))}
            </tbody>
            {/* --- END OF FIX --- */}
          </table>
        </div>
      </section>
    </>
  );
}

export default DashboardContent;