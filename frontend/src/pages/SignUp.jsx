import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/SignUp.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/signup', {
        email,
        password,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_id', res.data.user_id);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:5000/api/google-login', {
        token: credentialResponse.credential,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_id', res.data.user_id);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <>
      <Header />
      <section className="signup-section">
        <h1>Sign Up</h1>
        <p>Create your Academia AI account to start learning.</p>
        <div className="signup-box">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="signup-btn" onClick={handleSignUp}>
            Sign Up
          </button>
          <div className="google-login">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default SignUp;