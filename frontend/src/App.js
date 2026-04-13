import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import ResearchToAudio from './pages/ResearchToAudio';
import VideoSummarization from './pages/VideoSummarization';
import ContentManagement from './pages/ContentManagement';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OutputVideoSummarization from './pages/OutputVideoSummarization';
import QuizGeneration from './pages/QuizGeneration';
import QuizOutput from './pages/QuizOutput';

import './App.css';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video-summarization" element={<VideoSummarization />} />
        <Route path="/research-to-audio" element={<ResearchToAudio />} />
        <Route path="/quiz-generation" element={<QuizGeneration />} />
        <Route path="/content-management" element={<ContentManagement />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/output-video-summarization" element={<OutputVideoSummarization />} />
        <Route path="/quiz/:quizId" element={<QuizOutput />} />
       {/* <Route path="/login" element={<Login />} />
        <Route path="/output" element={<Output />} />*/}
      </Routes>
    </Router>
  );
}

export default App;
