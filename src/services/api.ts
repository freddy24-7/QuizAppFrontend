import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export interface Question {
  id: number;
  text: string;
  options: { text: string }[];
}

export interface QuizAnswerResponse {
  phoneNumber: string;
  username: string;
  questionId: number;
  selectedAnswer: string;
}

export interface CompleteQuizResponse {
  quizId: number;
  username: string;
  phoneNumber: string;
  answers: {
    questionId: number;
    selectedAnswer: string;
  }[];
}

const api = {
  getQuestions: async (quizId: string): Promise<Question[]> => {
    console.log('Fetching questions for quiz ID:', quizId);
    console.log('GET request to:', `${BASE_URL}/api/quizzes/${quizId}`);
    
    const response = await axios.get(`${BASE_URL}/api/quizzes/${quizId}`);
    console.log('Received questions:', response.data.questions);
    return response.data.questions;
  },

  submitAnswer: async (response: QuizAnswerResponse): Promise<void> => {
    console.log('Submitting answer to backend:', {
      url: `${BASE_URL}/api/responses`,
      data: response
    });
    
    await axios.post(`${BASE_URL}/api/responses`, response);
    console.log('Answer submitted successfully');
  }
};

export default api; 