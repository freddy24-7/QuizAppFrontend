// components/questions/OptionInput.tsx
import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';

interface Option {
  text: string;
  correct: boolean;
}

interface Props {
  index: number;
  option: Option;
  onTextChange: (index: number, text: string) => void;
  onToggleCorrect: (index: number) => void;
  onRemove: (index: number) => void;
  disableRemove?: boolean;
}

const OptionInput: React.FC<Props> = ({
  index,
  option,
  onTextChange,
  onToggleCorrect,
  onRemove,
  disableRemove = false,
}) => (
  <div className="flex items-center space-x-4">
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`correct-${index}`}
        checked={option.correct}
        onCheckedChange={() => onToggleCorrect(index)}
      />
      <Label
        htmlFor={`correct-${index}`}
        className="text-sm text-gray-600 dark:text-gray-400"
      >
        Correct
      </Label>
    </div>

    <Input
      value={option.text}
      onChange={(e) => onTextChange(index, e.target.value)}
      placeholder={`Option ${index + 1}`}
      required
      className="h-12"
    />

    {!disableRemove && (
      <Button
        type="button"
        onClick={() => onRemove(index)}
        variant="destructive"
        size="sm"
      >
        Remove
      </Button>
    )}
  </div>
);

export default OptionInput;
