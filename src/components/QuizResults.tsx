import { useState, useEffect, useCallback } from 'react';
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
  const [totalQuestions, setTotalQuestions] = useState(0);

  const generateBlueShades = (score: number) => {
    const baseColors = [
      { hue: 200, saturation: 90, lightness: 50 },
      { hue: 210, saturation: 90, lightness: 50 },
      { hue: 220, saturation: 90, lightness: 50 },
    ];

    return Array.from({ length: score }).map((_, index) => {
      const baseColor = baseColors[Math.floor(index / 4)];
      const variation = index % 4;

      const hue = baseColor.hue;
      const saturation = baseColor.saturation - variation * 5;
      const lightness = baseColor.lightness - variation * 3;

      return `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`;
    });
  };

  const fetchQuizDetails = useCallback(async () => {
    if (!quizId) {
      setError('Quiz ID is required');
      return;
    }
    try {
      const questions = await api.getQuestions(quizId);
      setTotalQuestions(questions.length);
    } catch (err) {
      console.error('Error fetching quiz details:', err);
      setError('Failed to load quiz details');
    }
  }, [quizId]);

  const fetchResults = useCallback(async () => {
    if (!quizId) {
      setError('Quiz ID is required');
      return;
    }
    try {
      const response = await api.getResults(quizId, currentPage);
      const filteredResults = response.results.filter(
        (result) => result.quizId === Number(quizId),
      );
      setResults(filteredResults);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load quiz results');
    } finally {
      setIsLoading(false);
    }
  }, [quizId, currentPage]);

  useEffect(() => {
    const fetchAll = async () => {
      await fetchQuizDetails();
      await fetchResults();
    };

    void fetchAll();
    const interval = setInterval(() => {
      void fetchResults();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchQuizDetails, fetchResults]);

  const renderScoreBar = (result: QuizResult) => {
    const segmentHeight = totalQuestions > 0 ? (1 / totalQuestions) * 100 : 0;
    const blueShades = generateBlueShades(result.score);

    return (
      <div
        className="relative w-20 bg-gray-100 rounded-lg overflow-hidden"
        style={{ height: '200px' }}
      >
        {Array.from({ length: totalQuestions }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="absolute w-full border-t border-gray-200"
            style={{
              bottom: `${(index / totalQuestions) * 100}%`,
              height: `${segmentHeight}%`,
            }}
          />
        ))}

        {Array.from({ length: result.score }).map((_, index) => (
          <div
            key={`score-${index}`}
            className="absolute w-full transition-all duration-500 ease-in-out hover:brightness-110"
            style={{
              bottom: `${(index / totalQuestions) * 100}%`,
              height: `${segmentHeight}%`,
              backgroundColor: blueShades[index],
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        ))}

        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-sky-700 whitespace-nowrap">
          {result.score}/{totalQuestions}
        </div>
      </div>
    );
  };

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

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-sky-900 mb-4">
          Score Distribution
        </h2>
        <div className="flex items-end justify-around h-64 gap-4">
          {results.map((result) => (
            <div
              key={`${result.participantId}-${result.quizId}`}
              className="flex flex-col items-center gap-2"
            >
              {renderScoreBar(result)}
              <div className="text-sm font-medium text-gray-700 mt-2">
                {result.username}
              </div>
              <div className="text-xs text-gray-500">
                Questions answered: {result.questionIds.length}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">
                  Questions
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-sky-900">
                  Last Submission
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr
                  key={`${result.participantId}-${result.quizId}`}
                  className="hover:bg-sky-50"
                >
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {currentPage * 10 + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {result.username}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {result.questionIds.length} / {totalQuestions}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {result.score} / {totalQuestions}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {result.lastSubmittedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 bg-gray-50">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
              }
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
