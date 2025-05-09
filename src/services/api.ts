import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export interface Question {
  id: number;
  text: string;
  options: { text: string }[];
}

export interface QuizResponse {
  phoneNumber: string;
  username: string;
  questionId: number;
  selectedAnswer: string;
}

const api = {
  getQuestions: async (quizId: string): Promise<Question[]> => {
    const response = await axios.get(`${BASE_URL}/api/quizzes/${quizId}/questions`);
    return response.data;
  },

  submitAnswer: async (answer: QuizResponse): Promise<void> => {
    await axios.post(`${BASE_URL}/api/responses`, answer);
  }
};

export default api; 