import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    <div className="expert-register-container" style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>Expert Registration</h1>
      <p>Join as an expert to help clients sell their properties, find matches, or secure jobs</p>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Username *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label>First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label>Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>

        <div>
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Expertise Area *</label>
          <select
            name="expertiseArea"
            value={formData.expertiseArea}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="Real Estate">Real Estate</option>
            <option value="Marriage Bureau">Marriage Bureau</option>
            <option value="Job Assistance">Job Assistance</option>
          </select>
        </div>

        <div>
          <label>Location ID * (Get from locations list)</label>
          <input
            type="number"
            name="locationID"
            value={formData.locationID}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Years of Experience</label>
          <input
            type="number"
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Bio / About Yourself</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            style={{ width: '100%', padding: '8px' }}
            placeholder="Tell clients about your expertise and experience..."
          />
        </div>

        <div>
          <label>Commission Rate (%)</label>
          <input
            type="number"
            step="0.01"
            name="commissionRate"
            value={formData.commissionRate}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Minimum Bid Amount</label>
          <input
            type="number"
            step="0.01"
            name="minimumBidAmount"
            value={formData.minimumBidAmount}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Registering...' : 'Register as Expert'}
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        Already have an account?{' '}
        <span
          onClick={() => navigate('/expert/login')}
          style={{ color: '#007bff', cursor: 'pointer' }}
        >
          Login here
        </span>
      </p>
    </div>
  );
}

export default ExpertRegister;
