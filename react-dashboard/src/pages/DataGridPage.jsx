import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';

function DataGridPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [gridData, setGridData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 50;

  const API_BASE = useMemo(
    () => (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5001',
    []
  );

  const activeTab = (category || 'wireless').toLowerCase();

  const dashboardTabs = [
    { id: 'wireless', name: 'Wireless' },
    { id: 'transport', name: 'Transport' },
    { id: 'wireline', name: 'Wireline' },
    { id: 'total', name: 'All Data' },
  ];

  const handleTabClick = (tabId) => {
    setCurrentPage(1); // Reset to page 1 when switching tabs
    setSearchQuery(''); // Clear search when switching tabs
    navigate(`/dashboard/data/${tabId}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of table
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');

      try {
        const categoryParam = activeTab === 'total' ? 'all' : activeTab;
        const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
        const response = await fetch(
          `${API_BASE}/api/uploads/${categoryParam}?page=${currentPage}&pageSize=${pageSize}${searchParam}`
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const rows = Array.isArray(payload?.rows) ? payload.rows : Array.isArray(payload) ? payload : [];
        setGridData(rows);
        setTotalPages(payload?.totalPages || 1);
        setTotalRows(payload?.totalRows || 0);
      } catch (fetchError) {
        console.error('Error fetching uploaded data:', fetchError);
        setError('Unable to load uploaded data. Please try again.');
        setGridData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [API_BASE, activeTab, currentPage, pageSize, searchQuery]);

  const getHeading = () => (
    activeTab === 'total' ? 'All Data Uploaded' : `Files of ${activeTab}`
  );

  // Extract dynamic columns from the first row's data
  const getTableColumns = () => {
    if (!gridData.length || !gridData[0].row_data) {
      return [];
    }

    const firstRowData = gridData[0].row_data;
    // Get all keys from the first row, excluding internal metadata
    return Object.keys(firstRowData).filter(
      key => !key.startsWith('__') && key.toLowerCase() !== 'sheet'
    );
  };

  const renderBody = () => {
    if (isLoading) {
      return <p>Loading data...</p>;
    }

    if (error) {
      return <p>{error}</p>;
    }

    if (!gridData.length) {
      return <p>No data available. Please upload a file to see results.</p>;
    }

    const dataColumns = getTableColumns();

    return (
      <table>
        <thead>
          <tr>
            <th style={{ minWidth: '100px' }}>Category</th>
            <th style={{ minWidth: '80px' }}>Tech</th>
            {dataColumns.map((col) => (
              <th key={col} style={{ minWidth: '120px' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gridData.map((row, index) => {
            const rowData = row.row_data || {};
            return (
              <tr key={row.id ?? `row-${index}`}>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85em',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    backgroundColor: 
                      row.category === 'wireless' ? '#e3f2fd' :
                      row.category === 'transport' ? '#fff3e0' :
                      row.category === 'wireline' ? '#f3e5f5' : '#f5f5f5',
                    color:
                      row.category === 'wireless' ? '#1565c0' :
                      row.category === 'transport' ? '#e65100' :
                      row.category === 'wireline' ? '#6a1b9a' : '#616161'
                  }}>
                    {row.category || '—'}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85em',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32'
                  }}>
                    {row.tech || '—'}
                  </span>
                </td>
                {dataColumns.map((col) => (
                  <td key={col}>{rowData[col] !== undefined && rowData[col] !== null && rowData[col] !== '' ? rowData[col] : '—'}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="data-grid-layout">
      <PageHeader />

      <section className="tab-navigation">
        <label htmlFor="category-select" className="dropdown-label">Select Category:</label>
        <select
          id="category-select"
          className="category-dropdown"
          value={activeTab}
          onChange={(e) => handleTabClick(e.target.value)}
        >
          {dashboardTabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.name}
            </option>
          ))}
        </select>
      </section>

      <section className="tab-content">
        <div className="content-header">
          <h2>{getHeading()}</h2>
          
          <div className="header-actions">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Type here to search..." 
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <button className="filter-button">
              <span className="filter-icon">tune</span>
              Filter
            </button>
            <button className="export-button">
              <span className="export-icon">file_download</span>
              Export
            </button>
          </div>
        </div>

        {/* Pagination Info */}
        {!isLoading && !error && gridData.length > 0 && (
          <div className="pagination-info">
            <p>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRows)} of {totalRows} entries
            </p>
          </div>
        )}

        <div className="data-grid-table-container">
          {renderBody()}
        </div>

        {/* Pagination Controls */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              ««
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              «
            </button>
            
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
              ) : (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )
            ))}
            
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              »
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              »»
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default DataGridPage;
