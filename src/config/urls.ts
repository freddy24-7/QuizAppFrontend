// export const BACKEND_URL = 'https://quizapp-production-b399.up.railway.app';
export const FRONTEND_URL = 'https://quiz-app-frontend-qoqq.vercel.app';

// For development mode (commented out since we're in production)
export const BACKEND_URL = 'http://localhost:8080';
// export const FRONTEND_URL = 'http://localhost:5173';

// Always return production URLs since we're deployed
export const getBackendUrl = () => BACKEND_URL.replace(/\/$/, '');
export const getFrontendUrl = () => FRONTEND_URL.replace(/\/$/, '');
