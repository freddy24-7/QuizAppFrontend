import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Button } from './ui/button';
import { BASE_URL } from '../services/api';

import BasicInfoStep from './steps/BasicInfoStep';
import QuestionModal from '@/components/questions/QuestionModal.tsx';
import AddQuestionPromptModal from './steps/AddQuestionPromptModal';
import ParticipantsStep from './steps/ParticipantsStep';

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

  const [currentStep, setCurrentStep] = useState<
    'basic' | 'questions' | 'participants' | null
  >(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAddQuestionPrompt, setShowAddQuestionPrompt] = useState(false);

  const navigate = useNavigate();

  const handleTitleChange = (title: string) =>
    setQuizData({ ...quizData, title });
  const handleDurationChange = (duration: number) =>
    setQuizData({ ...quizData, durationInSeconds: duration });

  const handleQuestionChange = (text: string) => {
    const newQuestions = [...quizData.questions];
    newQuestions[currentQuestionIndex].text = text;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const handleOptionChange = (optionIndex: number, text: string) => {
    const newQuestions = [...quizData.questions];
    newQuestions[currentQuestionIndex].options[optionIndex].text = text;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const toggleCorrectOption = (optionIndex: number) => {
    const newQuestions = [...quizData.questions];
    const option = newQuestions[currentQuestionIndex].options[optionIndex];
    option.correct = !option.correct;
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const addOption = () => {
    const newQuestions = [...quizData.questions];
    newQuestions[currentQuestionIndex].options.push({
      text: '',
      correct: false,
    });
    setQuizData({ ...quizData, questions: newQuestions });
  };

  const removeOption = (optionIndex: number) => {
    const newQuestions = [...quizData.questions];
    if (newQuestions[currentQuestionIndex].options.length > 2) {
      newQuestions[currentQuestionIndex].options.splice(optionIndex, 1);
      setQuizData({ ...quizData, questions: newQuestions });
    }
  };

  const handleParticipantChange = (index: number, phone: string) => {
    const cleaned = phone.replace(/\D/g, '').slice(0, 10);
    const newParticipants = [...quizData.participants];
    newParticipants[index].phoneNumber = cleaned;
    setQuizData({ ...quizData, participants: newParticipants });
  };

  const addParticipant = () =>
    setQuizData({
      ...quizData,
      participants: [...quizData.participants, { phoneNumber: '' }],
    });

  const removeParticipant = (index: number) => {
    if (quizData.participants.length > 1) {
      const updated = quizData.participants.filter((_, i) => i !== index);
      setQuizData({ ...quizData, participants: updated });
    }
  };

  const handleQuestionComplete = () => {
    const q = quizData.questions[currentQuestionIndex];
    if (
      !q.text.trim() ||
      q.options.some((o) => !o.text.trim()) ||
      !q.options.some((o) => o.correct)
    ) {
      toast.error('Complete all fields and mark at least one correct answer.');
      return;
    }
    setShowAddQuestionPrompt(true);
  };

  const handleAddAnotherQuestion = () => {
    setShowAddQuestionPrompt(false);
    setQuizData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          options: [
            { text: '', correct: false },
            { text: '', correct: false },
          ],
        },
      ],
    }));
    setCurrentQuestionIndex(quizData.questions.length);
  };

  const handleFinishQuestions = () => {
    setShowAddQuestionPrompt(false);
    setCurrentStep('participants');
  };

  const handleSubmit = async () => {
    if (
      !quizData.title.trim() ||
      quizData.questions.length === 0 ||
      quizData.participants.length === 0
    ) {
      toast.error('Fill in title, at least one question and participant');
      return;
    }

    for (const q of quizData.questions) {
      if (
        !q.text.trim() ||
        q.options.some((o) => !o.text.trim()) ||
        !q.options.some((o) => o.correct)
      ) {
        toast.error(
          'Check each question has text, options, and one correct answer.',
        );
        return;
      }
    }

    for (const p of quizData.participants) {
      if (!/^06\d{8}$/.test(p.phoneNumber)) {
        toast.error('Phone numbers must be 10 digits starting with 06');
        return;
      }
    }

    try {
      const submissionData = {
        title: quizData.title,
        durationInSeconds: quizData.durationInSeconds,
        startTime: new Date(quizData.startTime).toISOString().slice(0, 19),
        closed: quizData.closed,
        questions: quizData.questions.map((q) => ({
          text: q.text,
          options: q.options.map((o) => ({
            text: o.text,
            correct: o.correct,
          })),
        })),
        participants: quizData.participants.map((p) => ({
          phoneNumber: p.phoneNumber,
        })),
      };

      // Log the complete payload that will be sent to backend
      console.log(
        'Quiz submission payload:',
        JSON.stringify(submissionData, null, 2),
      );

      const res = await axios.post(`${BASE_URL}/api/quizzes`, submissionData);

      if (!res.data || !res.data.id) {
        toast.error('Invalid response from server');
        return;
      }

      toast.success('Quiz created and invites sent!');
      navigate(`/quiz/results/${res.data.id}`);

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
      let msg = 'Failed to create quiz';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg;
      }
      toast.error(msg);
    }
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
            onClick={() => setCurrentStep('basic')}
            size="lg"
            className="text-lg px-8 py-6 h-auto"
          >
            Create New Quiz
          </Button>
        )}
      </div>

      <BasicInfoStep
        isOpen={currentStep === 'basic'}
        title={quizData.title}
        duration={quizData.durationInSeconds}
        onTitleChange={handleTitleChange}
        onDurationChange={handleDurationChange}
        onNext={() => setCurrentStep('questions')}
        onCancel={() => setCurrentStep(null)}
      />

      <QuestionModal
        isOpen={currentStep === 'questions' && !showAddQuestionPrompt}
        questionIndex={currentQuestionIndex}
        questionText={quizData.questions[currentQuestionIndex]?.text || ''}
        options={quizData.questions[currentQuestionIndex]?.options || []}
        onChangeText={handleQuestionChange}
        onChangeOptionText={handleOptionChange}
        onToggleCorrect={toggleCorrectOption}
        onAddOption={addOption}
        onRemoveOption={removeOption}
        onBack={() => setCurrentStep('basic')}
        onContinue={handleQuestionComplete}
      />

      <AddQuestionPromptModal
        isOpen={showAddQuestionPrompt}
        onAddAnother={handleAddAnotherQuestion}
        onFinish={handleFinishQuestions}
        onClose={() => setShowAddQuestionPrompt(false)}
      />

      <ParticipantsStep
        isOpen={currentStep === 'participants'}
        participants={quizData.participants}
        onChange={handleParticipantChange}
        onAdd={addParticipant}
        onRemove={removeParticipant}
        onBack={() => setCurrentStep('questions')}
        onSubmit={handleSubmit}
        onClose={() => setCurrentStep(null)}
      />
    </div>
  );
};

export default QuizForm;
