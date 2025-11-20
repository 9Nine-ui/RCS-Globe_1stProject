import React, { useState, useEffect } from 'react';
import ImportModal from '../components/ImportModal.jsx';
import LoadingModal from '../components/LoadingModal.jsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx';
import SuccessModal from '../components/SuccessModal.jsx';

function DataImportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedImports, setSelectedImports] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // --- Open Import Modal ---
  const handleOpenModal = () => setIsModalOpen(true);

  // --- Handle File Import Confirmation ---
  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5001';

  const handleImportConfirm = async (file) => {
    setIsModalOpen(false);
    
    // Show loading modal
    setIsUploading(true);
    setUploadingFileName(file.name);

    // Create local pending row immediately
    const tempId = uploadedData.length + 1;
    const pendingRow = {
      id: tempId,
      file_name: file.name,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };
    setUploadedData((prev) => [pendingRow, ...prev]);

    // Upload to backend for analysis
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Upload failed:', res.status, errorText);
        throw new Error(`Upload failed (${res.status}): ${errorText}`);
      }
      
      const body = await res.json();
      console.log('Upload success:', body);

      // Mark as completed on success
      setUploadedData((prev) =>
        prev.map((row) =>
          row.id === tempId ? { ...row, status: 'Completed' } : row
        )
      );

      // Refresh the import list from backend
      try {
        const importsRes = await fetch(`${API_BASE}/imports`);
        if (importsRes.ok) {
          const imports = await importsRes.json();
          const mappedImports = imports.map(imp => ({
            id: imp.id,
            file_name: imp.file_name,
            status: imp.status || 'completed',
            created_at: imp.import_date || imp.created_at
          }));
          setUploadedData(mappedImports);
        }
      } catch (refreshErr) {
        console.error('Failed to refresh import list:', refreshErr);
      }

    } catch (err) {
      console.error('Upload error:', err);
      // Mark as failed if upload/analysis errored
      setUploadedData((prev) =>
        prev.map((row) =>
          row.id === tempId ? { ...row, status: 'Failed', error: err.message } : row
        )
      );
      alert(`Upload failed: ${err.message}\n\nMake sure:\n1. Backend server is running on port 5001\n2. MySQL is running and database 'rsc_globe_db' exists`);
    } finally {
      // Hide loading modal
      setIsUploading(false);
      setUploadingFileName('');
    }
  };

  useEffect(() => {
    // Fetch import history from backend
    const fetchImports = async () => {
      try {
        const response = await fetch(`${API_BASE}/imports`);
        if (response.ok) {
          const imports = await response.json();
          // Map backend data to match our component structure
          const mappedImports = imports.map(imp => ({
            id: imp.id,
            file_name: imp.file_name,
            status: imp.status || 'completed',
            created_at: imp.import_date || imp.created_at
          }));
          setUploadedData(mappedImports);
        }
      } catch (err) {
        console.error('Failed to load import history:', err);
      }
    };

    fetchImports();
  }, [API_BASE]);

  // Handle checkbox selection
  const handleSelectImport = (importId) => {
    setSelectedImports(prev => {
      if (prev.includes(importId)) {
        return prev.filter(id => id !== importId);
      } else {
        return [...prev, importId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedImports(uploadedData.map(item => item.id));
    } else {
      setSelectedImports([]);
    }
  };

  // Handle delete selected imports
  const handleDeleteSelected = () => {
    if (selectedImports.length === 0) {
      alert('Please select at least one import to delete.');
      return;
    }
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsConfirmDeleteOpen(false);

    try {
      const response = await fetch(`${API_BASE}/imports`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedImports })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('Delete result:', result);

      // Refresh the import list
      const importsRes = await fetch(`${API_BASE}/imports`);
      if (importsRes.ok) {
        const imports = await importsRes.json();
        const mappedImports = imports.map(imp => ({
          id: imp.id,
          file_name: imp.file_name,
          status: imp.status || 'completed',
          created_at: imp.import_date || imp.created_at
        }));
        setUploadedData(mappedImports);
      }

      // Clear selection
      setSelectedImports([]);

      setSuccessMessage(`Successfully deleted ${result.deletedCount} import(s) and archived the data.`);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Failed to delete imports: ${err.message}`);
    }
  };

  return (
    <div className="data-import-page">
      {/* --- Import Modal --- */}
      <ImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImportConfirm={handleImportConfirm}
      />

      {/* --- Loading Modal --- */}
      <LoadingModal 
        isOpen={isUploading}
        fileName={uploadingFileName}
        message="Uploading and processing file..."
      />

      {/* --- Confirm Delete Modal --- */}
      <ConfirmDeleteModal 
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        count={selectedImports.length}
      />

      {/* --- Success Modal --- */}
      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
      />

      <section className="data-import-card">
        <div className="data-import-card-header">
          <h2>Recent Data Import</h2>
          <div className="data-import-card-actions">
            <button 
              className="btn btn-danger delete-btn" 
              onClick={handleDeleteSelected}
              disabled={selectedImports.length === 0}
              style={{ marginRight: '10px' }}
            >
              🗑️ Delete Selected ({selectedImports.length})
            </button>
            <button className="btn btn-secondary import-file-btn" onClick={handleOpenModal}>
              Import file
            </button>
          </div>
        </div>

        <div className="data-import-card-body">
          <div className="data-preview-area">
            {uploadedData.length === 0 ? (
              <div className="data-preview-empty">
                <table>
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                        No imports yet. Upload an Excel file to get started.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="data-preview-table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedImports.length === uploadedData.length && uploadedData.length > 0}
                          onChange={handleSelectAll}
                          title="Select all"
                        />
                      </th>
                      <th>File Name</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedImports.includes(row.id)}
                            onChange={() => handleSelectImport(row.id)}
                          />
                        </td>
                        <td>{row.file_name}</td>
                        <td>{new Date(row.created_at).toLocaleDateString()}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DataImportPage;
