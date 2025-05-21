import axios, { AxiosError } from 'axios';
import { getBackendUrl } from '../config/urls';

export const BASE_URL = getBackendUrl();

console.log('API Service initialized with BASE_URL:', BASE_URL);

export interface Option {
  text: string;
  correct: boolean;
}

export interface Question {
  id?: number;
  text: string;
  options: Option[];
}

export interface QuizDTO {
  id: number;
  title: string;
  durationInSeconds: number;
  startTime: string;
  closed: boolean;
  questions: Question[];
  participants: { phoneNumber: string }[];
}

export interface QuizAnswerResponse {
  phoneNumber: string;
  username: string;
  questionId: number;
  selectedAnswer: string;
  quizId: number;
}

export interface QuizResponseData {
  id: number;
  createdAt: string;
  selectedAnswer: string;
  username: string;
  participantId: number;
  questionId: number;
  quizId: number;
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
  getQuestions: async (quizId: string | number): Promise<Question[]> => {
    const numericQuizId =
      typeof quizId === 'string' ? parseInt(quizId, 10) : quizId;

    const url = `${BASE_URL}/api/quizzes/${numericQuizId}`.replace(
      /([^:]\/)\/+/g,
      '$1',
    );
    console.log('getQuestions - Full URL:', url);
    console.log('getQuestions - Headers:', {
      'Content-Type': 'application/json',
    });

    try {
      const response = await axios.get<QuizDTO>(url);
      console.log('getQuestions - Raw Response:', response);

      if (!response.data || !response.data.questions) {
        console.error('Invalid quiz data structure:', response.data);
        throw new Error('Invalid quiz data received from server');
      }

      return response.data.questions;
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
    const url = `${BASE_URL}/api/responses`.replace(/([^:]\/)\/+/g, '$1');
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
    quizId: string | number,
    page: number = 0,
    size: number = 10,
  ): Promise<ResultsResponse> => {
    const numericQuizId =
      typeof quizId === 'string' ? parseInt(quizId, 10) : quizId;

    const url = `${BASE_URL}/api/responses/results/${numericQuizId}`.replace(
      /([^:]\/)\/+/g,
      '$1',
    );
    console.log('getResults - Full URL:', url);
    console.log('getResults - Query Params:', { page, size });

    try {
      const response = await axios.get(url, { params: { page, size } });
      console.log('getResults - Raw Response:', response);
      console.log('getResults - Response Data:', response.data);
      console.log('getResults - Results Array:', response.data.results);

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
