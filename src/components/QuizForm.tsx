import { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { whatsappService } from '../services/whatsapp';

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
          { text: '', correct: false }
        ]
      }
    ],
    participants: [{ phoneNumber: '' }]
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

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

  const handleOptionChange = (questionIndex: number, optionIndex: number, text: string) => {
    const newQuestions = [...quizData.questions];
    newQuestions[questionIndex].options[optionIndex].text = text;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleCorrectOptionChange = (questionIndex: number, optionIndex: number) => {
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
      newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
        (_, index) => index !== optionIndex
      );
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
            { text: '', correct: false }
          ]
        }
      ]
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
      participants: [...quizData.participants, { phoneNumber: '' }]
    });
  };

  const removeParticipant = (index: number) => {
    if (quizData.participants.length > 1) {
      const newParticipants = quizData.participants.filter((_, i) => i !== index);
      setQuizData({ ...quizData, participants: newParticipants });
    }
  };

  const createWhatsAppGroup = async () => {
    setIsCreatingGroup(true);
    try {
      const phoneNumbers = quizData.participants.map(p => p.phoneNumber);
      const { groupId } = await whatsappService.createGroup(phoneNumbers, quizData.title);
      return groupId;
    } catch (err) {
      throw new Error('Failed to create WhatsApp group. Please check your WhatsApp API configuration.');
    } finally {
      setIsCreatingGroup(false);
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

      if (quizData.questions.some(q => !q.text.trim())) {
        throw new Error('Please fill in all questions');
      }

      if (quizData.questions.some(q => q.options.some(o => !o.text.trim()))) {
        throw new Error('Please fill in all options');
      }

      if (quizData.questions.some(q => !q.options.some(o => o.correct))) {
        throw new Error('Each question must have at least one correct answer');
      }

      if (quizData.participants.some(p => !p.phoneNumber.trim())) {
        throw new Error('Please fill in all phone numbers');
      }

      // Create WhatsApp group first
      const groupId = await createWhatsAppGroup();

      // Send to backend
      const { data } = await axios.post('http://localhost:8080/api/quizzes', {
        ...quizData,
        whatsappGroupId: groupId
      });
      
      setSuccess(`Quiz "${data.title}" created successfully! A WhatsApp group has been created for participants.`);
      
      // Clear form
      setQuizData({
        title: '',
        durationInSeconds: 120,
        questions: [
          {
            text: '',
            options: [
              { text: '', correct: false },
              { text: '', correct: false }
            ]
          }
        ],
        participants: [{ phoneNumber: '' }]
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the quiz');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
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
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-sky-900">Questions</h3>
          <Button
            type="button"
            onClick={addQuestion}
            className="bg-sky-600 hover:bg-sky-700"
          >
            Add Question
          </Button>
        </div>

        {quizData.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="p-4 border border-sky-200 rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Label>Question {questionIndex + 1}</Label>
                <Textarea
                  value={question.text}
                  onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
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
                <div key={optionIndex} className="flex items-center space-x-4">
                  <Checkbox
                    id={`correct-${questionIndex}-${optionIndex}`}
                    checked={option.correct}
                    onCheckedChange={() => handleCorrectOptionChange(questionIndex, optionIndex)}
                    className="text-sky-600"
                  />
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
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
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-sky-900">Participants</h3>
          <Button
            type="button"
            onClick={addParticipant}
            className="bg-sky-600 hover:bg-sky-700"
          >
            Add Participant
          </Button>
        </div>

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
      </div>

      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600 bg-green-50 p-4 rounded-lg">
          {success}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-sky-600 hover:bg-sky-700 text-white py-6 text-lg"
        disabled={isCreatingGroup}
      >
        {isCreatingGroup ? 'Creating WhatsApp Group...' : 'Create Quiz'}
      </Button>
    </form>
  );
};

export default QuizForm; 