import axios from 'axios';
import { getBackendUrl } from '../config/urls';

export const BASE_URL = getBackendUrl();

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

export interface QuizResult {
  username: string;
  score: number;
  lastSubmittedAt: string;
}

export interface ResultsResponse {
  page: number;
  size: number;
  totalPages: number;
  totalResults: number;
  results: QuizResult[];
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
  },

  getResults: async (quizId: string, page: number = 0, size: number = 10): Promise<ResultsResponse> => {
    console.log(`Fetching results for quiz ${quizId}, page ${page}, size ${size}`);
    const response = await axios.get(`${BASE_URL}/api/responses/results/${quizId}`, {
      params: { page, size }
    });
    console.log('Received results:', response.data);
    return response.data;
  }
};

export default api; 