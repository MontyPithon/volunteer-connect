import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const navigate = useNavigate();

  
  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with:', { email, password });
    alert('Login submitted (no real backend yet- Stored locally)');

        const storedUser = JSON.parse(localStorage.getItem('mockUser'));

    if (storedUser && storedUser.email === email && storedUser.password === password) {
      alert('Login successful!');
      navigate('/profile');
    } else {
      alert('Invalid credentials. Try again.');
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Login</h2>
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
      <button type="submit">Login</button>

      <p>
        Not registered? <Link to="/register">Create an account</Link>
      </p>
    </form>
  );
}
