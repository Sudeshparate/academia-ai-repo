import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import '../styles/ResearchToAudio.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ResearchToAudio = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('Selected file:', selectedFile);
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setAudioUrl(null);
    } else {
      setError('Please upload a valid PDF file.');
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a PDF file.');
      return;
    }
    console.log('Submitting file:', file);
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const res = await axios.post(`${API_URL}/api/generate-podcast`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
      });
      console.log('Backend response:', res);
      setIsProcessing(false);
      setProgress(100);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'audio/mp3' }));
      setAudioUrl(url);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate podcast.');
      console.error('Upload error:', err);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isProcessing) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/api/podcast-progress`);
          setProgress(res.data.percentage);
          if (res.data.status === 'completed' || res.data.status === 'error') {
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Progress fetch error:', err);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        window.URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <>
      <Header />
      <Sidebar />
      <section className="upload-section">
        <h1>Research to Podcast</h1>
        <p>Upload your PDF to generate a conversational podcast with a male Host and female Expert discussing key points.</p>
        <div className="upload-box">
          <p>Drag & drop your PDF here or click to browse</p>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            id="file-input"
            aria-label="Upload PDF file"
          />
          <label htmlFor="file-input" className="file-label">
            Choose PDF
          </label>
          {file && <p>Selected: {file.name}</p>}
          <button
            className="upload-btn"
            onClick={handleSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Upload & Generate Podcast'}
          </button>
          {isProcessing && (
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}>
                {progress}%
              </div>
            </div>
          )}
        </div>
        {error && <p className="error-message">{error}</p>}
        {audioUrl && (
          <div className="audio-container">
            <h2>Generated Podcast</h2>
            <audio controls src={audioUrl} className="audio-player">
              Your browser does not support the audio element.
            </audio>
            <a
              href={audioUrl}
              download={`podcast_${file.name}.mp3`}
              className="download-btn"
            >
              Download Podcast
            </a>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
};

export default ResearchToAudio;