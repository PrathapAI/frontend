import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FaEnvelope, FaHeart, FaBell, FaPlus, FaList, FaHome, FaUserShield, FaClipboardCheck } from 'react-icons/fa';

function Navbar() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Check token and scroll position
  useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser(payload.email);
          setUserRole(payload.role || 'user');
        } catch {
          setUser(null);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
    };
    checkUser();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('storage', checkUser);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('scroll', handleScroll);
    };
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: scrolled ? 'rgba(15, 15, 15, 0.95)' : 'rgba(15, 15, 15, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${scrolled ? '#2a2a2a' : 'transparent'}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: scrolled ? '0 10px 40px rgba(0, 0, 0, 0.5)' : 'none'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '32px'
      }}>
        {/* Logo/Brand */}
        <Link to="/" style={{
          fontSize: '28px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #00d09c 0%, #3498db 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textDecoration: 'none',
          letterSpacing: '-0.02em',
          transition: 'all 0.3s ease'
        }}>
          Campaign★
        </Link>

        {/* Center Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1,
          justifyContent: 'center'
        }}>
          <Link to="/" style={navLinkStyle}
            onMouseOver={e => {
              e.currentTarget.style.background = '#3a3a3a';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(42, 42, 42, 0.5)';
            }}>
            <FaHome style={{ fontSize: '14px' }} /> home
          </Link>
          {user && (
            <>
              <Link to="/create" style={{
                ...navLinkStyle,
                background: 'var(--cred-accent)',
                color: '#0f0f0f',
                fontWeight: 700
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'var(--cred-accent-hover)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'var(--cred-accent)';
              }}>
                <FaPlus style={{ fontSize: '14px' }} /> post ad
              </Link>
              <Link to="/mylistings" style={navLinkStyle}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#3a3a3a';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(42, 42, 42, 0.5)';
                }}>
                <FaList style={{ fontSize: '14px' }} /> my ads
              </Link>
              <Link to="/messages" style={navLinkStyle}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#3a3a3a';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(42, 42, 42, 0.5)';
                }}>
                <FaEnvelope style={{ fontSize: '14px' }} /> messages
              </Link>
              <Link to="/favorites" style={navLinkStyle}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#3a3a3a';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(42, 42, 42, 0.5)';
                }}>
                <FaHeart style={{ fontSize: '14px' }} /> favorites
              </Link>
              <Link to="/notifications" style={navLinkStyle}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#3a3a3a';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(42, 42, 42, 0.5)';
                }}>
                <FaBell style={{ fontSize: '14px' }} /> alerts
              </Link>
              <Link to="/about" style={navLinkStyle}
            onMouseOver={e => {
              e.currentTarget.style.background = '#3a3a3a';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(42, 42, 42, 0.5)';
            }}>
            about
          </Link>
              {userRole === 'admin' && (
                <Link to="/admin-dashboard" style={{
                  ...navLinkStyle,
                  background: 'rgba(231, 76, 60, 0.2)',
                  borderLeft: '3px solid #e74c3c'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(231, 76, 60, 0.3)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(231, 76, 60, 0.2)';
                }}>
                  <FaUserShield style={{ fontSize: '14px' }} /> admin
                </Link>
              )}
              {(userRole === 'admin' || userRole === 'supervisor') && (
                <Link to="/supervisor-dashboard" style={{
                  ...navLinkStyle,
                  background: 'rgba(52, 152, 219, 0.2)',
                  borderLeft: '3px solid #3498db'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(52, 152, 219, 0.3)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(52, 152, 219, 0.2)';
                }}>
                  <FaClipboardCheck style={{ fontSize: '14px' }} /> supervisor
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Side - Auth */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {user ? (
            <>
              <span style={{
                fontSize: '13px',
                color: '#888',
                fontWeight: 500
              }}>
                {user.split('@')[0]}
              </span>
              <button onClick={handleLogout} style={{
                background: 'transparent',
                border: '2px solid #e74c3c',
                color: '#e74c3c',
                borderRadius: '12px',
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'lowercase'
              }}
              onMouseOver={e => {
                e.target.style.background = '#e74c3c';
                e.target.style.color = '#fff';
              }}
              onMouseOut={e => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#e74c3c';
              }}>
                logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={authButtonStyle}
                onMouseOver={e => {
                  e.currentTarget.style.background = '#3a3a3a';
                  e.currentTarget.style.borderColor = 'var(--cred-accent)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(42, 42, 42, 0.5)';
                  e.currentTarget.style.borderColor = '#2a2a2a';
                }}>
                login
              </Link>
              <Link to="/register" style={{
                ...authButtonStyle,
                background: 'var(--cred-accent)',
                color: '#0f0f0f',
                border: 'none'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'var(--cred-accent-hover)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'var(--cred-accent)';
              }}>
                sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const navLinkStyle = {
  textDecoration: 'none',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 600,
  padding: '10px 20px',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  textTransform: 'lowercase',
  border: '2px solid transparent',
  background: 'rgba(42, 42, 42, 0.5)'
};

const authButtonStyle = {
  textDecoration: 'none',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 700,
  padding: '8px 20px',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  textTransform: 'lowercase',
  border: '2px solid #2a2a2a',
  background: 'rgba(42, 42, 42, 0.5)'
};

export default Navbar;
