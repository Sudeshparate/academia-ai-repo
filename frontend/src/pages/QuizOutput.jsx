import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import '../styles/QuizOutput.css';

const QuizOutput = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/get-quiz/${quizId}`);
        setQuiz(res.data);
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = () => {
    let correct = 0;
    quiz.questions.forEach((question) => {
      if (answers[question.id] === question.correct_option_id) {
        correct++;
      }
    });
    setScore(correct);
  };

  if (!quiz) return <div className="p-4">Loading...</div>;

  return (
    <>
      <Header />
      <Sidebar />
      <div className="quiz-output-container">
  <h1 className="quiz-output-title">{quiz.title}</h1>
  {quiz.questions.map((question) => (
    <div key={question.id} className="question-block">
      <p className="question-text">{question.text}</p>
      {question.options.map((option) => (
        <label key={option.id} className="option-label">
          <input
            type="radio"
            name={`question_${question.id}`}
            value={option.id}
            onChange={() => handleAnswerChange(question.id, option.id)}
            className="option-input"
          />
          {option.text}
        </label>
      ))}
    </div>
  ))}
  <button
    onClick={handleSubmit}
    className="submit-button"
  >
    Submit Quiz
  </button>
  {score !== null && (
    <p className="score-display">Your score: {score}/{quiz.questions.length}</p>
  )}
</div>
      <Footer />
    </>
  );
};

export default QuizOutput;