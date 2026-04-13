// frontend/src/pages/VideoSummarization.jsx
import React, { useState , useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import '../styles/VideoSummarization.css';

const VideoSummarization = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('Selected file:', selectedFile);
    if (selectedFile && ['video/mp4', 'video/avi', 'video/quicktime'].includes(selectedFile.type)) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid video file (MP4, AVI, MOV).');
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a video file.');
      return;
    }
    console.log('Submitting file:', file);
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/video-summarize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Backend response:', res.data);
      setIsProcessing(false);
      setProgress(100);
      navigate('/output-video-summarization', { state: { summary: res.data.summary, videoPath: res.data.video_path } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to summarize video.');
      console.error('Upload error:', err);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isProcessing) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/summarization-progress');
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

  return (
    <>
      <Header />
      <Sidebar />
      <section className="upload-section">
        <h1>Video Summarization</h1>
        <p>Upload your video (MP4, AVI, MOV) to generate a concise summary.</p>
        <div className="upload-box">
          <p>Drag & drop your video here or click to browse</p>
          <input
            type="file"
            accept="video/mp4,video/avi,video/quicktime"
            onChange={handleFileChange}
            id="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            Choose Video
          </label>
          {file && <p>Selected: {file.name}</p>}
          <button className="upload-btn" onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Upload & Summarize'}
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
      </section>
      <Footer />
    </>
  );
};

export default VideoSummarization;