import { useState } from 'react';
import axios from 'axios';
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
  const [success, setSuccess] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'basic' | 'questions' | 'participants' | 'invite' | null>(null);
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

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          text: '',
          options: [
            { text: '', correct: false },
            { text: '', correct: false },
          ],
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    if (quizData.questions.length > 1) {
      const newQuestions = quizData.questions.filter((_, i) => i !== index);
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

  const validatePhoneNumbers = () => {
    for (const participant of quizData.participants) {
      try {
        formatPhoneNumber(participant.phoneNumber);
      } catch (err) {
        throw new Error(`Invalid phone number format. Numbers should be 8 digits starting with 06 (e.g., 06123456)`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!quizData.title.trim()) {
        throw new Error('Please enter a quiz title');
      }

      if (quizData.questions.some((q) => !q.text.trim())) {
        throw new Error('Please fill in all questions');
      }

      if (
        quizData.questions.some((q) => q.options.some((o) => !o.text.trim()))
      ) {
        throw new Error('Please fill in all options');
      }

      if (quizData.questions.some((q) => !q.options.some((o) => o.correct))) {
        throw new Error('Each question must have at least one correct answer');
      }

      if (quizData.participants.some((p) => !p.phoneNumber.trim())) {
        throw new Error('Please fill in all phone numbers');
      }

      // Validate phone number format
      validatePhoneNumbers();

      // Store participants for invites before clearing form
      setInviteParticipants(quizData.participants.filter(p => p.phoneNumber.trim() !== ''));

      // Format the data to match backend expectations
      const submissionData = {
        ...quizData,
        participants: quizData.participants.map(p => ({
          phoneNumber: p.phoneNumber
        }))
      };

      const response = await axios.post(`${BASE_URL}/api/quizzes`, submissionData);
      console.log('Quiz creation response:', response.data);
      
      if (!response.data) {
        throw new Error('Failed to create quiz: Empty response received');
      }

      // The response should now have a clean structure with an id field
      const quizId = response.data.id;
      
      if (!quizId) {
        console.error('Response data:', response.data);
        throw new Error('Failed to create quiz: No quiz ID found in response');
      }

      setCreatedQuizId(quizId.toString());
      setSuccess('Quiz created successfully!');
      setCurrentStep('invite');

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
    } catch (err) {
      console.error('Quiz creation error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while creating the quiz'
      );
    }
  };

  const handleInvitesSent = () => {
    setCurrentStep(null);
    setInviteParticipants([]);
    // Navigate to results page
    navigate(`/quiz/results/${createdQuizId}`);
  };

  const renderBasicInfoModal = () => (
    <Modal
      isOpen={currentStep === 'basic'}
      onClose={() => setCurrentStep(null)}
      title="Basic Quiz Information"
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

  const renderQuestionsModal = () => (
    <Modal
      isOpen={currentStep === 'questions'}
      onClose={() => setCurrentStep(null)}
      title="Add Questions"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-8">
        <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg mb-6">
          <p className="text-sky-700 dark:text-sky-300 text-sm">
            <span className="font-semibold">Tip:</span> For each question, mark the checkbox next to the correct answer(s). You can select multiple correct answers if needed.
          </p>
        </div>

        {quizData.questions.map((question, questionIndex) => (
          <div
            key={questionIndex}
            className="p-6 border border-sky-200 rounded-lg space-y-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <Label className="text-base">Question {questionIndex + 1}</Label>
                <Textarea
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionChange(questionIndex, e.target.value)
                  }
                  placeholder="Enter your question"
                  required
                  className="min-h-[100px]"
                />
              </div>
              {quizData.questions.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  variant="destructive"
                  className="ml-4"
                >
                  Remove
                </Button>
              )}
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
              {question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`correct-${questionIndex}-${optionIndex}`}
                      checked={option.correct}
                      onCheckedChange={() =>
                        handleCorrectOptionChange(questionIndex, optionIndex)
                      }
                      className="text-sky-600"
                    />
                    <Label
                      htmlFor={`correct-${questionIndex}-${optionIndex}`}
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      Correct
                    </Label>
                  </div>
                  <Input
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(
                        questionIndex,
                        optionIndex,
                        e.target.value,
                      )
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                    required
                    className="h-12"
                  />
                  {question.options.length > 2 && (
                    <Button
                      type="button"
                      onClick={() => removeOption(questionIndex, optionIndex)}
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
                onClick={() => addOption(questionIndex)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Add Option
              </Button>
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            onClick={addQuestion}
            variant="outline"
            className="px-6"
          >
            Add Question
          </Button>
          <div className="space-x-4">
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
              onClick={() => setCurrentStep('participants')}
              className="px-6"
            >
              Next: Add Participants
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );

  const renderParticipantsModal = () => (
    <Modal
      isOpen={currentStep === 'participants'}
      onClose={() => setCurrentStep(null)}
      title="Add Participants"
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

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Create a New Quiz</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Follow the steps below to create your quiz
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-12">
        <Button
          onClick={() => setCurrentStep('basic')}
          variant={currentStep === 'basic' ? 'default' : 'outline'}
          className="h-32 flex flex-col items-center justify-center space-y-2"
        >
          <span className="text-2xl">1</span>
          <span className="text-lg">Basic Info</span>
        </Button>
        <Button
          onClick={() => setCurrentStep('questions')}
          variant={currentStep === 'questions' ? 'default' : 'outline'}
          className="h-32 flex flex-col items-center justify-center space-y-2"
        >
          <span className="text-2xl">2</span>
          <span className="text-lg">Questions</span>
        </Button>
        <Button
          onClick={() => setCurrentStep('participants')}
          variant={currentStep === 'participants' ? 'default' : 'outline'}
          className="h-32 flex flex-col items-center justify-center space-y-2"
        >
          <span className="text-2xl">3</span>
          <span className="text-lg">Participants</span>
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && currentStep !== 'invite' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      {renderBasicInfoModal()}
      {renderQuestionsModal()}
      {renderParticipantsModal()}
      {renderInviteModal()}
    </div>
  );
};

export default QuizForm;
