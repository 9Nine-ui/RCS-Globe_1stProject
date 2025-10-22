import React, { useRef, useState } from 'react';

function ImportModal({ isOpen, onClose, onImportConfirm }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Trigger hidden file input
  const handleSelectFileClick = () => {
    fileInputRef.current.click();
  };

  // Handle file selection
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null); // Clear if no file selected
    }
  };

  // Handle final import confirmation
  const handleConfirm = () => {
    if (selectedFile) {
      onImportConfirm(selectedFile); // Pass file back to parent
      setSelectedFile(null); // Reset file state
      onClose(); // Close the modal
    }
  };

  // Handle closing modal and resetting state
  const handleClose = () => {
    setSelectedFile(null); // Reset file state on close
    onClose();
  };

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    // Modal Overlay
    <div className="modal-overlay">
      {/* Modal Content Box */}
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Import Data from Excel</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            &times; {/* Close symbol */}
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".xls, .xlsx"
          />

          {/* Button to trigger file selection */}
          <button
            className="btn btn-secondary select-file-modal-btn"
            onClick={handleSelectFileClick}
          >
            Select Excel File
          </button>

          {/* Display selected file name */}
          {selectedFile && (
            <p className="selected-file-name">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!selectedFile} // Disable if no file selected
          >
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportModal;