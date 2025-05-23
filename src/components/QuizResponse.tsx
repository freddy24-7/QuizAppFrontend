import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import api, { Question, QuizAnswerResponse, QuizDTO } from '../services/api';

const QuizResponse = () => {
  const [searchParams] = useSearchParams();
  const quizIdParam = searchParams.get('quizId');
  const phoneNumber = searchParams.get('phoneNumber');
  const quizId = quizIdParam ? parseInt(quizIdParam, 10) : null;

  const [username, setUsername] = useState('');
  const [currentStep, setCurrentStep] = useState<'username' | 'questions'>('username');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizData, setQuizData] = useState<QuizDTO | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);

  // Log initial mount and parameters
  useEffect(() => {
    console.log('QuizResponse component mounted');
    console.log('Current quizId from URL:', quizId);
    console.log('Current phoneNumber from URL:', phoneNumber);
  }, [quizId, phoneNumber]);

  // Fetch quiz details when component mounts
  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        if (!quizId || !phoneNumber) {
          console.error('Missing quizId or phoneNumber in URL parameters');
          throw new Error('Quiz ID and phone number are required');
        }
        console.log('Starting to fetch quiz details for quiz:', quizId);

        const response = await api.getQuestions(quizId);
        console.log('Successfully fetched quiz details:', response);

        // Check for null/empty response
        if (!response || Object.values(response).every((val) => val === null)) {
          console.error('Server returned empty or null quiz data');
          throw new Error('Quiz not found or no longer available');
        }

        setQuizData(response);
        setQuestions(response.questions);
        setTimeLeft(response.durationInSeconds);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching quiz details:', err);
        if (err instanceof Error) {
          console.error('Error details:', {
            message: err.message,
            stack: err.stack,
          });
          // Set user-friendly error message based on specific error
          switch (err.message) {
            case 'Quiz not found':
              setError(
                'This quiz does not exist. Please check the link and try again.',
              );
              break;
            case 'Quiz data is invalid':
              setError(
                'This quiz is no longer available. Please check with the quiz organizer.',
              );
              break;
            case 'Server error occurred while fetching quiz':
              setError(
                'Unable to load the quiz at this time. Please try again later.',
              );
              break;
            default:
              setError(
                'An error occurred while loading the quiz. Please try again later.',
              );
          }
        }
        setIsLoading(false);
        // Show error toast
        toast.error('Failed to load quiz. Please try again later.');
      }
    };
    fetchQuizDetails();
  }, [quizId, phoneNumber]);

  // Timer effect
  useEffect(() => {
    if (currentStep === 'questions' && timeLeft > 0 && !isTimeUp) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimeUp(true);
            toast.error('Time is up!');
            return 0;
          }
          // Show warning when 30 seconds remaining
          if (prev === 30) {
            toast.warning('30 seconds remaining!');
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStep, timeLeft, isTimeUp]);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a your name');
      return;
    }

    // Check if quiz is closed
    if (quizData?.closed) {
      toast.error('This quiz is no longer accepting responses');
      return;
    }

    // Check if quiz hasn't started yet
    const startTime = quizData?.startTime ? new Date(quizData.startTime) : null;
    if (startTime && startTime > new Date()) {
      toast.error('This quiz has not started yet');
      return;
    }

    setCurrentStep('questions');
    toast.success('Welcome to the quiz!');
  };

  const handleAnswerSubmit = async (selectedAnswer: string) => {
    if (isTimeUp) {
      toast.error('Time is up! You cannot submit more answers.');
      return;
    }

    if (isSubmitting) {
      return; // Prevent multiple submissions while one is in progress
    }

    // Rate limiting - prevent submissions within 1 second of each other
    const now = Date.now();
    if (now - lastSubmissionTime < 1000) {
      toast.warning('Please wait before submitting another answer');
      return;
    }

    try {
      setIsSubmitting(true);
      setLastSubmissionTime(now);

      if (!quizId || !phoneNumber) {
        console.error('Missing quizId or phoneNumber');
        toast.error('Invalid quiz link. Please check the URL.');
        return;
      }

      const currentQuestion = questions[currentQuestionIndex];

      const submissionData: QuizAnswerResponse = {
        phoneNumber,
        username,
        questionId: currentQuestion.id!,
        selectedAnswer,
        quizId,
      };

      console.log('Full submission data:', submissionData);

      await api.submitAnswer(submissionData);
      console.log('Answer submitted successfully');
      toast.success('Answer submitted successfully!');

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        toast.info(`Moving to question ${currentQuestionIndex + 2} of ${questions.length}`);
      } else {
        setSuccess('Thank you for completing the quiz!');
        toast.success('Quiz completed! Thank you for participating!');
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      if (err instanceof AxiosError && err.response?.status === 429) {
        toast.error('Too many attempts. Please wait a moment before trying again.');
      } else {
        toast.error('Failed to submit answer. Please try again.');
      }
      setError('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  if (isTimeUp) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 rounded-lg">
        <p className="text-red-600 text-xl font-semibold mb-2">Time's Up!</p>
        <p className="text-gray-700 mb-4">
          You've run out of time to complete the quiz.
        </p>
      </div>
    );
  }

  if (currentStep === 'username') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-sky-900 mb-6">
          Welcome to {quizData?.title || 'the Quiz'}
        </h2>
        <form onSubmit={handleUsernameSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Start Quiz
          </Button>
          {quizData?.startTime && (
            <p className="text-sm text-gray-600 mt-4">
              Quiz starts at: {new Date(quizData.startTime).toLocaleString()}
            </p>
          )}
          {quizData?.durationInSeconds && (
            <p className="text-sm text-gray-600">
              Duration: {Math.floor(quizData.durationInSeconds / 60)} minutes
            </p>
          )}
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
        <h2 className="text-xl font-semibold text-sky-900 mb-4">
          {currentQuestion.text}
        </h2>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-semibold text-sky-600">
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-4">
        {currentQuestion.options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswerSubmit(option.text)}
            variant="outline"
            className="w-full text-left justify-start h-auto py-4 px-6 relative"
            disabled={isSubmitting}
          >
            {option.text}
            {isSubmitting && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
              </div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuizResponse;
