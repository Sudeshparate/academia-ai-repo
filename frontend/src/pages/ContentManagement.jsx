import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
//import '../styles/ContentManagement.css';

const ContentManagement = () => {
  const [content, setContent] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/content/1')  // Mock user_id=1
      .then(res => setContent(res.data.content))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <Header />
      <Sidebar />
      <section className="content-section">
        <h1>Your Content</h1>
        <div className="content-container">
          {content.map(item => (
            <div className="content-item" key={item.id}>
              <h3>{item.content_type}</h3>
              <p>{item.summary || 'No summary available'}</p>
              <div className="button-container">
                <a href="https://www.google.com" className="btn">View</a>
                <a href="https://www.google.com" className="btn">Download</a>
                <a href="https://www.google.com" className="btn delete">Delete</a>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ContentManagement;