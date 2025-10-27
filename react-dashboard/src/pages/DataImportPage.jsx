import React, { useState, useEffect } from 'react';
import ImportModal from '../components/ImportModal.jsx';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// --- Register Chart.js components ---
ChartJS.register(ArcElement, Tooltip, Legend);

function DataImportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPreviewFile, setCurrentPreviewFile] = useState(null);
  const [uploadedData, setUploadedData] = useState([]);
  const [importStats, setImportStats] = useState({
    completed: 0,
    failed: 0,
    pending: 0,
  });

  // --- Open Import Modal ---
  const handleOpenModal = () => setIsModalOpen(true);

  // --- Handle File Import Confirmation ---
  const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:5001';

  const handleImportConfirm = async (file) => {
    setCurrentPreviewFile(file);
    setIsModalOpen(false);

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

      // Optionally refresh stats from server
      try {
        const statsRes = await fetch(`${API_BASE}/stats`);
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setImportStats((curr) => ({
            ...curr,
            completed: stats.filesUploaded ?? curr.completed,
            pending: 0,
          }));
        } else {
          // Fallback: compute from local list
          const completed = (prev => prev.filter(r => r.status === 'Completed').length)(uploadedData);
          setImportStats((curr) => ({ ...curr, completed }));
        }
      } catch {}
    } catch (err) {
      console.error('Upload error:', err);
      // Mark as failed if upload/analysis errored
      setUploadedData((prev) =>
        prev.map((row) =>
          row.id === tempId ? { ...row, status: 'Failed', error: err.message } : row
        )
      );
      alert(`Upload failed: ${err.message}\n\nMake sure:\n1. Backend server is running on port 5001\n2. MySQL is running and database 'rsc_globe_db' exists`);
    }
  };

  // --- Clear File Preview ---
  const handleClearPreview = () => {
    setCurrentPreviewFile(null);
    alert('Preview cleared!');
  };

  // --- Delete Selected Rows Placeholder ---
  const handleDeleteSelected = () => {
    alert('Delete Selected Rows clicked!');
  };

  useEffect(() => {
    // Load persisted upload data from localStorage
    try {
      const saved = localStorage.getItem('uploadedData');
      if (saved) {
        setUploadedData(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load saved upload data:', err);
      setUploadedData([]);
    }
  }, []);

  // Keep importStats in sync with uploadedData statuses
  useEffect(() => {
    const completed = uploadedData.filter(r => r.status === 'Completed').length;
    const failed = uploadedData.filter(r => r.status === 'Failed').length;
    const pending = uploadedData.filter(r => r.status === 'Pending').length;
    setImportStats({ completed, failed, pending });
    
    // Persist to localStorage whenever uploadedData changes
    try {
      localStorage.setItem('uploadedData', JSON.stringify(uploadedData));
    } catch (err) {
      console.error('Failed to save upload data:', err);
    }
  }, [uploadedData]);

  // --- Chart Data ---
  const importChartData = {
    labels: ['Completed', 'Failed', 'Pending'],
    datasets: [
      {
        label: '# of Imports',
        data: [importStats.completed, importStats.failed, importStats.pending],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="data-import-layout">
      {/* --- Import Modal --- */}
      <ImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImportConfirm={handleImportConfirm}
      />

      <div className="content-wrapper">
        {/* --- Main Panel --- */}
        <section className="main-panel">
          <div className="data-preview-header">
            <h2>Data Preview</h2>

            <div className="preview-header-buttons">
              {uploadedData.length > 0 && (
                <button
                  className="delete-rows-btn icon-btn"
                  onClick={handleDeleteSelected}
                  title="Delete Selected Rows"
                >
                  <span className="material-icons">delete</span>
                </button>
              )}
            </div>
          </div>

          <p>
            {currentPreviewFile
              ? `Previewing: ${currentPreviewFile.name}`
              : 'Import an Excel file to see a preview.'}
          </p>

          <div className="data-preview-table-container">
            <table>
              <thead>
                <tr>
                  {/* ✅ Show checkbox column only if there’s uploaded data */}
                  {uploadedData.length > 0 && (
                    <th>
                      <input type="checkbox" aria-label="select all" />
                    </th>
                  )}
                  <th>ID</th>
                  <th>File Name</th>
                  <th>Status</th>
                  <th>Date Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {uploadedData.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      No uploaded data available.
                    </td>
                  </tr>
                ) : (
                  uploadedData.map((row) => (
                    <tr key={row.id}>
                      {/* ✅ Checkbox only appears when data exists */}
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td>{row.id}</td>
                      <td>{row.file_name}</td>
                      <td>{row.status}</td>
                      <td>{new Date(row.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- Side Panel --- */}
        <aside className="side-panel">
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleOpenModal}>
              Import Data
            </button>
          </div>

          <div className="statistics-container">
            <h3>Import Statistics</h3>
            <div className="chart-wrapper" style={{ height: 200 }}>
              <Pie
                data={importChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'left' } },
                }}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DataImportPage;
