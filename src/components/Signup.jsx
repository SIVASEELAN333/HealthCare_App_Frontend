import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'PATIENT'
  });

  const navigate = useNavigate();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|mil|co|io|info|biz|me|us|uk|ca|au)$/i;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!emailRegex.test(formData.email)) {
    alert('Please enter a valid email address');
    return;
  }

  try {
    const response = await api.post('/api/auth/register', formData);
    if (response.data === 'Registration successful') {
      alert('Signup successful! Redirecting to login...');
      navigate('/');
    } else {
      alert('Unexpected response from server: ' + response.data);
    }
  } catch (err) {
    if (err.response && err.response.data) {
      const msg = err.response.data;
      if (msg === 'Email already registered') {
        alert('Email is already in use. Please try another one.');
      } else if (msg === 'Username already taken') {
        alert('Username is already taken. Please choose another one.');
      } else {
        alert('Error: ' + msg);
      }
    } else {
      alert('Signup failed. Please try again later.');
    }
    console.error('Signup error:', err);
  }
};

  return (
    <div className="signup-wrapper">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2 className="signup-title">Create Account</h2>

        <input
          type="text"
          name="username"
          placeholder="Full Name"
          value={formData.username}
          onChange={handleChange}
          className="signup-input"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="signup-input"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="signup-input"
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="signup-input"
        >
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
        </select>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button type="submit" className="signup-btn1">Sign Up</button>
        </div>

        <p className="login-link">
          Already registered?{' '}
          <Link to="/" className="login-btn1">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
