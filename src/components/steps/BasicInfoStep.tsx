// components/steps/BasicInfoStep.tsx
import React from 'react';
import { Modal } from '../ui/modal';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface Props {
  isOpen: boolean;
  title: string;
  duration: number;
  onTitleChange: (val: string) => void;
  onDurationChange: (val: number) => void;
  onNext: () => void;
  onCancel: () => void;
}

const BasicInfoStep: React.FC<Props> = ({
  isOpen,
  title,
  duration,
  onTitleChange,
  onDurationChange,
  onNext,
  onCancel,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onCancel}
    title="Basic Quiz Information"
    subtitle="Set the title and duration for your quiz"
    currentStep={1}
    totalSteps={3}
  >
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base">
          Quiz Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter quiz title"
          required
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration" className="text-base">
          Duration (seconds)
        </Label>
        <Input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => onDurationChange(parseInt(e.target.value))}
          min="30"
          required
          className="h-12"
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-6"
        >
          Cancel
        </Button>
        <Button type="button" onClick={onNext} className="px-6">
          Next: Add Questions
        </Button>
      </div>
    </div>
  </Modal>
);

export default BasicInfoStep;
