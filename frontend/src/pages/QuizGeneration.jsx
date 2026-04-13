import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import '../styles/QuizGeneration.css';

const QuizGeneration = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('Selected file:', selectedFile);
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
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
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/quiz-generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Backend response:', res.data);
      setIsProcessing(false);
      setProgress(100);
      navigate('/quiz-output', { state: { quizId: res.data.quizId } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate quiz.');
      console.error('Upload error:', err);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isProcessing) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/quiz-progress');
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
      <section className="quiz-section">
        <h1>Quiz Generation</h1>
        <p>Upload a PDF to generate a multiple-choice quiz based on its content.</p>
        <div className="quiz-form">
          <p>Drag & drop your PDF here or click to browse</p>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            id="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            Choose PDF
          </label>
          {file && <p>Selected: {file.name}</p>}
          <button className="submit-btn" onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Generate Quiz'}
          </button>
          {isProcessing && (
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}>
                {progress}%
              </div>
            </div>
          )}
          {error && <p className="error-message">{error}</p>}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default QuizGeneration;