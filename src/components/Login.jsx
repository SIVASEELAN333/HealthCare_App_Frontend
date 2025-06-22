import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Login.css'; // ✅ Import CSS file

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post('/api/auth/login', { email, password });

    // Save user
    localStorage.setItem('user', JSON.stringify(res.data));
    localStorage.setItem('role', res.data.role);


    login(res.data); // Set auth context

    // ✅ Redirect to dashboard always
    navigate('/dashboard');
  } catch (err) {
    alert('Login failed');
  }
};



  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Welcome Back</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <button type="submit" className="login-btn">Login</button>
        <p className="signup-link">
          Don't have an account?{' '}
          <Link to="/signup" className="signup-btn">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
