import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../page-ribbon.css';
import '../form-theme.css';
import '../home-theme.css';
import '../form-button.css';
import { FaSignInAlt } from 'react-icons/fa';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Always clear form fields when page loads
  React.useEffect(() => {
    setForm({ email: '', password: '' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/auth/login', form);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/');
      } else {
        setError('No token received.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="page-bg-blue-accent">
      <div className="page-center-form">
        <div className="form-box">
          <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
            <button type="submit"><FaSignInAlt /> Login</button>
            {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
