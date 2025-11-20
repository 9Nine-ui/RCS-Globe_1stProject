import React, { useState, useEffect, useCallback } from 'react';

function DuplicateDetectionModal({ isOpen, onClose, onRemoveDuplicates, category }) {
  const [duplicates, setDuplicates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDuplicates, setSelectedDuplicates] = useState([]);

  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5001';

  const fetchDuplicates = useCallback(async () => {
    setIsLoading(true);
    try {
      const categoryParam = category === 'total' ? 'all' : category;
      const response = await fetch(`${API_BASE}/api/uploads/${categoryParam}?pageSize=10000`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const payload = await response.json();
      const rows = Array.isArray(payload?.rows) ? payload.rows : [];
      
      // Find duplicates based on key fields
      const duplicateGroups = findDuplicates(rows);
      setDuplicates(duplicateGroups);
    } catch (error) {
      console.error('Error fetching duplicates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [category, API_BASE]);

  useEffect(() => {
    if (isOpen) {
      fetchDuplicates();
    }
  }, [isOpen, fetchDuplicates]);

  const findDuplicates = (rows) => {
    const groups = {};
    
    rows.forEach(row => {
      const rowData = row.row_data || {};
      // Create a key based on important fields (adjust based on your data structure)
      const key = [
        rowData['Cell Name'] || rowData['CELL NAME'] || '',
        rowData['SITE NAME'] || rowData['Site Name'] || '',
        row.category,
        row.tech
      ].join('|').toLowerCase();

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    });

    // Filter to only groups with duplicates
    return Object.entries(groups)
      .filter(([, items]) => items.length > 1)
      .map(([key, items]) => ({
        key,
        count: items.length,
        items,
        cellName: items[0].row_data?.['Cell Name'] || items[0].row_data?.['CELL NAME'] || 'Unknown',
        siteName: items[0].row_data?.['SITE NAME'] || items[0].row_data?.['Site Name'] || 'Unknown',
        category: items[0].category,
        tech: items[0].tech
      }));
  };

  const handleSelectGroup = (groupKey) => {
    const group = duplicates.find(g => g.key === groupKey);
    if (!group) return;

    const groupIds = group.items.map(item => item.id);
    const allSelected = groupIds.every(id => selectedDuplicates.includes(id));

    if (allSelected) {
      // Keep only the first one, remove others
      setSelectedDuplicates(prev => 
        prev.filter(id => !groupIds.includes(id) || id === groupIds[0])
      );
    } else {
      // Select all except the first one (keep one, remove duplicates)
      setSelectedDuplicates(prev => {
        const newSelection = [...prev];
        groupIds.slice(1).forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedDuplicates.length > 0) {
      setSelectedDuplicates([]);
    } else {
      // Select all duplicates (keeping first of each group)
      const allDuplicateIds = [];
      duplicates.forEach(group => {
        group.items.slice(1).forEach(item => allDuplicateIds.push(item.id));
      });
      setSelectedDuplicates(allDuplicateIds);
    }
  };

  const handleRemove = () => {
    if (selectedDuplicates.length === 0) {
      alert('Please select duplicates to remove');
      return;
    }
    onRemoveDuplicates(selectedDuplicates);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content duplicate-detection-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>🔍 Duplicate Detection</h2>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {isLoading ? (
            <p>Analyzing data for duplicates...</p>
          ) : duplicates.length === 0 ? (
            <p className="no-duplicates-text">✓ No duplicates found! Your data is clean.</p>
          ) : (
            <>
              <div className="duplicate-summary">
                <p>
                  Found <strong>{duplicates.length}</strong> duplicate groups with{' '}
                  <strong>{duplicates.reduce((sum, g) => sum + (g.count - 1), 0)}</strong> duplicate records
                </p>
                <button className="btn btn-secondary" onClick={handleSelectAll}>
                  {selectedDuplicates.length > 0 ? 'Deselect All' : 'Select All Duplicates'}
                </button>
              </div>

              <div className="duplicates-list">
                {duplicates.map((group, index) => {
                  const groupIds = group.items.map(i => i.id);
                  const selectedInGroup = groupIds.slice(1).filter(id => selectedDuplicates.includes(id)).length;
                  
                  return (
                    <div key={group.key} className="duplicate-group">
                      <div className="duplicate-group-header">
                        <input
                          type="checkbox"
                          checked={selectedInGroup === group.count - 1}
                          onChange={() => handleSelectGroup(group.key)}
                        />
                        <div className="duplicate-info">
                          <span className="duplicate-number">Group {index + 1}</span>
                          <span className="duplicate-cell">{group.cellName}</span>
                          <span className="duplicate-site">{group.siteName}</span>
                          <span className={`duplicate-badge category-${group.category}`}>
                            {group.category}
                          </span>
                          <span className="duplicate-badge tech-badge">
                            {group.tech?.toUpperCase()}
                          </span>
                          <span className="duplicate-count">
                            {group.count} duplicates
                          </span>
                        </div>
                      </div>
                      
                      {/* Show all duplicate records */}
                      <div className="duplicate-records">
                        {group.items.map((item, itemIndex) => (
                          <div 
                            key={item.id} 
                            className={`duplicate-record ${itemIndex === 0 ? 'duplicate-record-keep' : 'duplicate-record-remove'}`}
                          >
                            <div className="duplicate-record-label">
                              {itemIndex === 0 ? '✓ Keep' : '✗ Remove'}
                            </div>
                            <div className="duplicate-record-details">
                              <div className="duplicate-record-field">
                                <span className="field-label">Cell Name:</span>
                                <span className="field-value">{item.row_data?.['CELL NAME'] || item.row_data?.['Cell Name'] || item['CELL NAME'] || item.cellName || '—'}</span>
                              </div>
                              <div className="duplicate-record-field">
                                <span className="field-label">Site Name:</span>
                                <span className="field-value">{item.row_data?.['SITE NAME'] || item.row_data?.['Site Name'] || item['SITE NAME'] || item.siteName || '—'}</span>
                              </div>
                              <div className="duplicate-record-field">
                                <span className="field-label">Category:</span>
                                <span className="field-value">{item.category || item.CATEGORY || '—'}</span>
                              </div>
                              <div className="duplicate-record-field">
                                <span className="field-label">Tech:</span>
                                <span className="field-value">{item.tech || item.TECH || '—'}</span>
                              </div>
                              {(item.row_data?.PLAID || item.row_data?.plaid || item.PLAID || item.plaid) && (
                                <div className="duplicate-record-field">
                                  <span className="field-label">PLAID:</span>
                                  <span className="field-value">{item.row_data?.PLAID || item.row_data?.plaid || item.PLAID || item.plaid}</span>
                                </div>
                              )}
                              {(item.row_data?.LATITUDE || item.row_data?.latitude || item.LATITUDE || item.latitude) && (
                                <div className="duplicate-record-field">
                                  <span className="field-label">Latitude:</span>
                                  <span className="field-value">{item.row_data?.LATITUDE || item.row_data?.latitude || item.LATITUDE || item.latitude}</span>
                                </div>
                              )}
                              {(item.row_data?.LONGITUDE || item.row_data?.longitude || item.LONGITUDE || item.longitude) && (
                                <div className="duplicate-record-field">
                                  <span className="field-label">Longitude:</span>
                                  <span className="field-value">{item.row_data?.LONGITUDE || item.row_data?.longitude || item.LONGITUDE || item.longitude}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          {duplicates.length > 0 && (
            <button 
              type="button" 
              className="btn btn-danger"
              onClick={handleRemove}
              disabled={selectedDuplicates.length === 0}
            >
              Remove Selected ({selectedDuplicates.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DuplicateDetectionModal;
