// components/questions/QuestionEditor.tsx
import React from 'react';
import { Label } from '../ui/label.tsx';
import { Textarea } from '../ui/textarea.tsx';
import { Button } from '../ui/button.tsx';
import OptionInput from '../steps/OptionInput.tsx';

interface Option {
  text: string;
  correct: boolean;
}

interface Props {
  questionText: string;
  options: Option[];
  onQuestionTextChange: (text: string) => void;
  onOptionTextChange: (index: number, text: string) => void;
  onOptionCorrectToggle: (index: number) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}

const QuestionEditor: React.FC<Props> = ({
  questionText,
  options,
  onQuestionTextChange,
  onOptionTextChange,
  onOptionCorrectToggle,
  onAddOption,
  onRemoveOption,
}) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <Label className="text-base">Question Text</Label>
      <Textarea
        value={questionText}
        onChange={(e) => onQuestionTextChange(e.target.value)}
        placeholder="Enter your question"
        required
        className="min-h-[100px]"
      />
    </div>

    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Mark correct answer(s)
      </p>

      {options.map((option, index) => (
        <OptionInput
          key={index}
          index={index}
          option={option}
          onTextChange={onOptionTextChange}
          onToggleCorrect={onOptionCorrectToggle}
          onRemove={onRemoveOption}
          disableRemove={options.length <= 2}
        />
      ))}

      <Button
        type="button"
        onClick={onAddOption}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        Add Option
      </Button>
    </div>
  </div>
);

export default QuestionEditor;
