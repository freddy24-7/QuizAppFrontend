import React from 'react';
import { Button } from './ui/button';
import { generateWhatsAppLink } from '../utils/whatsappUtils';

interface InviteParticipantsProps {
  quizId: string;
  participants: { phoneNumber: string }[];
  onInvitesSent: () => void;
}

const InviteParticipants: React.FC<InviteParticipantsProps> = ({
  quizId,
  participants,
  onInvitesSent,
}) => {
  const handleWhatsAppInvites = () => {
    participants.forEach((participant) => {
      const whatsappLink = generateWhatsAppLink(participant.phoneNumber, quizId);
      window.open(whatsappLink, '_blank');
    });
    onInvitesSent();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button
          onClick={handleWhatsAppInvites}
          disabled={participants.length === 0}
          className="w-full max-w-md"
        >
          {`Send ${participants.length} WhatsApp Invite${participants.length !== 1 ? 's' : ''}`}
        </Button>
      </div>

      <p className="text-sm text-gray-500 text-center">
        This will open WhatsApp with a pre-filled message for each participant
      </p>
    </div>
  );
};

export default InviteParticipants; 