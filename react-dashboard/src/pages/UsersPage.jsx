

import React, { useState } from 'react';
import AddUserModal from '../components/AddUserModal.jsx';
import SuccessModal from '../components/SuccessModal.jsx';

function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Get current user role from localStorage or context
  // In a real app, this would come from authentication context
  const currentUserRole = localStorage.getItem('userRole') || 'User'; // Default to 'User' for testing
  const isAdmin = currentUserRole === 'Admin';

  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  const handleAddUserSubmit = (userData) => {
    // In a real app, you would send userData to your backend API
    const newUser = {
      id: users.length + 1,
      ...userData
    };
    setUsers([...users, newUser]);
    setIsModalOpen(false);
    
    // Show success modal instead of alert
    setSuccessMessage(`User ${userData.firstName} ${userData.lastName} added successfully!`);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="users-page-layout">
      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUserSubmit}
      />

      {/* Success Modal */}
      <SuccessModal 
        isOpen={isSuccessModalOpen}
        message={successMessage}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      {/* --- MODIFIED: Header now only contains the title --- */}
      <header className="page-header users-page-header">
         <h2>User Management</h2>
         {/* Button removed from here */}
      </header>

      <section className="content-panel">
        {/* --- MODIFIED: New container for heading and button --- */}
        <div className="current-users-header">
          <h3>Current Users</h3>
          {isAdmin && (
            <button className="btn btn-primary add-user-btn" onClick={handleAddUser}>
              Add User
            </button>
          )}
        </div>
        {/* --- End of modification --- */}
        
        <div className="users-table-container">
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Role</th> 
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default UsersPage;