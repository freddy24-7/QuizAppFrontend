import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { QuizResult } from '../services/api';
import { Button } from './ui/button';

const QuizResults = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchResults = async () => {
    try {
      if (!quizId) throw new Error('Quiz ID is required');
      const response = await api.getResults(quizId, currentPage);
      
      // Ensure we only show results for the current quiz
      const filteredResults = response.results.filter(result => result.quizId === quizId);
      setResults(filteredResults);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load quiz results');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // Set up polling every 5 seconds
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [quizId, currentPage]);

  // Find the maximum score to calculate relative heights
  const maxScore = Math.max(...results.map(r => r.score), 1);

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
        <Button
          onClick={() => navigate('/')}
          className="mt-4 w-full"
          variant="outline"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-sky-900">Quiz Results</h1>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="px-6"
        >
          Create New Quiz
        </Button>
      </div>

      {/* Bar Chart Visualization */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-sky-900 mb-4">Score Distribution</h2>
        <div className="flex items-end justify-around h-64 gap-4">
          {results.map((result) => {
            const heightPercentage = (result.score / maxScore) * 100;
            return (
              <div key={`${result.participantId}-${result.quizId}`} className="flex flex-col items-center gap-2">
                <div 
                  className="w-20 bg-sky-500 rounded-t-lg transition-all duration-500 ease-in-out hover:bg-sky-600"
                  style={{ 
                    height: `${heightPercentage}%`,
                    minHeight: '20px' // Ensure bar is always visible
                  }}
                />
                <div className="text-sm font-medium text-gray-700">{result.username}</div>
                <div className="text-sm text-gray-500">Score: {result.score}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Detailed Results Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">Username</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">Score</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">Last Submission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr key={`${result.participantId}-${result.quizId}`} className="hover:bg-sky-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {currentPage * 10 + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{result.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{result.score}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{result.lastSubmittedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 bg-gray-50">
            <Button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500 text-center">
        Results update automatically every 5 seconds
      </div>
    </div>
  );
};

export default QuizResults; 