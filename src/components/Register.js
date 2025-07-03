import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    
        localStorage.setItem('mockUser', JSON.stringify({ email, password }));
        
    console.log('Registering user:', { email, password });
    alert('Registration submitted (no real backend yet - stored locally)');
    navigate('/login');
  };

  return (
    <form onSubmit={handleRegister} style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Register</h2>
      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Register</button>

      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </form>
  );
}
