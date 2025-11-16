// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import PageHeader from '../components/PageHeader.jsx';

// function DataGridPage() {
//   const { category } = useParams();
//   const navigate = useNavigate();
//   const [gridData, setGridData] = useState([]);

//   const activeTab = category || 'wireless';

//   const dashboardTabs = [
//     { id: 'wireless', name: 'Wireless' },
//     { id: 'transport', name: 'Transport' },
//     { id: 'wireline', name: 'Wireline' },
//     { id: 'total', name: 'All Data' },
//   ];

//   const handleTabClick = (tabId) => {
//     navigate(`/dashboard/data/${tabId}`);
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Replace this with your backend API endpoint or Supabase query
//         const response = await fetch(`http://localhost:5000/api/uploads/${activeTab}`);
//         const data = await response.json();
//         setGridData(data);
//       } catch (error) {
//         console.error('Error fetching uploaded data:', error);
//       }
//     };

//     fetchData();
//   }, [activeTab]);

//   const getHeading = () => {
//     return activeTab === 'total'
//       ? 'All Data Uploaded'
//       : `Files of ${activeTab}`;
//   };

//   return (
//     <div className="data-grid-layout">
//       <PageHeader />

//       {/* Tabs */}
//       <section className="tab-navigation">
//         {dashboardTabs.map((tab) => (
//           <button
//             key={tab.id}
//             className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
//             onClick={() => handleTabClick(tab.id)}
//           >
//             {tab.name}
//           </button>
//         ))}
//       </section>

//       {/* Table */}
//       <section className="tab-content">
//         <h2>{getHeading()}</h2>

//         <div className="data-grid-table-container">
//           {gridData.length === 0 ? (
//             <p>No data available. Please upload a file to see results.</p>
//           ) : (
//             <table>
//               <thead>
//                 <tr>
//                   <th>File Name</th>
//                   <th>Uploaded Date</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {gridData.map((row, index) => (
//                   <tr key={index}>
//                     <td>{row.file_name}</td>
//                     <td>{new Date(row.upload_date).toLocaleDateString()}</td>
//                     <td>{row.status}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }

// export default DataGridPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';

function DataGridPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [gridData, setGridData] = useState([]);

  const activeTab = category || 'wireless';

  const dashboardTabs = [
    { id: 'wireless', name: 'Wireless' },
    { id: 'transport', name: 'Transport' },
    { id: 'wireline', name: 'Wireline' },
    { id: 'total', name: 'All Data' },
  ];

  const handleTabClick = (tabId) => {
    navigate(`/dashboard/data/${tabId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace this with your backend API endpoint or Supabase query
        const response = await fetch(`http://localhost:5000/api/uploads/${activeTab}`);
        const data = await response.json();
        setGridData(data);
      } catch (error) {
        console.error('Error fetching uploaded data:', error);
      }
    };

    fetchData();
  }, [activeTab]);

  // --- THIS FUNCTION HAS BEEN UPDATED ---
  const getHeading = () => {
    if (activeTab === 'total') {
      return 'All Data Uploaded';
    }
    // Capitalize the first letter
    const capitalizedTab = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    return `Files of ${capitalizedTab}`;
  };
  // --- END OF UPDATE ---

  return (
    <div className="data-grid-layout">
      <PageHeader />

      {/* Tabs */}
      <section className="tab-navigation">
        {dashboardTabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </section>

      {/* Table */}
      <section className="tab-content">
        <h2>{getHeading()}</h2>

        <div className="data-grid-table-container">
          {gridData.length === 0 ? (
            <p>No data available. Please upload a file to see results.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Uploaded Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {gridData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.file_name}</td>
                    <td>{new Date(row.upload_date).toLocaleDateString()}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default DataGridPage;
