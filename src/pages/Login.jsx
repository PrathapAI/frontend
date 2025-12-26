import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { FaSignInAlt, FaLock, FaPhone, FaKey, FaEnvelope } from 'react-icons/fa';
import BackButton from '../components/BackButton';
import useAndroidBackButton from '../hooks/useAndroidBackButton';

function Login() {
  // Sync with Android back button
  useAndroidBackButton();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [role, setRole] = useState(''); // '', 'user', 'expert'
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: enter email, 2: verify OTP, 3: reset password
  const [forgotEmail, setForgotEmail] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [enteredOTP, setEnteredOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const navigate = useNavigate();

  // Always clear form fields when page loads
  React.useEffect(() => {
    setForm({ phone: '', password: '' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (role === 'expert') {
        // Expert login using phone number
        const res = await API.post('/api/experts/login', { phoneNumber: form.phone, password: form.password });
        if (res.data.token) {
          localStorage.setItem('expertToken', res.data.token);
          localStorage.setItem('expertData', JSON.stringify(res.data.expert));
          navigate('/expert/dashboard');
        } else {
          setError('No token received.');
        }
      } else if (role === 'marriage') {
        // Marriage bureau login
        const res = await API.post('/api/experts/login', { phoneNumber: form.phone, password: form.password });
        if (res.data.token) {
          localStorage.setItem('expertToken', res.data.token);
          localStorage.setItem('expertData', JSON.stringify(res.data.expert));
          navigate('/expert/dashboard');
        } else {
          setError('No token received.');
        }
      } else {
        // Regular user login
        const res = await API.post('/auth/login', { phone: form.phone, password: form.password });
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          navigate('/');
        } else {
          setError('No token received.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleSendOTP = async () => {
    setForgotError('');
    setForgotSuccess('');
    
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address');
      return;
    }

    try {
      const res = await API.post('/auth/send-reset-otp', { email: forgotEmail });
      setGeneratedOTP(res.data.otp);
      setForgotPasswordStep(2);
      setForgotSuccess(`OTP sent to your email!`);
    } catch (err) {
      setForgotError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOTP = () => {
    setForgotError('');
    
    if (enteredOTP !== generatedOTP) {
      setForgotError('Invalid OTP. Please try again.');
      return;
    }

    setForgotPasswordStep(3);
    setForgotSuccess('OTP verified! Please enter your new password.');
  };

  const handleResetPassword = async () => {
    setForgotError('');
    
    if (!newPassword || newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    try {
      // Reset password using auth endpoint
      await API.post('/auth/reset-password', {
        email: forgotEmail,
        otp: enteredOTP,
        newPassword: newPassword
      });

      setForgotSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordStep(1);
        setForgotEmail('');
        setGeneratedOTP('');
        setEnteredOTP('');
        setNewPassword('');
        setConfirmPassword('');
        setForgotError('');
        setForgotSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setForgotError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    }
  };

  const cancelForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(1);
    setForgotEmail('');
    setGeneratedOTP('');
    setEnteredOTP('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
  };

  if (showForgotPassword) {
    return (
      <div className="cred-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="animate-fade-in-up" style={{
          maxWidth: '480px',
          width: '100%',
          margin: '0 auto'
        }}>
          <div className="cred-card glass" style={{ padding: '48px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <FaLock style={{ fontSize: '48px', color: 'var(--cred-accent)', marginBottom: '16px' }} />
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
                reset password.
              </h2>
              <p style={{ color: '#fff', fontSize: '14px' }}>
                {forgotPasswordStep === 1 && 'enter your email to receive OTP'}
                {forgotPasswordStep === 2 && 'verify the OTP sent to your email'}
                {forgotPasswordStep === 3 && 'create a new secure password'}
              </p>
            </div>

            {forgotPasswordStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <FaEnvelope style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)' }} />
                  <input
                    type="email"
                    placeholder="email address"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="cred-input"
                    style={{ paddingLeft: '50px' }}
                  />
                </div>
                <button onClick={handleSendOTP} className="cred-btn" style={{ width: '100%' }}>
                  send OTP
                </button>
                <button onClick={cancelForgotPassword} className="cred-btn-secondary" style={{ width: '100%' }}>
                  cancel
                </button>
              </div>
            )}

            {forgotPasswordStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  background: 'rgba(0, 208, 156, 0.1)',
                  border: '1px solid var(--cred-accent)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '8px'
                }}>
                  <p style={{ fontSize: '12px', color: '#fff', margin: '0 0 8px 0' }}>
                    ✅ OTP sent to {forgotEmail}
                  </p>
                  <p style={{ fontSize: '11px', color: '#ffa500', margin: 0 }}>
                    📧 Check your spam/junk folder if not received in inbox
                  </p>
                </div>
                <div style={{ position: 'relative' }}>
                  <FaKey style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)' }} />
                  <input
                    type="text"
                    placeholder="enter OTP"
                    value={enteredOTP}
                    onChange={e => setEnteredOTP(e.target.value)}
                    maxLength={6}
                    className="cred-input"
                    style={{ paddingLeft: '50px', textAlign: 'center', letterSpacing: '4px', fontSize: '20px', fontWeight: 700 }}
                  />
                </div>
                <button onClick={handleVerifyOTP} className="cred-btn" style={{ width: '100%' }}>
                  verify OTP
                </button>
                <button onClick={cancelForgotPassword} className="cred-btn-secondary" style={{ width: '100%' }}>
                  cancel
                </button>
              </div>
            )}

            {forgotPasswordStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)' }} />
                  <input
                    type="password"
                    placeholder="new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="cred-input"
                    style={{ paddingLeft: '50px' }}
                    autocomplete="new-password"
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)' }} />
                  <input
                    type="password"
                    placeholder="confirm password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="cred-input"
                    style={{ paddingLeft: '50px' }}
                    autocomplete="new-password"
                  />
                </div>
                <button onClick={handleResetPassword} className="cred-btn" style={{ width: '100%' }}>
                  reset password
                </button>
                <button onClick={cancelForgotPassword} className="cred-btn-secondary" style={{ width: '100%' }}>
                  cancel
                </button>
              </div>
            )}

            {forgotError && (
              <div className="animate-fade-in" style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(231, 76, 60, 0.1)',
                border: '1px solid var(--cred-pink)',
                borderRadius: '12px',
                color: 'var(--cred-pink)',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="animate-fade-in" style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(0, 208, 156, 0.1)',
                border: '1px solid var(--cred-accent)',
                borderRadius: '12px',
                color: 'var(--cred-accent)',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                {forgotSuccess}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cred-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <BackButton />
      <div className="animate-fade-in-up" style={{
        maxWidth: '480px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div className="cred-card glass" style={{ padding: '48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
              login to continue.
            </h2>
            <p style={{ color: '#fff', fontSize: '14px' }}>
              post ads. connect. upgrade.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Role Selection */}
            <div style={{ position: 'relative' }}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="cred-input"
                style={{ 
                  paddingLeft: '20px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#000'
                }}
              >
                <option value="" disabled>select login type</option>
                <option value="user">👤 user (buyer/seller)</option>
                <option value="expert">🎯 expert</option>
                <option value="marriage">💑 marriage bureau</option>
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              {!form.phone && <FaPhone style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', opacity: '0.3', pointerEvents: 'none' }} />}
              <input
                type="tel"
                placeholder={role === 'expert' ? 'email address' : 'phone number'}
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="cred-input"
                style={{ paddingLeft: '50px' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              {!form.password && <FaLock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cred-text-tertiary)', opacity: '0.3', pointerEvents: 'none' }} />}
              <input
                type="password"
                placeholder="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="cred-input"
                style={{ paddingLeft: '50px' }}
                autocomplete="current-password"
              />
            </div>

            <button type="submit" className="cred-btn" style={{ width: '100%', marginTop: '8px' }}>
              <FaSignInAlt /> login to post ads
            </button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cred-blue)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  transition: 'color 0.3s ease'
                }}
                onMouseOver={e => e.target.style.color = 'var(--cred-accent)'}
                onMouseOut={e => e.target.style.color = 'var(--cred-blue)'}
              >
                forgot password?
              </button>
            </div>

            <div style={{
              textAlign: 'center',
              marginTop: '16px',
              padding: '20px',
              background: '#f5f5f5',
              borderRadius: '12px',
              border: '1px solid #ddd'
            }}>
              <p style={{ color: '#555', fontSize: '14px', marginBottom: '12px' }}>
                don't have an account?
              </p>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="cred-btn-secondary"
                style={{ width: '100%' }}
              >
                sign up now
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
    </div>
  );
}

export default Login;
