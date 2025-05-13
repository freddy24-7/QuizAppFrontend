import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api, { QuizResult } from '../services/api';
import { Button } from './ui/button';

const QuizResults = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchResults = async () => {
    try {
      if (!quizId) throw new Error('Quiz ID is required');
      const response = await api.getResults(quizId, currentPage);
      setResults(response.results);
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-sky-900 mb-8">Quiz Results</h1>
      
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
                <tr key={result.username} className="hover:bg-sky-50">
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