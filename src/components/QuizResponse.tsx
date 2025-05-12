import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import api, { Question } from '../services/api';
import type { QuizAnswerResponse } from '../services/api';
import { formatPhoneNumber } from '../utils/whatsappUtils';

const QuizResponse = () => {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get('quizId');
  
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentStep, setCurrentStep] = useState<'username' | 'questions'>('username');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch questions when component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (!quizId) {
          throw new Error('Quiz ID is required');
        }
        console.log('Starting to fetch questions for quiz:', quizId);
        const questions = await api.getQuestions(quizId);
        console.log('Successfully fetched questions:', questions);
        setQuestions(questions);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load quiz questions');
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [quizId]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 10 characters
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    try {
      // Validate phone number format
      formatPhoneNumber(phoneNumber);
      console.log('Phone number validated successfully:', phoneNumber);
      setError('');
      setCurrentStep('questions');
    } catch (err) {
      console.error('Phone number validation failed:', err);
      setError(err instanceof Error ? err.message : 'Invalid phone number format');
    }
  };

  const handleAnswerSubmit = async (selectedAnswer: string) => {
    try {
      const currentQuestion = questions[currentQuestionIndex];
      console.log('Preparing to submit answer for question:', {
        questionNumber: currentQuestionIndex + 1,
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        selectedAnswer
      });
      
      // Submit the current answer
      const answer: QuizAnswerResponse = {
        phoneNumber,
        username,
        questionId: currentQuestion.id,
        selectedAnswer
      };
      
      console.log('Submitting answer to backend:', answer);
      await api.submitAnswer(answer);
      console.log('Answer submitted successfully');

      // Move to next question or finish
      if (currentQuestionIndex < questions.length - 1) {
        console.log('Moving to next question');
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        console.log('Quiz completed successfully');
        setSuccess('Thank you for completing the quiz!');
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-green-50 rounded-lg">
        <p className="text-green-600">{success}</p>
      </div>
    );
  }

  if (currentStep === 'username') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-sky-900 mb-6">Welcome to the Quiz</h2>
        <form onSubmit={handleUsernameSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="Enter your phone number (e.g., 0612345678)"
              pattern="06\d{8}"
              required
            />
            <p className="text-sm text-gray-500">Must be 10 digits starting with 06</p>
          </div>
          <Button type="submit" className="w-full">
            Start Quiz
          </Button>
        </form>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-sky-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-sky-600">User: {username}</span>
        </div>
        <h2 className="text-xl font-semibold text-sky-900 mb-4">{currentQuestion.text}</h2>
      </div>
      
      <div className="space-y-4">
        {currentQuestion.options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswerSubmit(option.text)}
            variant="outline"
            className="w-full text-left justify-start h-auto py-4 px-6"
          >
            {option.text}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuizResponse; 