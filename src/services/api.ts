import axios, { AxiosError } from 'axios';
import { getBackendUrl } from '../config/urls';

export const BASE_URL = getBackendUrl();

console.log('API Service initialized with BASE_URL:', BASE_URL);

export interface Question {
  id: number;
  text: string;
  options: { text: string }[];
}

interface QuestionResponse {
  id: number;
  text: string;
  options?: { text: string }[];
}

export interface QuizAnswerResponse {
  phoneNumber: string;
  username: string;
  questionId: number;
  selectedAnswer: string;
  quizId: string;
}

// Updated to match Spring's JSON response structure
export interface QuizResponseData {
  id: string; // responseId
  createdAt: string; // timestamp
  selectedAnswer: string;
  username: string;
  participantId: string;
  questionId: number;
  quizId: string;
}

export interface QuizResult {
  participantId: number;
  score: number;
  quizId: number;
  lastSubmittedAt: string;
  questionIds: number[];
  username: string;
}

export interface ResultsResponse {
  totalResults: number;
  size: number;
  totalPages: number;
  page: number;
  results: QuizResult[];
}

const api = {
  getQuestions: async (quizId: string): Promise<Question[]> => {
    const url = `${BASE_URL}/api/quizzes/${quizId}`;
    console.log('getQuestions - Full URL:', url);
    console.log('getQuestions - Headers:', {
      'Content-Type': 'application/json',
    });

    try {
      const response = await axios.get(url);
      console.log('getQuestions - Raw Response:', response);

      // Handle both response formats - direct questions array or nested in quiz object
      const questions = Array.isArray(response.data)
        ? response.data
        : response.data.questions || [];

      return questions.map((q: QuestionResponse) => ({
        id: q.id,
        text: q.text,
        options: q.options || [],
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('getQuestions - Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
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
          status: error.response?.status,
        });
      }
      throw error;
    }
  },

  getResults: async (
    quizId: string,
    page: number = 0,
    size: number = 10,
  ): Promise<ResultsResponse> => {
    const url = `${BASE_URL}/api/responses/results/${quizId}`;
    console.log('getResults - Full URL:', url);
    console.log('getResults - Query Params:', { page, size });

    try {
      const response = await axios.get(url, { params: { page, size } });
      console.log('getResults - Raw Response:', response);
      console.log('getResults - Response Data:', response.data);
      console.log('getResults - Results Array:', response.data.results);

      // Log each result's structure
      if (response.data.results && response.data.results.length > 0) {
        console.log(
          'First result structure:',
          JSON.stringify(response.data.results[0], null, 2),
        );
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('getResults - Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
      throw error;
    }
  },
};

export default api;
