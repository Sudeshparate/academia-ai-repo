// frontend/src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => (
  <aside className="sidebar">
    <h2>Features</h2>
    <ul>
      <li><Link to="/video-summarization">Video Summarization</Link></li>
      <li><Link to="/research-to-audio">Audio Podcast Generator</Link></li>
      <li><Link to="/quiz-generation">Quiz Generator</Link></li>
      <li><Link to="/content-management">User File Manager</Link></li>
    </ul>
  </aside>
);

export default Sidebar;