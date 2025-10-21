// import React from 'react';
// import Card from './Card.jsx';
// import { Link } from 'react-router-dom'; // <-- We need Link for the "View All" button
// import { importData, overviewSummaryData } from '../data/mockData.js'; 

// // NEW: Accept 'activePreview' and 'onCardClick' props
// function DashboardContent({ activePreview, onCardClick }) {
  
//   const summaryData = overviewSummaryData; 
//   // NEW: The chart title is now dynamic
//   const chartTitle = `Preview of ${activePreview} Data`;

//   return (
//     <>
//       {/* --- Summary Cards --- */}
//       <section className="summary-cards">
//         {summaryData.map((data) => (
//           <Card
//             key={data.title}
//             title={data.title}
//             value={data.value}
//             stats={data.stats}
//             // NEW: Pass the click handler and active state
//             onClick={() => onCardClick(data.title)} 
//             isActive={activePreview === data.title} 
//           />
//         ))}
//       </section>

//       {/* --- Main Chart --- */}
//       <section className="chart-container">
        
//         {/* NEW: Header with dynamic title and "View All" button */}
//         <div className="chart-header">
//           <h2>{chartTitle}</h2>
//           <Link 
//             to={`/data/${activePreview}`} 
//             className="view-all-btn btn btn-secondary"
//           >
//             View All
//           </Link>
//         </div>
        
//         {/* The chart placeholder (this is where you'd show the preview) */}
//         <div className="chart-placeholder"></div>
//       </section>

//       {/* --- Bottom Row Content --- */}
//       <section className="bottom-content">
//         {/* (The rest of this component remains the same) */}
        
//         {/* Excel Upload Panel */}
//         <div className="content-panel excel-upload">
//           <h2>Excel Integration & Upload</h2>
//           {/* ... */}
//         </div>

//         {/* Recent Import List */}
//         <div className="content-panel import-list">
//           <h2>Recent Import List of Data</h2>
//           <table>
//             {/* ... */}
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
import { importData, overviewSummaryData } from '../data/mockData.js';
import UploadChart from './UploadChart.jsx'; // The new bar chart

function DashboardContent({ activePreview, onCardClick }) {
  
  const summaryData = overviewSummaryData; 
  const chartTitle = `Preview of ${activePreview} Data`;

  return (
    <>
      {/* --- SECTION 1: Summary Cards (This was missing) --- */}
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

      {/* --- SECTION 2: Main Chart (This was missing) --- */}
      <section className="chart-container">
        
        <div className="chart-header">
          <h2>{chartTitle}</h2>
          <Link 
            to={`/data/${activePreview}`} 
            className="view-all-btn btn btn-secondary"
          >
            View All
          </Link>
        </div>
        
        <div className="chart-placeholder"></div>
      </section>

      {/* --- SECTION 3: Bottom Row Content --- */}
      <section className="bottom-content">
        
        {/* Panel 1: The new Bar Chart */}
        <div className="content-panel upload-chart-panel">
          <UploadChart />
        </div>

        {/* Panel 2: The Import List */}
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
            <tbody>
              {importData.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.date}</td>
                  <td className={`status ${item.statusClass}`}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default DashboardContent;