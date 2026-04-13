// frontend/src/pages/Home.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

import '../styles/Home.css';

const Home = () => {
  return (
    <>
      <Header />
      <Sidebar />
      <section className="hero">
        <h1>Transforming Education with AI</h1>
        <p>Academia AI harnesses artificial intelligence to simplify and enrich your learning experience with video summaries, audio podcasts, and dynamic quizzes.</p>
        <a href="https://grok.com" className="btn">Get Started</a>
        <a href="https://grok.com" className="btn secondary">Learn More</a>
      </section>
      <section className="features">
        <div className="feature-card">
          <h3>Video Summarization</h3>
          <p>Automatically summarize lecture videos into key points, saving you hours of review time.</p>
        </div>
        <div className="feature-card">
          <h3>Research to Audio</h3>
          <p>Convert research papers into engaging audio podcasts for learning on the go.</p>
        </div>
        <div className="feature-card">
          <h3>Quiz Generation</h3>
          <p>Generate personalized quizzes to test your knowledge and enhance comprehension.</p>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Home;