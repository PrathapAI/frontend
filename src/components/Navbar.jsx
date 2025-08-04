import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import '../navbar-theme.css';


function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check token on every render (or when location changes)
  useEffect(() => {
    const checkUser = () => {
      let token = '';
      try {
        if (typeof localStorage !== 'undefined' && localStorage !== null) {
          token = localStorage.getItem('token');
        }
      } catch (e) {
        token = '';
      }
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser(payload.email);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Stay on home page after logout
    navigate('/');
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-center">
        <Link className="navbar-link" to="/">Home</Link>
        {user && <Link className="navbar-link" to="/create">Create</Link>}
        {!user && <>
          <Link className="navbar-link" to="/login">Login</Link>
          <Link className="navbar-link" to="/register">Register</Link>
        </>}
      </div>
      <div className="navbar-right">
        {user && <>
          <span style={{marginRight: '0.5rem'}}>Logged in as <strong>{user}</strong></span>
          <button className="navbar-btn" onClick={handleLogout}>Logout</button>
        </>}
      </div>
      {user && (
        <button onClick={() => navigate('/mylistings')} className="nav-btn">
          My Listings
        </button>
      )}
    </nav>
  );
}

export default Navbar;
