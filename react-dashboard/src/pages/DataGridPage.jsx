import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { dashboardTabs } from '../data/mockData.js';

// This is the new page for showing the full data grid
function DataGridPage() {
  const { category } = useParams(); // Gets 'wireless' from the URL
  const navigate = useNavigate();

  // Set the active tab from the URL, or default to 'wireless'
  const activeTab = category || 'wireless';

  // Function to handle tab clicks, which changes the URL
  const handleTabClick = (tabId) => {
    navigate(`/data/${tabId}`);
  };

  return (
    // This wrapper class scopes the styles to this page
    <div className="data-grid-layout">
      {/* --- Header with Search/Filter --- */}
      <PageHeader />

      {/* --- Tab Buttons --- */}
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

      {/* --- Tab Content Panel --- */}
      <section className="tab-content">
        <h2>Excel sheet of {activeTab}</h2>
        <p>This is where the full data grid (all columns and rows) for the '{activeTab}' category will be displayed.</p>
        {/* You would add a data table component here */}
      </section>
    </div>
  );
}

export default DataGridPage;