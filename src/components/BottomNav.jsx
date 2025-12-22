import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPlus, FaBars, FaEnvelope, FaUser } from 'react-icons/fa';

function BottomNav() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItemStyle = (path) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    color: isActive(path) ? 'var(--cred-accent)' : '#888',
    fontSize: '11px',
    fontWeight: isActive(path) ? '700' : '500',
    gap: '4px',
    flex: 1,
    padding: '8px 0',
    transition: 'all 0.3s ease',
    position: 'relative'
  });

  const iconStyle = (path) => ({
    fontSize: '20px',
    color: isActive(path) ? 'var(--cred-accent)' : '#888',
    transition: 'all 0.3s ease'
  });

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: '#0f0f0f',
      borderTop: '1px solid #2a2a2a',
      display: 'none', // Will be shown on mobile via CSS
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)'
    }}
    className="bottom-navigation">
      <Link to="/" style={navItemStyle('/')}>
        <FaHome style={iconStyle('/')} />
        <span>Home</span>
      </Link>

      {token && (
        <>
          <Link to="/messages" style={navItemStyle('/messages')}>
            <FaEnvelope style={iconStyle('/messages')} />
            <span>Chats</span>
          </Link>

          <Link to="/create" style={{
            ...navItemStyle('/create'),
            position: 'relative',
            top: '-10px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--cred-accent) 0%, var(--cred-blue) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 208, 156, 0.4)',
              border: '3px solid #0f0f0f'
            }}>
              <FaPlus style={{ fontSize: '20px', color: '#000' }} />
            </div>
            <span style={{ color: '#fff', fontWeight: '700' }}>Sell</span>
          </Link>

          <Link to="/mylistings" style={navItemStyle('/mylistings')}>
            <FaBars style={iconStyle('/mylistings')} />
            <span>My Ads</span>
          </Link>

          <button 
            onClick={() => {
              const event = new Event('toggleMobileMenu');
              window.dispatchEvent(event);
            }}
            style={{
              ...navItemStyle('/account'),
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}>
            <FaUser style={iconStyle('/account')} />
            <span>Account</span>
          </button>
        </>
      )}

      {!token && (
        <>
          <Link to="/login" style={navItemStyle('/login')}>
            <FaUser style={iconStyle('/login')} />
            <span>Login</span>
          </Link>
          
          <Link to="/register" style={navItemStyle('/register')}>
            <FaPlus style={iconStyle('/register')} />
            <span>Sign Up</span>
          </Link>
        </>
      )}
    </div>
  );
}

export default BottomNav;
