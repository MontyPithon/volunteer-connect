import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');
  const [hasVerified, setHasVerified] = useState(false); // ✅ stop multiple calls

  useEffect(() => {
    if (hasVerified) return; // ✅ only verify once per mount

    const params = new URLSearchParams(window.location.search);
    const verification_token = params.get('verification_token');

    if (!verification_token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/verify-email?verification_token=${verification_token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        setHasVerified(true); // ✅ prevent duplicate calls

        setTimeout(() => {
          window.location.href = '/';
        }, 4000);
      } catch (error) {
  const { is_verified, error: errorMsg } = error.response?.data || {};
  
  if (is_verified) {
    setStatus('success');
    setMessage('Success! Your email has been verified.');
  } else {
    setStatus('error');
    setMessage(errorMsg || 'An error occurred during verification.');
  }

  setHasVerified(true);
}
    };

    verifyEmail();
  }, [hasVerified]);




  const icon = {
    verifying: '🔄',
    success: '✅',
    error: '❌',
  };

  const color = {
    verifying: '#3b82f6',  // blue
    success: '#10b981',    // green
    error: '#ef4444',      // red
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        padding: '30px',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      }}>
        <div style={{ fontSize: '48px', color: color[status], marginBottom: '16px' }}>
          {icon[status]}
        </div>
        <h1 style={{ fontSize: '24px', marginBottom: '12px', color: '#111827' }}>Email Verification</h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>{message}</p>

        {status === 'success' && (
          <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
            Redirecting to login...
          </p>
        )}

        {status === 'error' && (
          <a href="/login" style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px'
          }}>
            Back to Login
          </a>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
