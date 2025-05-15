export const BACKEND_URL = 'https://quizapp-production-b399.up.railway.app';
export const FRONTEND_URL = 'https://quiz-app-frontend-qoqq.vercel.app';

// For development mode
export const DEV_BACKEND_URL = 'http://localhost:8080';
export const DEV_FRONTEND_URL = 'http://localhost:5173';

// Helper function to get the appropriate URL based on environment
export const getBackendUrl = () => {
  return window.location.hostname === 'localhost' ? DEV_BACKEND_URL : BACKEND_URL;
};

export const getFrontendUrl = () => {
  return window.location.hostname === 'localhost' ? DEV_FRONTEND_URL : FRONTEND_URL;
}; 