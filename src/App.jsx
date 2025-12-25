import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import React, { useEffect, useRef } from 'react';

import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ListingDetails from './pages/ListingDetails';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateListing from './pages/CreateListing';
import AdminPage from './pages/AdminPage';
import AdminDashboard from './pages/AdminDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import MyListings from './pages/MyListings';
import Messages from './pages/Messages';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';
import DebugToken from './pages/DebugToken';
import About from './pages/About';
import ExpertRegister from './pages/ExpertRegister';
import ExpertLogin from './pages/ExpertLogin';
import ExpertDashboard from './pages/ExpertDashboard';
import ListingBids from './pages/ListingBids';


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
      const token = localStorage.getItem('token');
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

// Protected route component for admin and supervisor
function ProtectedRoute({ children, allowedRoles }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role || 'user';
      
      if (!allowedRoles.includes(userRole)) {
        alert('Access denied. You do not have permission to view this page.');
        navigate('/');
      }
    } catch (err) {
      console.error('Token parsing error:', err);
      navigate('/login');
    }
  }, [navigate, allowedRoles]);
  
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
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/supervisor-dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/mylistings" element={<MyListings />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/debug-token" element={<DebugToken />} />
          <Route path="/about" element={<About />} />
          
          {/* Expert Routes */}
          <Route path="/expert/register" element={<ExpertRegister />} />
          <Route path="/expert/login" element={<ExpertLogin />} />
          <Route path="/expert/dashboard" element={<ExpertDashboard />} />
          
          {/* Listing Bids Management */}
          <Route path="/listing/:listingId/bids" element={<ListingBids />} />
        </Routes>
        <BottomNav />
      </InactivityHandler>
    </Router>
  );
}

export default App;
