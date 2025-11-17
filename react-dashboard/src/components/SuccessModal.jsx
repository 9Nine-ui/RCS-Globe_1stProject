import React from 'react';

function SuccessModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>✓ Success</h2>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <p className="success-message-text">
            {message}
          </p>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;
