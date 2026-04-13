// frontend/src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => (
  <header>
    <h2>Academia AI</h2>
    <nav>
      <Link to="/">Home</Link>
      <Link to="/video-summarization">Video Summarization</Link>
      <Link to="/research-to-audio">Research to Audio</Link>
      <Link to="/quiz-generation">Quiz Generation</Link>
      <Link to="/content-management">Content Management</Link>
      <Link to="/login">Login</Link>
      <Link to="/signup">SignUp</Link>
    </nav>
  </header>
);

export default Header;