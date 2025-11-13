import React from 'react';

function LoadingModal({ isOpen, fileName, message = 'Uploading and processing file...' }) {
  if (!isOpen) return null;

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal">
        <div className="loading-spinner"></div>
        <h3>{message}</h3>
        {fileName && (
          <p className="loading-file-name">{fileName}</p>
        )}
        <p className="loading-subtitle">Please wait, this may take a moment...</p>
      </div>
    </div>
  );
}

export default LoadingModal;
