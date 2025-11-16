import React from 'react';
import { useNavigate } from 'react-router-dom';

function AddUserPage() {
  const navigate = useNavigate();

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would get the form data here
    // and send it to your backend API to create the user.
    alert('User added successfully! (Mock)');
    // Redirect back to the users list page after adding
    navigate('/dashboard/users'); 
  };

  const handleCancel = () => {
    // Go back to the users list page without adding
    navigate('/dashboard/users');
  };

  return (
    <div className="add-user-layout">
      <h2>Add New User</h2>
      
      {/* Reusing login form styles */}
      <form className="add-user-form login-form" onSubmit={handleAddUserSubmit}> 
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input type="text" id="firstName" name="firstName" required />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input type="text" id="lastName" name="lastName" required />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" name="email" required />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        
        {/* Optional: Add Role selection */}
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" required>
            <option value="User">User</option>
            <option value="admin" disabled>Admin</option> {/* Added 'disabled' attribute */}
          </select>
        </div>
        
        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add User
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddUserPage;