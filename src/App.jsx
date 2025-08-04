import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import React, { useEffect, useRef } from 'react';

import Navbar from './components/Navbar';
import ListingDetails from './pages/ListingDetails';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateListing from './pages/CreateListing';
import AdminPage from './pages/AdminPage';
import MyListings from './pages/MyListings';



// Inactivity handler component
function InactivityHandler({ children }) {
  const navigate = useNavigate();
  const timer = useRef(null);
  // Helper to check if JWT token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp is in seconds since epoch
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    // Only redirect to login if not already on login or register page
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/register') {
      navigate('/login');
    }
  };

  // Periodically check token expiry
  useEffect(() => {
    const interval = setInterval(() => {
      let token = '';
      try {
        if (typeof localStorage !== 'undefined' && localStorage !== null) {
          token = localStorage.getItem('token');
        }
      } catch (e) {
        token = '';
      }
      if (isTokenExpired(token)) {
        logout();
      }
    }, 300 * 1000); // check every 5 minutes
    return () => clearInterval(interval);
  }, []);
  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(logout, 15 * 60 * 1000); // 15 minutes
  };
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  return children;
}

function App() {
  // Removed token clearing on app load to preserve login session
  return (
    <Router>
      <InactivityHandler>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<CreateListing />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/mylistings" element={<MyListings />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
        </Routes>
      </InactivityHandler>
    </Router>
  );
}

export default App;
