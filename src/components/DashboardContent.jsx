import React, { useState, useEffect } from 'react';
import Card from './Card.jsx';
import { Link } from 'react-router-dom';
import UploadChart from './UploadChart.jsx';

function DashboardContent({ activePreview, onCardClick }) {
  // initialize with shape the UI expects to avoid undefined checks on first render
  const initialChartData = {
    categories: {
      transport: { total: 0, tech: { '2g': 0, lte: 0, '5g': 0, other: 0 }, techPercent: { '2g': 0, lte: 0, '5g': 0, other: 0 } },
      wireless: { total: 0, tech: { '2g': 0, lte: 0, '5g': 0, other: 0 }, techPercent: { '2g': 0, lte: 0, '5g': 0, other: 0 } },
      wireline: { total: 0, tech: { '2g': 0, lte: 0, '5g': 0, other: 0 }, techPercent: { '2g': 0, lte: 0, '5g': 0, other: 0 } }
    },
    totals: { total: 0, tech: { '2g': 0, lte: 0, '5g': 0, other: 0 }, techPercent: { '2g': 0, lte: 0, '5g': 0, other: 0 } }
  };

  const [chartData, setChartData] = useState(initialChartData);
  // keep importList but also provide a setImports alias for other code that expects that name
  const [importList, setImportList] = useState([]);
  const setImports = setImportList; // <-- alias to avoid "setImports is not defined" errors
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5001';

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE}/chart-data`);
      const data = await response.json();
      /* data may be either simple counts or detailed breakdown */
      if (data.categories) {
        // detailed structure
        setChartData(data);
      } else {
        // simple counts -> convert to the detailed shape
        setChartData({
          categories: {
            transport: { total: data.transport || 0, tech: { '2g': 0, lte: 0, '5g': 0, other: 0 }, techPercent: { '2g': 0, lte: 0, '5g': 0, other: 0 } },
            wireless: { total: data.wireless || 0, tech: { '2g': 0, lte: 0, '5g': 0, other: 0 }, techPercent: { '2g': 0, lte: 0, '5g': 0, other: 0 } },
            wireline: { total: data.wireline || 0, tech: { '2g': 0, lte: 0, '5g': 0, other: 0 }, techPercent: { '2g': 0, lte: 0, '5g': 0, other: 0 } }
          },
          totals: { total: (data.transport||0)+(data.wireless||0)+(data.wireline||0), tech: { '2g': 0, lte: 0, '5g': 0, other: 0 }, techPercent: { '2g': 0, lte: 0, '5g': 0, other: 0 } }
        });
      }

      // try to fetch recent imports (non-fatal if endpoint missing)
      try {
        const impRes = await fetch(`${API_BASE}/imports`);
        if (impRes.ok) {
          const impData = await impRes.json();
          // expect an array, otherwise ignore
          if (Array.isArray(impData)) setImportList(impData);
          else setImportList([]);
        } else {
          setImportList([]);
        }
      } catch (impErr) {
        // network error or endpoint absent - keep empty list
        setImportList([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      setImportList([]);
    }
  };

  const summaryData = [
    {
      title: 'transport',
      value: chartData?.categories?.transport?.total || 0,
      stats: { value: chartData?.categories?.transport?.total || 0, label: 'Total Transport', percentage: '0%' }
    },
    {
      title: 'wireless',
      value: chartData?.categories?.wireless?.total || 0,
      stats: { value: chartData?.categories?.wireless?.total || 0, label: 'Total Wireless', percentage: '0%' }
    },
    {
      title: 'wireline',
      value: chartData?.categories?.wireline?.total || 0,
      stats: { value: chartData?.categories?.wireline?.total || 0, label: 'Total Wireline', percentage: '0%' }
    },
    {
      title: 'total no. of data',
      value: chartData?.totals?.total || 0,
      stats: { value: 'Combined', label: 'All Categories', percentage: '0%' }
    }
  ];

  // Normalize preview key and label to avoid errors when activePreview is undefined
  const previewKey = activePreview
    ? (activePreview === 'total no. of data' ? 'total' : activePreview.toLowerCase())
    : 'transport';

  const previewLabel = activePreview ? (activePreview === 'total no. of data' ? 'Total No. of Data' : activePreview) : 'Transport';

  const chartTitle = `Preview of ${previewLabel} Data`;

  // choose correct source for tech breakdown (totals vs categories)
  const techSource = previewKey === 'total' ? chartData?.totals : chartData?.categories?.[previewKey] || {};

  return (
    <>
      {/* small uploader so uploads can refresh imports */}
      <div style={{ marginBottom: 16 }}>
        <UploadChart onDataUpdate={(body) => {
          // if backend returns imports array use it, otherwise re-fetch
          if (body && Array.isArray(body.imports)) {
            setImportList(body.imports);
          } else {
            fetchData();
          }
        }} />
      </div>

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
            to={`/dashboard/data/${previewKey}`}
            className="view-all-btn btn btn-secondary"
          >
            View All
          </Link>
        </div>
        
        <div className="dashboard-preview-table-container">
          {loading ? (
            <p>Loading data...</p>
          ) : (
            <div className="tech-breakdown">
              <h4 style={{ marginLeft: '15px' }}>Technology Breakdown ({previewLabel})</h4>
              <table>
                <thead>
                  <tr>
                    <th>Technology</th>
                    <th>Count</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {['2g','lte','5g','other'].map(t => (
                    <tr key={t}>
                      <td style={{textTransform:'uppercase'}}>{t}</td>
                      <td>{techSource?.tech?.[t] || 0}</td>
                      <td>{(techSource?.techPercent?.[t] || 0) + '%'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* --- SECTION 3: Bottom Row Content --- */}
      <section className="bottom-content">
        
        {/* Panel 2: Recent Import List */}
      <div className="content-panel import-list" style={{ width: '100%', flex: '1 1 100%' }}>
          <h2>Recent Data Import</h2>
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3">Loading import history...</td>
                </tr>
              ) : importList.length === 0 ? (
                <tr>
                  <td colSpan="3">No imports yet. Upload an Excel file to get started.</td>
                </tr>
              ) : (
                importList.map((item, index) => (
                  <tr key={index}>
                    <td>{item.file_name}</td>
                    <td>{item.import_date ? new Date(item.import_date).toLocaleDateString() : '-'}</td>
                    <td className={`status ${item.status ? item.status.toLowerCase() : 'unknown'}`}>{item.status || 'Unknown'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default DashboardContent;