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
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Quiz Title</Label>
          <Input
            id="title"
            value={quizData.title}
            onChange={handleTitleChange}
            placeholder="Enter quiz title"
            required
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={quizData.durationInSeconds}
            onChange={handleDurationChange}
            min="30"
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => setCurrentStep('questions')}
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
      <div className="space-y-6">
        {quizData.questions.map((question, questionIndex) => (
          <div
            key={questionIndex}
            className="p-4 border border-sky-200 rounded-lg space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Label>Question {questionIndex + 1}</Label>
                <Textarea
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionChange(questionIndex, e.target.value)
                  }
                  placeholder="Enter your question"
                  required
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

            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className="flex items-center space-x-4"
                >
                  <Checkbox
                    id={`correct-${questionIndex}-${optionIndex}`}
                    checked={option.correct}
                    onCheckedChange={() =>
                      handleCorrectOptionChange(questionIndex, optionIndex)
                    }
                    className="text-sky-600"
                  />
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
                className="mt-2"
              >
                Add Option
              </Button>
            </div>
          </div>
        ))}

        <div className="flex justify-between">
          <Button
            type="button"
            onClick={addQuestion}
            variant="outline"
          >
            Add Question
          </Button>
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep('basic')}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => setCurrentStep('participants')}
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
      <div className="space-y-4">
        {quizData.participants.map((participant, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Input
              value={participant.phoneNumber}
              onChange={(e) => handleParticipantChange(index, e.target.value)}
              placeholder="Enter phone number"
              required
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

        <div className="flex justify-between">
          <Button
            type="button"
            onClick={addParticipant}
            variant="outline"
          >
            Add Participant
          </Button>
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep('questions')}
            >
              Back
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
            >
              Create Quiz
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Create a New Quiz</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Follow the steps below to create your quiz
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Button
          onClick={() => setCurrentStep('basic')}
          variant={currentStep === 'basic' ? 'default' : 'outline'}
          className="h-24 flex flex-col items-center justify-center"
        >
          <span className="text-lg">1</span>
          <span>Basic Info</span>
        </Button>
        <Button
          onClick={() => setCurrentStep('questions')}
          variant={currentStep === 'questions' ? 'default' : 'outline'}
          className="h-24 flex flex-col items-center justify-center"
        >
          <span className="text-lg">2</span>
          <span>Questions</span>
        </Button>
        <Button
          onClick={() => setCurrentStep('participants')}
          variant={currentStep === 'participants' ? 'default' : 'outline'}
          className="h-24 flex flex-col items-center justify-center"
        >
          <span className="text-lg">3</span>
          <span>Participants</span>
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
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
