import React, { useState, useEffect } from 'react';

function ArchivePage() {
  const [archivedData, setArchivedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArchives, setSelectedArchives] = useState([]);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5001';

  const fetchArchivedData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/archives`);
      if (response.ok) {
        const data = await response.json();
        setArchivedData(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching archived data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchArchivedData();
  }, [fetchArchivedData]);

  // Filter data based on search query
  const displayData = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return archivedData;
    }

    const query = searchQuery.toLowerCase();
    return archivedData.filter(item => {
      const cellName = (item.row_data?.['CELL NAME'] || item.row_data?.['Cell Name'] || '').toString().toLowerCase();
      const siteName = (item.row_data?.['SITE NAME'] || item.row_data?.['Site Name'] || '').toString().toLowerCase();
      const plaid = (item.row_data?.PLAID || item.row_data?.plaid || '').toString().toLowerCase();
      const category = (item.category || '').toString().toLowerCase();
      const tech = (item.tech || '').toString().toLowerCase();
      const fileName = (item.file_name || '').toString().toLowerCase();

      return cellName.includes(query) ||
             siteName.includes(query) ||
             plaid.includes(query) ||
             category.includes(query) ||
             tech.includes(query) ||
             fileName.includes(query);
    });
  }, [archivedData, searchQuery]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedArchives(displayData.map(item => item.id));
    } else {
      setSelectedArchives([]);
    }
  };

  const handleSelectArchive = (id) => {
    setSelectedArchives(prev =>
      prev.includes(id) ? prev.filter(archiveId => archiveId !== id) : [...prev, id]
    );
  };

  const handleRestore = async () => {
    if (selectedArchives.length === 0) return;

    try {
      const response = await fetch(`${API_BASE}/api/archives/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedArchives })
      });

      if (response.ok) {
        alert(`Successfully restored ${selectedArchives.length} record(s)`);
        setSelectedArchives([]);
        fetchArchivedData();
      }
    } catch (error) {
      console.error('Error restoring data:', error);
      alert('Failed to restore data');
    }
    setShowConfirmRestore(false);
  };

  const handlePermanentDelete = async () => {
    if (selectedArchives.length === 0) return;

    try {
      const response = await fetch(`${API_BASE}/api/archives/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedArchives })
      });

      if (response.ok) {
        alert(`Successfully deleted ${selectedArchives.length} record(s) permanently`);
        setSelectedArchives([]);
        fetchArchivedData();
      }
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete data');
    }
    setShowConfirmDelete(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="archive-page">
      {/* Confirm Restore Modal */}
      {showConfirmRestore && (
        <div className="modal-overlay" onClick={() => setShowConfirmRestore(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Restore</h3>
              <button className="modal-close-btn" onClick={() => setShowConfirmRestore(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to restore {selectedArchives.length} record(s)?</p>
              <p style={{ color: '#666', fontSize: '14px' }}>This will move the data back to active records.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowConfirmRestore(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRestore}>Restore</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="modal-overlay" onClick={() => setShowConfirmDelete(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Confirm Permanent Delete</h3>
              <button className="modal-close-btn" onClick={() => setShowConfirmDelete(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#dc3545', fontWeight: '600' }}>
                Are you sure you want to permanently delete {selectedArchives.length} record(s)?
              </p>
              <p style={{ color: '#666', fontSize: '14px' }}>
                ⚠️ This action cannot be undone. The data will be permanently removed.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowConfirmDelete(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handlePermanentDelete}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      <header className="page-header">
        <h2>📦 Data Archive</h2>
      </header>

      <section className="content-panel">
        <div className="archive-header">
          <div className="archive-info">
            <h3>Archived Records</h3>
            <p className="archive-description">
              Archived data is safely stored and can be restored or permanently deleted.
            </p>
          </div>
          <div className="archive-actions">
            {selectedArchives.length > 0 && (
              <>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowConfirmRestore(true)}
                >
                  ↻ Restore Selected ({selectedArchives.length})
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => setShowConfirmDelete(true)}
                >
                  🗑 Delete Permanently ({selectedArchives.length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="archive-search-bar">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Type here to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
        {searchQuery && (
          <p className="search-results-count">
            Found {displayData.length} record{displayData.length !== 1 ? 's' : ''}
          </p>
        )}

        {isLoading ? (
          <div className="loading-message">Loading archived data...</div>
        ) : displayData.length === 0 ? (
          searchQuery ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No Results Found</h3>
              <p>No archived records match your search "{searchQuery}"</p>
              <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Archived Data</h3>
              <p>Your archive is empty. Deleted data will appear here.</p>
            </div>
          )
        ) : (
          <div className="archive-table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedArchives.length === displayData.length && displayData.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Category</th>
                  <th>Tech</th>
                  <th>Cell Name</th>
                  <th>Site Name</th>
                  <th>PLAID</th>
                  <th>Archived Date</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedArchives.includes(item.id)}
                        onChange={() => handleSelectArchive(item.id)}
                      />
                    </td>
                    <td>
                      <span className={`category-badge category-${item.category}`}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <span className="tech-badge">{item.tech || '—'}</span>
                    </td>
                    <td>{item.row_data?.['CELL NAME'] || '—'}</td>
                    <td>{item.row_data?.['SITE NAME'] || '—'}</td>
                    <td>{item.row_data?.PLAID || '—'}</td>
                    <td>{formatDate(item.archived_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default ArchivePage;
