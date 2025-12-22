import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import axios from 'axios';
import { FaUserPlus, FaUser, FaEnvelope, FaPhone, FaLock, FaMapMarkerAlt } from 'react-icons/fa';
import BackButton from '../components/BackButton';
import useAndroidBackButton from '../hooks/useAndroidBackButton';

function Register() {
  // Sync with Android back button
  useAndroidBackButton();
  const [form, setForm] = useState({ 
    username: '', 
    name: '', 
    email: '', 
    password: '', 
    phone: '',
    age: '',
    gender: '',
    state: '',
    district: '',
    mandal: '',
    village: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Location data
  const [locations, setLocations] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  
  // Modal states
  const [showNewMandalModal, setShowNewMandalModal] = useState(false);
  const [showNewVillageModal, setShowNewVillageModal] = useState(false);
  const [newMandalName, setNewMandalName] = useState('');
  const [newVillageName, setNewVillageName] = useState('');
  const [showPhoneExistsDialog, setShowPhoneExistsDialog] = useState(false);
  
  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  
  // Password strength states
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const [showPasswordGuidelines, setShowPasswordGuidelines] = useState(false);

  // Fetch locations on mount
  useEffect(() => {
    API.get('/crud/locations').then(res => {
      setLocations(res.data);
    });
  }, []);

  // Update districts when state changes
  useEffect(() => {
    if (form.state) {
      setDistricts([...new Set(locations.filter(l => l.state === form.state).map(l => l.district))]);
    } else {
      setDistricts([]);
    }
    setForm(f => ({ ...f, district: '', mandal: '', village: '' }));
  }, [form.state, locations]);

  // Update mandals when district changes
  useEffect(() => {
    if (form.state && form.district) {
      setMandals([...new Set(locations.filter(l => l.state === form.state && l.district === form.district).map(l => l.mandal))]);
    } else {
      setMandals([]);
    }
    setForm(f => ({ ...f, mandal: '', village: '' }));
  }, [form.district, form.state, locations]);

  // Update villages when mandal changes
  useEffect(() => {
    if (form.state && form.district && form.mandal) {
      setVillages([...new Set(locations.filter(l => l.state === form.state && l.district === form.district && l.mandal === form.mandal).map(l => l.village))]);
    } else {
      setVillages([]);
    }
    setForm(f => ({ ...f, village: '' }));
  }, [form.mandal, form.district, form.state, locations]);

  const states = [...new Set(locations.map(l => l.state))].filter(Boolean);

  // Generate OTP handler
  const handleGenerateOTP = async () => {
    if (!form.email) {
      setError('Please enter your email address');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/generate-otp`, {
        email: form.email
      });
      setGeneratedOtp(response.data.otp);
      setOtpSent(true);
      setError('');
      alert(`OTP sent to ${form.email}! Check your email inbox.`);
    } catch (err) {
      console.error('Error generating OTP:', err);
      setError('Failed to send OTP email');
    }
  };

  // Verify OTP handler
  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter OTP');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
        email: form.email,
        otp: otp
      });
      setOtpVerified(true);
      setError('');
      alert('Email verified successfully!');
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(err.response?.data?.error || 'Invalid OTP');
    }
  };

  // Add new mandal handler
  const handleAddMandal = async () => {
    if (!newMandalName.trim()) {
      alert('Please enter a mandal name');
      return;
    }
    if (!form.state || !form.district) {
      alert('Please select state and district first');
      return;
    }
    try {
      await API.post('/crud/locations', {
        state: form.state,
        district: form.district,
        mandal: newMandalName.trim(),
        village: ''
      });
      const res = await API.get('/crud/locations');
      setLocations(res.data);
      setForm({ ...form, mandal: newMandalName.trim() });
      setNewMandalName('');
      setShowNewMandalModal(false);
      alert('Mandal added successfully!');
    } catch (err) {
      console.error('Error adding mandal:', err);
      alert('Failed to add mandal');
    }
  };

  // Add new village handler
  const handleAddVillage = async () => {
    if (!newVillageName.trim()) {
      alert('Please enter a village name');
      return;
    }
    if (!form.state || !form.district || !form.mandal) {
      alert('Please select state, district, and mandal first');
      return;
    }
    try {
      await API.post('/crud/locations', {
        state: form.state,
        district: form.district,
        mandal: form.mandal,
        village: newVillageName.trim()
      });
      const res = await API.get('/crud/locations');
      setLocations(res.data);
      setForm({ ...form, village: newVillageName.trim() });
      setNewVillageName('');
      setShowNewVillageModal(false);
      alert('Village added successfully!');
    } catch (err) {
      console.error('Error adding village:', err);
      alert('Failed to add village');
    }
  };

  // Check password strength on change
  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.username || !form.name || !form.email || !form.password || !form.phone || !form.state || !form.district || !form.mandal || !form.village) {
      setError('all fields are required');
      return;
    }

    if (!otpVerified) {
      setError('please verify your email with OTP');
      return;
    }

    if (form.phone.length !== 10) {
      setError('phone number must be exactly 10 digits');
      return;
    }

    if (!/^\d{10}$/.test(form.phone)) {
      setError('phone number must contain only digits');
      return;
    }

    // Strong password validation
    if (!passwordStrength.hasMinLength || !passwordStrength.hasUpperCase || 
        !passwordStrength.hasLowerCase || !passwordStrength.hasNumber || 
        !passwordStrength.hasSpecialChar) {
      setError('password must meet all security requirements');
      return;
    }

    try {
      const address = `${form.village}, ${form.mandal}, ${form.district}, ${form.state}`;
      
      // Manually construct the payload to ensure correct values
      const payload = {
        username: form.username,
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: address,
        age: form.age ? Number(form.age) : 0, // Send 0 as default instead of null
        gender: form.gender || '', // Send empty string as default instead of null
      };

      console.log('Submitting registration data:', payload);

      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, payload);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error("Register failed:", error);
      if (error.response?.data?.field === 'phone' && error.response?.data?.error === 'Phone number already exists') {
        setShowPhoneExistsDialog(true);
      } else {
        setError(error.response?.data?.message || error.response?.data?.error || "registration failed");
      }
    }
  };

  if (success) {
    return (
      <div className="cred-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="animate-fade-in-up" style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--cred-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'pulse 2s ease infinite'
          }}>
            <FaUserPlus style={{ fontSize: '36px', color: 'var(--cred-darker)' }} />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px', color: '#000' }}>
            welcome aboard!
          </h2>
          <p style={{ color: '#555', fontSize: '1.1rem' }}>
            redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cred-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '140px 20px 40px' }}>
      <BackButton />
      <div className="animate-fade-in-up" style={{
        maxWidth: '480px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div className="cred-card glass" style={{ padding: '48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
              create account.
            </h2>
            <p style={{ color: '#fff', fontSize: '14px' }}>
              it takes less than a minute.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', fontSize: '14px' }} />
              <input
                type="text"
                placeholder="username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="cred-input"
                style={{ paddingLeft: '50px' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', fontSize: '14px' }} />
              <input
                type="text"
                placeholder="full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="cred-input"
                style={{ paddingLeft: '50px' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', fontSize: '14px' }} />
              <input
                type="email"
                placeholder="email address"
                value={form.email}
                onChange={e => {
                  setForm({ ...form, email: e.target.value });
                  setOtpSent(false);
                  setOtpVerified(false);
                  setOtp('');
                }}
                className="cred-input"
                style={{ paddingLeft: '50px' }}
                disabled={otpVerified}
              />
            </div>

            {!otpSent && !otpVerified && form.email && (
              <button 
                type="button"
                onClick={handleGenerateOTP}
                style={{ 
                  width: '100%',
                  padding: '12px',
                  background: 'var(--cred-accent)', 
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'lowercase',
                  marginTop: '-12px',
                  marginBottom: '12px'
                }}
              >
                send OTP to email
              </button>
            )}

            {otpSent && !otpVerified && (
              <div style={{ marginTop: '-12px', marginBottom: '12px' }}>
                <div style={{ 
                  padding: '12px', 
                  background: 'rgba(0, 208, 156, 0.1)', 
                  borderRadius: '8px', 
                  marginBottom: '12px',
                  border: '1px solid var(--cred-accent)'
                }}>
                  <p style={{ color: '#fff', fontSize: '12px', margin: '0 0 8px 0' }}>
                    ✅ OTP sent to {form.email}
                  </p>
                  <p style={{ color: '#ffa500', fontSize: '11px', margin: 0 }}>
                    📧 Check your spam/junk folder if not received in inbox
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="enter 6-digit OTP"
                  value={otp}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      setOtp(value);
                    }
                  }}
                  className="cred-input"
                  maxLength="6"
                  style={{ marginBottom: '12px' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    onClick={handleVerifyOTP}
                    style={{ 
                      flex: 1,
                      padding: '12px',
                      background: 'var(--cred-accent)', 
                      color: '#000',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      textTransform: 'lowercase'
                    }}
                  >
                    verify OTP
                  </button>
                  <button 
                    type="button"
                    onClick={handleGenerateOTP}
                    style={{ 
                      flex: 1,
                      padding: '12px',
                      background: 'transparent', 
                      color: '#000',
                      border: '1px solid rgba(0,0,0,0.3)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      textTransform: 'lowercase'
                    }}
                  >
                    resend OTP
                  </button>
                </div>
              </div>
            )}

            {otpVerified && (
              <div style={{ 
                padding: '12px', 
                background: 'rgba(0, 208, 156, 0.2)', 
                borderRadius: '8px', 
                marginTop: '-12px',
                marginBottom: '12px',
                border: '2px solid var(--cred-accent)',
                textAlign: 'center'
              }}>
                <p style={{ color: 'var(--cred-accent)', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                  ✓ Email verified
                </p>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <FaPhone style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', fontSize: '14px' }} />
              <input
                type="tel"
                placeholder="phone number (10 digits)"
                value={form.phone}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setForm({ ...form, phone: value });
                  }
                }}
                className="cred-input"
                style={{ paddingLeft: '50px' }}
                maxLength="10"
                pattern="\d{10}"
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="number"
                placeholder="age"
                value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })}
                className="cred-input"
                min="1"
                max="120"
              />
            </div>

            <select 
              className="cred-input" 
              value={form.gender} 
              onChange={e => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <select 
              className="cred-input" 
              value={form.state} 
              onChange={e => setForm({ ...form, state: e.target.value })}
            >
              <option value="">select state</option>
              {states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select 
              className="cred-input" 
              value={form.district} 
              onChange={e => setForm({ ...form, district: e.target.value })}
            >
              <option value="">select district</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select 
              className="cred-input" 
              value={form.mandal} 
              onChange={e => setForm({ ...form, mandal: e.target.value })}
            >
              <option value="">select mandal</option>
              {mandals.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {form.state && form.district && (
              <button 
                type="button"
                onClick={() => { setNewMandalName(''); setShowNewMandalModal(true); }} 
                style={{ 
                  width: '100%',
                  padding: '12px',
                  background: 'var(--cred-accent)', 
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'lowercase',
                  marginTop: '-12px',
                  marginBottom: '12px'
                }}
              >
                + add new mandal
              </button>
            )}

            <select 
              className="cred-input" 
              value={form.village} 
              onChange={e => setForm({ ...form, village: e.target.value })}
            >
              <option value="">select village</option>
              {villages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            {form.state && form.district && form.mandal && (
              <button 
                type="button"
                onClick={() => { setNewVillageName(''); setShowNewVillageModal(true); }} 
                style={{ 
                  width: '100%',
                  padding: '12px',
                  background: 'var(--cred-accent)', 
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'lowercase'
                }}
              >
                + add new village
              </button>
            )}

            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', fontSize: '14px' }} />
              <input
                type="password"
                placeholder="create strong password"
                value={form.password}
                onChange={e => {
                  setForm({ ...form, password: e.target.value });
                  checkPasswordStrength(e.target.value);
                }}
                onFocus={() => setShowPasswordGuidelines(true)}
                onBlur={() => setTimeout(() => setShowPasswordGuidelines(false), 200)}
                className="cred-input"
                style={{ paddingLeft: '50px' }}
              />
            </div>

            {/* Password Strength Guidelines */}
            {showPasswordGuidelines && (
              <div style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                marginTop: '-12px',
                marginBottom: '12px',
                border: '2px solid var(--cred-accent)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <h4 style={{ 
                  margin: '0 0 12px 0', 
                  color: '#000', 
                  fontSize: '13px', 
                  fontWeight: '700',
                  textTransform: 'lowercase'
                }}>
                  password requirements:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ 
                      color: passwordStrength.hasMinLength ? '#27ae60' : '#e74c3c',
                      fontWeight: 'bold'
                    }}>
                      {passwordStrength.hasMinLength ? '✓' : '✗'}
                    </span>
                    <span style={{ color: '#333' }}>At least 8 characters</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ 
                      color: passwordStrength.hasUpperCase ? '#27ae60' : '#e74c3c',
                      fontWeight: 'bold'
                    }}>
                      {passwordStrength.hasUpperCase ? '✓' : '✗'}
                    </span>
                    <span style={{ color: '#333' }}>One uppercase letter (A-Z)</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ 
                      color: passwordStrength.hasLowerCase ? '#27ae60' : '#e74c3c',
                      fontWeight: 'bold'
                    }}>
                      {passwordStrength.hasLowerCase ? '✓' : '✗'}
                    </span>
                    <span style={{ color: '#333' }}>One lowercase letter (a-z)</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ 
                      color: passwordStrength.hasNumber ? '#27ae60' : '#e74c3c',
                      fontWeight: 'bold'
                    }}>
                      {passwordStrength.hasNumber ? '✓' : '✗'}
                    </span>
                    <span style={{ color: '#333' }}>One number (0-9)</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px'
                  }}>
                    <span style={{ 
                      color: passwordStrength.hasSpecialChar ? '#27ae60' : '#e74c3c',
                      fontWeight: 'bold'
                    }}>
                      {passwordStrength.hasSpecialChar ? '✓' : '✗'}
                    </span>
                    <span style={{ color: '#333' }}>One special character (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', fontSize: '14px' }} />
              <input
                type="password"
                placeholder="password (min 6 chars)"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="cred-input"
                style={{ paddingLeft: '50px' }}
              />
            </div>

            <button type="submit" className="cred-btn" style={{ width: '100%', marginTop: '8px' }}>
              <FaUserPlus /> create account
            </button>

            <div style={{
              textAlign: 'center',
              marginTop: '16px',
              padding: '20px',
              background: '#f5f5f5',
              borderRadius: '12px',
              border: '1px solid #ddd'
            }}>
              <p style={{ color: '#555', fontSize: '14px', marginBottom: '12px' }}>
                already have an account?
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="cred-btn-secondary"
                style={{ width: '100%' }}
              >
                login instead
              </button>
            </div>

            {error && (
              <div className="animate-fade-in" style={{
                padding: '16px',
                background: 'rgba(231, 76, 60, 0.1)',
                border: '1px solid var(--cred-pink)',
                borderRadius: '12px',
                color: 'var(--cred-pink)',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Add New Mandal Modal */}
      {showNewMandalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', minWidth: '400px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, color: '#000', fontSize: '24px', fontWeight: '700', textTransform: 'lowercase', marginBottom: '16px' }}>add new mandal</h3>
            <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(0, 208, 156, 0.1)', borderRadius: '8px', border: '1px solid var(--cred-accent)' }}>
              <div style={{ marginBottom: '8px' }}><strong style={{ color: '#000', textTransform: 'lowercase' }}>state:</strong> <span style={{ color: '#000' }}>{form.state}</span></div>
              <div><strong style={{ color: '#000', textTransform: 'lowercase' }}>district:</strong> <span style={{ color: '#000' }}>{form.district}</span></div>
            </div>
            <input
              className="cred-input"
              type="text"
              placeholder="mandal name"
              value={newMandalName}
              onChange={e => setNewMandalName(e.target.value)}
              style={{ width: '100%', marginBottom: '24px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="cred-btn-secondary"
                onClick={() => { setShowNewMandalModal(false); setNewMandalName(''); }} 
                style={{ textTransform: 'lowercase' }}
              >
                cancel
              </button>
              <button 
                className="cred-btn"
                onClick={handleAddMandal} 
                style={{ textTransform: 'lowercase' }}
              >
                add mandal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Village Modal */}
      {showNewVillageModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', minWidth: '400px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0, color: '#000', fontSize: '24px', fontWeight: '700', textTransform: 'lowercase', marginBottom: '16px' }}>add new village</h3>
            <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(0, 208, 156, 0.1)', borderRadius: '8px', border: '1px solid var(--cred-accent)' }}>
              <div style={{ marginBottom: '8px' }}><strong style={{ color: '#000', textTransform: 'lowercase' }}>state:</strong> <span style={{ color: '#000' }}>{form.state}</span></div>
              <div style={{ marginBottom: '8px' }}><strong style={{ color: '#000', textTransform: 'lowercase' }}>district:</strong> <span style={{ color: '#000' }}>{form.district}</span></div>
              <div><strong style={{ color: '#000', textTransform: 'lowercase' }}>mandal:</strong> <span style={{ color: '#000' }}>{form.mandal}</span></div>
            </div>
            <input
              className="cred-input"
              type="text"
              placeholder="village name"
              value={newVillageName}
              onChange={e => setNewVillageName(e.target.value)}
              style={{ width: '100%', marginBottom: '24px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="cred-btn-secondary"
                onClick={() => { setShowNewVillageModal(false); setNewVillageName(''); }} 
                style={{ textTransform: 'lowercase' }}
              >
                cancel
              </button>
              <button 
                className="cred-btn"
                onClick={handleAddVillage} 
                style={{ textTransform: 'lowercase' }}
              >
                add village
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Number Already Exists Dialog */}
      {showPhoneExistsDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', minWidth: '400px', maxWidth: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'rgba(231, 76, 60, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 24px',
              border: '3px solid var(--cred-pink)'
            }}>
              <FaPhone style={{ fontSize: '32px', color: 'var(--cred-pink)' }} />
            </div>
            <h3 style={{ marginTop: 0, color: '#000', fontSize: '28px', fontWeight: '800', textTransform: 'lowercase', marginBottom: '16px' }}>
              phone number exists!
            </h3>
            <p style={{ color: '#555', fontSize: '16px', marginBottom: '32px', lineHeight: '1.6' }}>
              This phone number is already registered. You can either register with a different number or login with your existing account.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="cred-btn"
                onClick={() => navigate('/login')}
                style={{ width: '100%', textTransform: 'lowercase', fontSize: '16px', padding: '14px' }}
              >
                login instead
              </button>
              <button 
                className="cred-btn-secondary"
                onClick={() => { 
                  setShowPhoneExistsDialog(false); 
                  setForm({ ...form, phone: '' });
                }}
                style={{ width: '100%', textTransform: 'lowercase', fontSize: '16px', padding: '14px' }}
              >
                use different number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
