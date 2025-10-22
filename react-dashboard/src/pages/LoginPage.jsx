import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  // The 'useNavigate' hook lets us redirect the user
  const navigate = useNavigate();

  const handleLogin = (e) => {
    // Prevent the form from refreshing the page
    e.preventDefault();
    
    //
    // This is where you would add your real authentication logic
    //
    
    // If login is successful, redirect to the dashboard
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <p>Please log in to access your dashboard.</p>
        
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="btn btn-primary login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;