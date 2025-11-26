import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import DuplicateDetectionModal from '../components/DuplicateDetectionModal.jsx';
import AdvancedFilter from '../components/AdvancedFilter.jsx';

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
  const [techFilters, setTechFilters] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
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
    setCurrentPage(1);
    setSearchQuery('');
    setTechFilters([]);
    setSelectedRows([]);
    navigate(`/dashboard/data/${tabId}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleApplyFilters = (filters) => {
    setTechFilters(filters.tech || []);
    setCurrentPage(1);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(gridData.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (rowId) => {
    setSelectedRows(prev => 
      prev.includes(rowId) 
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    
    if (window.confirm(`Delete ${selectedRows.length} selected row(s)?`)) {
      // In a real app, make API call to delete
      setGridData(prev => prev.filter(row => !selectedRows.includes(row.id)));
      setSelectedRows([]);
      alert(`${selectedRows.length} row(s) deleted successfully`);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const dataToExport = selectedRows.length > 0 
      ? gridData.filter(row => selectedRows.includes(row.id))
      : gridData;

    if (dataToExport.length === 0) {
      alert('No data to export');
      return;
    }

    const columns = getTableColumns();
    const headers = ['Category', 'Tech', ...columns];
    
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => {
        const rowData = row.row_data || {};
        return [
          row.category || '',
          row.tech || '',
          ...columns.map(col => {
            const value = rowData[col];
            const stringValue = value !== undefined && value !== null ? String(value) : '';
            return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
          })
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_data_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveDuplicates = (duplicateIds) => {
    // In a real app, make API call to delete duplicates
    setGridData(prev => prev.filter(row => !duplicateIds.includes(row.id)));
    setTotalRows(prev => prev - duplicateIds.length);
    alert(`Successfully removed ${duplicateIds.length} duplicate record(s)`);
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
        const techParam = techFilters.length > 0 ? `&tech=${techFilters.join(',')}` : '';
        const response = await fetch(
          `${API_BASE}/api/uploads/${categoryParam}?page=${currentPage}&pageSize=${pageSize}${searchParam}${techParam}`
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
  }, [API_BASE, activeTab, currentPage, pageSize, searchQuery, techFilters]);

  const getHeading = () => (
    activeTab === 'total' ? 'All Data Uploaded' : `Files of ${activeTab}`
  );

  // Extract dynamic columns from the first row's data
  const getTableColumns = () => {
    if (!gridData.length || !gridData[0].row_data) {
      return [];
    }

    const firstRowData = gridData[0].row_data;
    // Get all keys from the first row, excluding internal metadata and TECHNOLOGY column
    return Object.keys(firstRowData).filter(
      key => !key.startsWith('__') && 
             key.toLowerCase() !== 'sheet' && 
             key.toUpperCase() !== 'TECHNOLOGY'
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
    
    // Apply sorting
    let filteredData = [...gridData];
    if (sortColumn) {
      filteredData = filteredData.sort((a, b) => {
        let aVal, bVal;
        
        if (sortColumn === 'category') {
          aVal = a.category || '';
          bVal = b.category || '';
        } else if (sortColumn === 'tech') {
          aVal = a.tech || '';
          bVal = b.tech || '';
        } else {
          aVal = a.row_data?.[sortColumn] || '';
          bVal = b.row_data?.[sortColumn] || '';
        }
        
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return (
      <table>
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input 
                type="checkbox"
                checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th 
              style={{ minWidth: '100px', cursor: 'pointer' }} 
              onClick={() => handleSort('category')}
            >
              Category {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              style={{ minWidth: '80px', cursor: 'pointer' }}
              onClick={() => handleSort('tech')}
            >
              Tech {sortColumn === 'tech' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            {dataColumns.map((col) => (
              <th 
                key={col} 
                style={{ minWidth: '120px', cursor: 'pointer' }}
                onClick={() => handleSort(col)}
              >
                {col} {sortColumn === col && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => {
            const rowData = row.row_data || {};
            return (
              <tr key={row.id ?? `row-${index}`} className={selectedRows.includes(row.id) ? 'selected-row' : ''}>
                <td>
                  <input 
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                  />
                </td>
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

      {/* Duplicate Detection Modal */}
      <DuplicateDetectionModal 
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        onRemoveDuplicates={handleRemoveDuplicates}
        category={activeTab}
      />

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
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input 
                type="text" 
                placeholder="Type here to search..." 
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <AdvancedFilter 
              onApplyFilters={handleApplyFilters}
              initialFilters={{ tech: techFilters }}
            />
            {selectedRows.length > 0 && (
              <button className="delete-selected-button" onClick={handleDeleteSelected}>
                <span className="material-icons">delete</span>
                Delete ({selectedRows.length})
              </button>
            )}
            <button className="find-duplicates-button" onClick={() => setIsDuplicateModalOpen(true)}>
              <span className="material-icons">find_in_page</span>
              Find Duplicates
            </button>
            <button className="export-button" onClick={handleExport}>
              <span className="export-icon">file_download</span>
              Export {selectedRows.length > 0 ? `(${selectedRows.length})` : ''}
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
