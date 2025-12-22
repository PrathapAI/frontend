import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function BackButton({ customAction, style }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (customAction) {
      customAction();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      style={{
        position: 'fixed',
        top: '75px',
        left: '20px',
        zIndex: 999,
        background: 'rgba(0, 0, 0, 0.7)',
        border: '2px solid var(--cred-accent)',
        borderRadius: '12px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: 'pointer',
        color: 'var(--cred-accent)',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--cred-accent)';
        e.currentTarget.style.color = '#000';
        e.currentTarget.style.transform = 'translateX(-3px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
        e.currentTarget.style.color = 'var(--cred-accent)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <FaArrowLeft style={{ fontSize: '16px' }} />
      <span style={{ textTransform: 'lowercase' }}>back</span>
    </button>
  );
}

export default BackButton;
