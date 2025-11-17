

import React, { useState } from 'react';
import AddUserModal from '../components/AddUserModal.jsx';

// --- Mock Data for Users ---
const mockUsers = [
  { id: 1, firstName: 'Juan', lastName: 'Dela Cruz', email: 'juan.delacruz@company.com', role: 'Admin' },
  { id: 2, firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@company.com', role: 'User' },
  { id: 3, firstName: 'Pedro', lastName: 'Reyes', email: 'pedro.reyes@company.com', role: 'User' },
];

function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState(mockUsers);

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
    alert(`User ${userData.firstName} ${userData.lastName} added successfully!`);
  };

  return (
    <div className="users-page-layout">
      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUserSubmit}
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
          <button className="btn btn-primary add-user-btn" onClick={handleAddUser}>
           Add User
          </button>
        </div>
        {/* --- End of modification --- */}
        
        <div className="users-table-container">
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email Address</th>
                <th>Role</th> 
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
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