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
    const response = await axios.get(`${BASE_URL}/api/quizzes/${quizId}`);
    return response.data.questions;
  },

  submitAnswer: async (response: QuizAnswerResponse): Promise<void> => {
    await axios.post(`${BASE_URL}/api/responses`, response);
  }
};

export default api; 