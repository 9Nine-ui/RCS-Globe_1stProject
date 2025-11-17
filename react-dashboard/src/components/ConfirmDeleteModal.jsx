import React from 'react';

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, count }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-delete-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>⚠️ Confirm Delete</h2>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <p className="delete-warning-text">
            Are you sure you want to delete <strong>{count}</strong> import(s)? 
            This will archive the data in the database.
          </p>
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
          <button 
            type="button" 
            className="btn btn-danger"
            onClick={onConfirm}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
