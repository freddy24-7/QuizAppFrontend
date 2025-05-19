// components/steps/ParticipantsStep.tsx
import React from 'react';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface Participant {
  phoneNumber: string;
}

interface Props {
  participants: Participant[];
  isOpen: boolean;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

const ParticipantsStep: React.FC<Props> = ({
  participants,
  isOpen,
  onChange,
  onAdd,
  onRemove,
  onBack,
  onSubmit,
  onClose,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Add Participants"
    subtitle="Enter phone numbers for quiz participants"
    currentStep={3}
    totalSteps={3}
  >
    <div className="space-y-6">
      <div className="bg-sky-50 p-4 rounded-lg">
        <p className="text-sky-700 text-sm">
          Enter 10-digit phone numbers starting with 06 (e.g., 0612345678)
        </p>
      </div>

      {participants.map((p, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              value={p.phoneNumber}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder="0612345678"
              required
              className="h-12"
              maxLength={10}
              pattern="06\d{8}"
            />
            {p.phoneNumber && !p.phoneNumber.match(/^06\d{8}$/) && (
              <p className="text-red-500 text-sm mt-1">
                Must be 10 digits starting with 06
              </p>
            )}
          </div>
          {participants.length > 1 && (
            <Button
              type="button"
              onClick={() => onRemove(i)}
              variant="destructive"
            >
              Remove
            </Button>
          )}
        </div>
      ))}

      <div className="flex justify-between pt-4">
        <Button type="button" onClick={onAdd} variant="outline">
          Add Participant
        </Button>
        <div className="space-x-4">
          <Button type="button" onClick={onBack} variant="outline">
            Back
          </Button>
          <Button onClick={onSubmit}>Create Quiz</Button>
        </div>
      </div>
    </div>
  </Modal>
);

export default ParticipantsStep;
