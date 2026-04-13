import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import '../styles/OutputVideoSummarization.css';

const OutputVideoSummarization = () => {
  const { state } = useLocation();
  const { summary, videoPath } = state || {};

  return (
    <>
      <Header />
            <Sidebar />
      <section className="output-section">
        <h1>Video Summary</h1>
        <p>Below is the summary of your uploaded video.</p>
        <div className="summary-box">
          {videoPath && (
            <video controls src={videoPath} className="video-player">
              Your browser does not support the video tag.
            </video>
          )}
          <h2>Summary</h2>
          <p>{summary || 'No summary available.'}</p>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default OutputVideoSummarization;