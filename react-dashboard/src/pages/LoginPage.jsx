import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Add authentication logic here
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        
        {/* --- 2. Add the Image Component Here --- */}
        <img src="/globe.png" alt="App Logo" className="login-logo" />
        {/* --------------------------------------- */}

        <h2>RSC GLOBE</h2>
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