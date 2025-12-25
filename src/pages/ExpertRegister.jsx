import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserTie, FaEnvelope, FaLock, FaUser, FaPhone, FaBriefcase } from 'react-icons/fa';
import BackButton from '../components/BackButton';
import '../styles/cred-theme.css';
import '../styles/mobile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ExpertRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    expertiseArea: 'Real Estate',
    locationID: '',
    yearsOfExperience: '',
    bio: '',
    commissionRate: '',
    minimumBidAmount: ''
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/experts/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        expertiseArea: formData.expertiseArea,
        locationID: parseInt(formData.locationID),
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : 0,
        bio: formData.bio,
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : null,
        minimumBidAmount: formData.minimumBidAmount ? parseFloat(formData.minimumBidAmount) : null
      });

      // Store token
      localStorage.setItem('expertToken', response.data.token);
      localStorage.setItem('expertData', JSON.stringify(response.data.expert));

      // Redirect to expert dashboard
      navigate('/expert/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cred-page" style={{ padding: '40px 20px', minHeight: '100vh' }}>
      <div className="animate-fade-in-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <BackButton />
        
        <div className="cred-card glass" style={{ padding: '40px 32px', marginTop: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <FaUserTie style={{ fontSize: '48px', color: 'var(--cred-accent)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
              Expert Registration
            </h2>
            <p style={{ color: 'var(--cred-text-secondary)', fontSize: '14px' }}>
              Join as an expert to help clients sell their properties, find matches, or secure jobs
            </p>
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)', borderRadius: '12px', color: '#e74c3c', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', zIndex: 1 }} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username *"
                required
                className="cred-input"
                style={{ paddingLeft: '50px', width: '100%' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', zIndex: 1 }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email *"
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
                placeholder="Password * (min 8 characters)"
                required
                className="cred-input"
                style={{ paddingLeft: '50px', width: '100%' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', zIndex: 1 }} />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password *"
                required
                className="cred-input"
                style={{ paddingLeft: '50px', width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name *"
                required
                className="cred-input"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name *"
                required
                className="cred-input"
              />
            </div>

            <div style={{ position: 'relative' }}>
              <FaPhone style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', zIndex: 1 }} />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number *"
                required
                className="cred-input"
                style={{ paddingLeft: '50px', width: '100%' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <FaBriefcase style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', zIndex: 1 }} />
              <select
                name="expertiseArea"
                value={formData.expertiseArea}
                onChange={handleChange}
                required
                className="cred-input"
                style={{ paddingLeft: '50px', width: '100%', appearance: 'none' }}
              >
                <option value="Real Estate">Real Estate</option>
                <option value="Marriage Bureau">Marriage Bureau</option>
                <option value="Job Assistance">Job Assistance</option>
              </select>
            </div>

            <input
              type="number"
              name="locationID"
              value={formData.locationID}
              onChange={handleChange}
              placeholder="Location ID * (Get from locations list)"
              required
              className="cred-input"
            />

            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              placeholder="Years of Experience"
              className="cred-input"
            />

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Bio / About Yourself (Tell clients about your expertise...)"
              className="cred-input"
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input
                type="number"
                step="0.01"
                name="commissionRate"
                value={formData.commissionRate}
                onChange={handleChange}
                placeholder="Commission Rate (%)"
                className="cred-input"
              />
              <input
                type="number"
                step="0.01"
                name="minimumBidAmount"
                value={formData.minimumBidAmount}
                onChange={handleChange}
                placeholder="Minimum Bid Amount"
                className="cred-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cred-btn"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Registering...' : 'Register as Expert'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--cred-text-secondary)', fontSize: '14px' }}>
            Already have an account?{' '}
            <span
              onClick={() => navigate('/expert/login')}
              style={{ color: 'var(--cred-accent)', cursor: 'pointer', fontWeight: 600 }}
            >
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExpertRegister;
