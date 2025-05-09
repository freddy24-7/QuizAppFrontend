import { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Modal } from './ui/modal';

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
  questions: Question[];
  participants: Participant[];
}

const QuizForm = () => {
  const [quizData, setQuizData] = useState<QuizData>({
    title: '',
    durationInSeconds: 120,
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
  const [currentStep, setCurrentStep] = useState<'basic' | 'questions' | 'participants' | null>(null);

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
    const newParticipants = [...quizData.participants];
    newParticipants[index].phoneNumber = phoneNumber;
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

      await axios.post('http://localhost:8080/api/quizzes', quizData);
      setSuccess('Quiz created successfully!');
      setCurrentStep(null);
      
      // Clear form
      setQuizData({
        title: '',
        durationInSeconds: 120,
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
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while creating the quiz',
      );
    }
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
        {quizData.participants.map((participant, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Input
              value={participant.phoneNumber}
              onChange={(e) => handleParticipantChange(index, e.target.value)}
              placeholder="Enter phone number"
              required
              className="h-12"
            />
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

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      {renderBasicInfoModal()}
      {renderQuestionsModal()}
      {renderParticipantsModal()}
    </div>
  );
};

export default QuizForm;
