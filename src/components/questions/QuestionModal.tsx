// components/steps/QuestionModal.tsx
import React from 'react';
import { Modal } from '../ui/modal.tsx';
import { Button } from '../ui/button.tsx';
import QuestionEditor from './QuestionEditor.tsx';

interface Option {
  text: string;
  correct: boolean;
}

interface Props {
  isOpen: boolean;
  questionIndex: number;
  questionText: string;
  options: Option[];
  onChangeText: (text: string) => void;
  onChangeOptionText: (index: number, text: string) => void;
  onToggleCorrect: (index: number) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

const QuestionModal: React.FC<Props> = ({
  isOpen,
  questionIndex,
  questionText,
  options,
  onChangeText,
  onChangeOptionText,
  onToggleCorrect,
  onAddOption,
  onRemoveOption,
  onBack,
  onContinue,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onBack}
    title={`Question ${questionIndex + 1}`}
    subtitle="Add question text and options"
    currentStep={2}
    totalSteps={3}
  >
    <QuestionEditor
      questionText={questionText}
      options={options}
      onQuestionTextChange={onChangeText}
      onOptionTextChange={onChangeOptionText}
      onOptionCorrectToggle={onToggleCorrect}
      onAddOption={onAddOption}
      onRemoveOption={onRemoveOption}
    />

    <div className="flex justify-between pt-6">
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
      <Button onClick={onContinue}>Continue</Button>
    </div>
  </Modal>
);

export default QuestionModal;
