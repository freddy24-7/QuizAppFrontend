// components/steps/AddQuestionPromptModal.tsx
import React from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';

interface Props {
  isOpen: boolean;
  onAddAnother: () => void;
  onFinish: () => void;
  onClose: () => void;
}

const AddQuestionPromptModal: React.FC<Props> = ({
  isOpen,
  onAddAnother,
  onFinish,
  onClose,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Add Another Question?"
    subtitle="Choose whether to add another question or proceed to add participants"
  >
    <div className="flex flex-col gap-4">
      <Button onClick={onAddAnother} className="w-full py-6 text-lg">
        Add Another Question
      </Button>
      <Button
        onClick={onFinish}
        variant="outline"
        className="w-full py-6 text-lg"
      >
        Finish and Add Participants
      </Button>
    </div>
  </Modal>
);

export default AddQuestionPromptModal;
