import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(window.location.search);
      const verification_token = params.get('verification_token');

      if (!verification_token) {
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/auth/verify-email?verification_token=${verification_token}`);
        setMessage(response.data.message);
      } catch (error) {
        setMessage(error.response?.data?.error || 'An error occurred.');
      }
    };

    verifyEmail();
  }, []);

  return (
    <div>
      <h1>Email Verification</h1>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;