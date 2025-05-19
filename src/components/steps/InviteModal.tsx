// components/steps/InviteModal.tsx
import React from 'react';
import { Modal } from '../ui/modal';
import InviteParticipants from '../InviteParticipants';

interface Props {
  isOpen: boolean;
  quizId: string;
  participants: { phoneNumber: string }[];
  onInvitesSent: () => void;
  onClose: () => void;
}

const InviteModal: React.FC<Props> = ({
  isOpen,
  quizId,
  participants,
  onInvitesSent,
  onClose,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Send Invites"
    subtitle="Send quiz invitations to participants"
  >
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-green-600">
          Quiz created successfully! Now you can send invites to the
          participants.
        </p>
      </div>
      <InviteParticipants
        quizId={quizId}
        participants={participants}
        onInvitesSent={onInvitesSent}
      />
    </div>
  </Modal>
);

export default InviteModal;
