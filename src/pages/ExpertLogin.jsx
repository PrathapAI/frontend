import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserTie, FaEnvelope, FaLock } from 'react-icons/fa';
import BackButton from '../components/BackButton';
import '../styles/cred-theme.css';
import '../styles/mobile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ExpertLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/experts/login`, formData);

      // Store token and expert data
      localStorage.setItem('expertToken', response.data.token);
      localStorage.setItem('expertData', JSON.stringify(response.data.expert));

      // Redirect to expert dashboard
      navigate('/expert/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cred-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '480px' }}>
        <BackButton />
        
        <div className="cred-card glass" style={{ padding: '48px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <FaUserTie style={{ fontSize: '48px', color: 'var(--cred-accent)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
              Expert Login
            </h2>
            <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px' }}>
              Login to manage your bids and clients
            </p>
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)', borderRadius: '12px', color: '#e74c3c', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', zIndex: 1 }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="cred-input"
                style={{ paddingLeft: '50px', width: '100%' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', zIndex: 1 }} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="cred-input"
                style={{ paddingLeft: '50px', width: '100%' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cred-btn"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Logging in...' : 'Login as Expert'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--cred-text-secondary)', fontSize: '14px' }}>
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/expert/register')}
              style={{ color: 'var(--cred-accent)', cursor: 'pointer', fontWeight: 600 }}
            >
              Register as Expert
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExpertLogin;
