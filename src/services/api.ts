import axios, { AxiosError } from 'axios';
import { getBackendUrl } from '../config/urls';

export const BASE_URL = getBackendUrl();

console.log('API Service initialized with BASE_URL:', BASE_URL);

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
    const url = `${BASE_URL}/api/quizzes/${quizId}`;
    console.log('getQuestions - Full URL:', url);
    console.log('getQuestions - Headers:', {
      'Content-Type': 'application/json'
    });
    
    try {
      const response = await axios.get(url);
      console.log('getQuestions - Response:', response.data);
      return response.data.questions;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('getQuestions - Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
      throw error;
    }
  },

  submitAnswer: async (response: QuizAnswerResponse): Promise<void> => {
    const url = `${BASE_URL}/api/responses`;
    console.log('submitAnswer - Full URL:', url);
    console.log('submitAnswer - Request Data:', response);
    
    try {
      await axios.post(url, response);
      console.log('submitAnswer - Success');
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('submitAnswer - Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
      throw error;
    }
  },

  getResults: async (quizId: string, page: number = 0, size: number = 10): Promise<ResultsResponse> => {
    const url = `${BASE_URL}/api/responses/results/${quizId}`;
    console.log('getResults - Full URL:', url);
    console.log('getResults - Query Params:', { page, size });
    
    try {
      const response = await axios.get(url, { params: { page, size } });
      console.log('getResults - Response:', response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('getResults - Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
      throw error;
    }
  }
};

export default api; 