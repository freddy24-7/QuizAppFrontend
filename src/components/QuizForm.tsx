import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Modal } from './ui/modal';
import InviteParticipants from './InviteParticipants';
import { formatPhoneNumber } from '../utils/whatsappUtils';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../services/api';
import { toast } from 'react-toastify';

interface Option {
  text: string;
  correct: boolean;
}

interface Question {
  text: string;
  options: Option[];
}

interface Participant {
  phoneNumber: string;
}

interface QuizData {
  title: string;
  durationInSeconds: number;
  startTime: string;
  closed: boolean;
  questions: Question[];
  participants: Participant[];
}

const QuizForm = () => {
  const [quizData, setQuizData] = useState<QuizData>({
    title: '',
    durationInSeconds: 120,
    startTime: new Date().toISOString(),
    closed: false,
    questions: [
      {
        text: '',
        options: [
          { text: '', correct: false },
          { text: '', correct: false },
        ],
      },
    ],
    participants: [{ phoneNumber: '' }],
  });

  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'basic' | 'questions' | 'participants' | 'invite' | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showAddQuestionPrompt, setShowAddQuestionPrompt] = useState<boolean>(false);
  const [createdQuizId, setCreatedQuizId] = useState<string>('');
  const [inviteParticipants, setInviteParticipants] = useState<{ phoneNumber: string }[]>([]);
  const navigate = useNavigate();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuizData({ ...quizData, title: e.target.value });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuizData({ ...quizData, durationInSeconds: parseInt(e.target.value) });
  };

  const handleQuestionChange = (index: number, text: string) => {
    const newQuestions = [...quizData.questions];
    newQuestions[index].text = text;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    text: string,
  ) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].options[optionIndex].text = text;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleCorrectOptionChange = (
    questionIndex: number,
    optionIndex: number,
  ) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].options[optionIndex].correct =
      !newQuestions[questionIndex].options[optionIndex].correct;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].options.push({ text: '', correct: false });
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...quizData.questions];
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options = newQuestions[
        questionIndex
      ].options.filter((_, index) => index !== optionIndex);
      setQuizData({ ...quizData, questions: newQuestions });
    }
  };

  const handleParticipantChange = (index: number, phoneNumber: string) => {
    // Only allow digits and limit to 10 characters
    const cleaned = phoneNumber.replace(/\D/g, '').slice(0, 10);
    const newParticipants = [...quizData.participants];
    newParticipants[index].phoneNumber = cleaned;
    setQuizData({ ...quizData, participants: newParticipants });
  };

  const addParticipant = () => {
    setQuizData({
      ...quizData,
      participants: [...quizData.participants, { phoneNumber: '' }],
    });
  };

  const removeParticipant = (index: number) => {
    if (quizData.participants.length > 1) {
      const newParticipants = quizData.participants.filter(
        (_, i) => i !== index,
      );
      setQuizData({ ...quizData, participants: newParticipants });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate quiz data
    if (!quizData.title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    if (quizData.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    if (quizData.participants.length === 0) {
      toast.error('Please add at least one participant');
      return;
    }

    // Validate all questions
    for (const question of quizData.questions) {
      if (!question.text.trim()) {
        toast.error('Please fill in all question texts');
        return;
      }
      if (question.options.some(o => !o.text.trim())) {
        toast.error('Please fill in all options');
        return;
      }
      if (!question.options.some(o => o.correct)) {
        toast.error('Please select at least one correct answer for each question');
        return;
      }
    }

    // Validate all participants
    for (const participant of quizData.participants) {
      if (!participant.phoneNumber.trim()) {
        toast.error('Please fill in all phone numbers');
        return;
      }
      try {
        formatPhoneNumber(participant.phoneNumber);
      } catch (err) {
        toast.error('Invalid phone number format. Numbers should be 8 digits starting with 06 (e.g., 06123456)');
        return;
      }
    }

    try {
      const submissionData = {
        ...quizData,
        startTime: new Date(quizData.startTime).toISOString()
      };

      console.log('Attempting to create quiz with data:', {
        url: `${BASE_URL}/api/quizzes`,
        data: submissionData
      });

      const response = await axios.post(`${BASE_URL}/api/quizzes`, submissionData);
      console.log('Quiz creation response:', response.data);
      
      if (!response.data) {
        console.error('Empty response received from server');
        toast.error('Failed to create quiz: Empty response received');
        throw new Error('Failed to create quiz: Empty response received');
      }

      const quizId = response.data.id;
      
      if (!quizId) {
        console.error('Response data missing quiz ID:', response.data);
        toast.error('Failed to create quiz: No quiz ID found in response');
        throw new Error('Failed to create quiz: No quiz ID found in response');
      }

      console.log('Quiz created successfully with ID:', quizId);
      setCreatedQuizId(quizId.toString());
      toast.success('Quiz created successfully!');
      setCurrentStep('invite');

      // Store participants for invites before clearing form
      setInviteParticipants(quizData.participants.filter(p => p.phoneNumber.trim() !== ''));

      // Clear the form data after successful submission
      setQuizData({
        title: '',
        durationInSeconds: 120,
        startTime: new Date().toISOString(),
        closed: false,
        questions: [
          {
            text: '',
            options: [
              { text: '', correct: false },
              { text: '', correct: false },
            ],
          },
        ],
        participants: [{ phoneNumber: '' }],
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Axios error details:', {
          error,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
        toast.error(error.response?.data?.message || 'Failed to create quiz');
      } else {
        toast.error('An unexpected error occurred');
      }
      throw error;
    }
  };

  const handleInvitesSent = () => {
    setCurrentStep(null);
    setInviteParticipants([]);
    // Navigate to results page
    navigate(`/quiz/results/${createdQuizId}`);
  };

  const handleQuestionComplete = () => {
    const currentQuestion = quizData.questions[currentQuestionIndex];
    
    // Validate current question
    if (!currentQuestion.text.trim()) {
      toast.error('Please fill in the question text');
      return;
    }
    if (currentQuestion.options.some(o => !o.text.trim())) {
      toast.error('Please fill in all options');
      return;
    }
    if (!currentQuestion.options.some(o => o.correct)) {
      toast.error('Please select at least one correct answer');
      return;
    }

    setError('');
    setShowAddQuestionPrompt(true);
    toast.success('Question added successfully!');
  };

  const handleAddAnotherQuestion = () => {
    setShowAddQuestionPrompt(false);
    // Initialize the new question with default values before adding
    const newQuestion = {
      text: '',
      options: [
        { text: '', correct: false },
        { text: '', correct: false },
      ],
    };
    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setCurrentQuestionIndex(quizData.questions.length);
    toast.info('New question added. Please fill in the details.');
  };

  const handleFinishQuestions = () => {
    setShowAddQuestionPrompt(false);
    setCurrentStep('participants');
    toast.info('Moving to participant section');
  };

  const renderBasicInfoModal = () => (
    <Modal
      isOpen={currentStep === 'basic'}
      onClose={() => setCurrentStep(null)}
      title="Basic Quiz Information"
      subtitle="Set the title and duration for your quiz"
      currentStep={1}
      totalSteps={3}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base">Quiz Title</Label>
          <Input
            id="title"
            value={quizData.title}
            onChange={handleTitleChange}
            placeholder="Enter quiz title"
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration" className="text-base">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={quizData.durationInSeconds}
            onChange={handleDurationChange}
            min="30"
            required
            className="h-12"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(null)}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => setCurrentStep('questions')}
            className="px-6"
          >
            Next: Add Questions
          </Button>
        </div>
      </div>
    </Modal>
  );

  const renderQuestionModal = () => {
    // Add safety check for current question
    if (!quizData.questions[currentQuestionIndex]) {
      return null;
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];

    return (
      <Modal
        isOpen={currentStep === 'questions' && !showAddQuestionPrompt}
        onClose={() => setCurrentStep(null)}
        title={`Question ${currentQuestionIndex + 1}`}
        subtitle="Add question text and options"
        currentStep={2}
        totalSteps={3}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base">Question Text</Label>
            <Textarea
              value={currentQuestion.text}
              onChange={(e) => handleQuestionChange(currentQuestionIndex, e.target.value)}
              placeholder="Enter your question"
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Mark correct answer(s)</span>
            </div>

            {currentQuestion.options.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`correct-${currentQuestionIndex}-${optionIndex}`}
                    checked={option.correct}
                    onCheckedChange={() =>
                      handleCorrectOptionChange(currentQuestionIndex, optionIndex)
                    }
                    className="text-sky-600"
                  />
                  <Label
                    htmlFor={`correct-${currentQuestionIndex}-${optionIndex}`}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    Correct
                  </Label>
                </div>
                <Input
                  value={option.text}
                  onChange={(e) =>
                    handleOptionChange(
                      currentQuestionIndex,
                      optionIndex,
                      e.target.value,
                    )
                  }
                  placeholder={`Option ${optionIndex + 1}`}
                  required
                  className="h-12"
                />
                {currentQuestion.options.length > 2 && (
                  <Button
                    type="button"
                    onClick={() => removeOption(currentQuestionIndex, optionIndex)}
                    variant="destructive"
                    size="sm"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              onClick={() => addOption(currentQuestionIndex)}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Add Option
            </Button>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep('basic')}
              className="px-6"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={handleQuestionComplete}
              className="px-6"
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  const renderAddQuestionPrompt = () => (
    <Modal
      isOpen={showAddQuestionPrompt}
      onClose={() => setShowAddQuestionPrompt(false)}
      title="Add Another Question?"
      subtitle="Choose whether to add another question or proceed to add participants"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleAddAnotherQuestion}
            className="w-full py-8 text-lg"
          >
            Add Another Question
          </Button>
          <Button
            onClick={handleFinishQuestions}
            variant="outline"
            className="w-full py-8 text-lg"
          >
            Finish and Add Participants
          </Button>
        </div>
      </div>
    </Modal>
  );

  const renderParticipantsModal = () => (
    <Modal
      isOpen={currentStep === 'participants'}
      onClose={() => setCurrentStep(null)}
      title="Add Participants"
      subtitle="Enter phone numbers for quiz participants"
      currentStep={3}
      totalSteps={3}
    >
      <div className="space-y-6">
        <div className="bg-sky-50 p-4 rounded-lg mb-4">
          <p className="text-sky-700 text-sm">
            Enter 10-digit phone numbers starting with 06 (e.g., 0612345678)
          </p>
        </div>

        {quizData.participants.map((participant, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                value={participant.phoneNumber}
                onChange={(e) => handleParticipantChange(index, e.target.value)}
                placeholder="0612345678"
                required
                className="h-12"
                maxLength={10}
                pattern="06\d{8}"
              />
              {participant.phoneNumber && !participant.phoneNumber.match(/^06\d{8}$/) && (
                <p className="text-red-500 text-sm mt-1">
                  Must be 10 digits starting with 06
                </p>
              )}
            </div>
            {quizData.participants.length > 1 && (
              <Button
                type="button"
                onClick={() => removeParticipant(index)}
                variant="destructive"
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            onClick={addParticipant}
            variant="outline"
            className="px-6"
          >
            Add Participant
          </Button>
          <div className="space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep('questions')}
              className="px-6"
            >
              Back
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="px-6"
            >
              Create Quiz
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );

  const renderInviteModal = () => (
    <Modal
      isOpen={currentStep === 'invite'}
      onClose={() => setCurrentStep(null)}
      title="Send Invites"
      subtitle="Send quiz invitations to participants"
    >
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-600">Quiz created successfully! Now you can send invites to the participants.</p>
        </div>
        
        <InviteParticipants
          quizId={createdQuizId}
          participants={inviteParticipants}
          onInvitesSent={handleInvitesSent}
        />
      </div>
    </Modal>
  );

  const startQuizCreation = () => {
    setCurrentStep('basic');
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Create a New Quiz</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
          Click the button below to start creating your quiz
        </p>
        {!currentStep && (
          <Button
            onClick={startQuizCreation}
            size="lg"
            className="text-lg px-8 py-6 h-auto"
          >
            Create New Quiz
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {renderBasicInfoModal()}
      {renderQuestionModal()}
      {renderAddQuestionPrompt()}
      {renderParticipantsModal()}
      {renderInviteModal()}
    </div>
  );
};

export default QuizForm;
