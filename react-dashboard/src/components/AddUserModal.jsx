import React, { useState } from 'react';

function AddUserModal({ isOpen, onClose, onAddUser }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'User'
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!formData.email.toLowerCase().endsWith('@globetelecom.com')) {
      newErrors.email = 'Email must be a @globetelecom.com address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Call parent callback with form data
    onAddUser(formData);
    
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'User'
    });
    setErrors({});
    setShowPassword(false);
  };

  const handleClose = () => {
    // Reset form on close
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'User'
    });
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content add-user-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>👤 Add New User</h2>
          <button className="modal-close-btn" onClick={handleClose} title="Close">
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <p className="add-user-subtitle">Create a new user account for the system</p>
          
          <form className="add-user-modal-form" onSubmit={handleSubmit} id="addUserForm">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Enter first name"
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Enter last name"
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address <span className="required">*</span></label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="user@example.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password <span className="required">*</span></label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Min. 8 characters"
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
              <span className="field-hint">Password must be at least 8 characters long</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Role <span className="required">*</span></label>
              <select 
                id="role" 
                name="role" 
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
              <span className="field-hint">Select the user's access level</span>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="addUserForm"
            className="btn btn-primary"
          >
            Add User
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddUserModal;
