import React, { useState } from 'react';
import { Button } from './ui/button';
import { generateWhatsAppLink, generateQuizInviteMessage } from '../utils/whatsappUtils';

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
  const [isSending, setIsSending] = useState(false);

  const handleWhatsAppInvites = async () => {
    console.log('Starting invite process...');
    console.log('Quiz ID:', quizId);
    console.log('Participants:', participants);

    if (!quizId) {
      console.error('No quiz ID available');
      return;
    }

    if (!participants || participants.length === 0) {
      console.error('No participants available');
      return;
    }

    setIsSending(true);

    try {
      // Generate the invite message first
      const message = generateQuizInviteMessage(quizId);
      console.log('Generated message:', message);
      
      // Process participants one at a time
      for (const participant of participants) {
        console.log('Processing participant:', participant);
        if (!participant.phoneNumber) {
          console.error('Participant has no phone number:', participant);
          continue;
        }
        
        const whatsappLink = generateWhatsAppLink(participant.phoneNumber, message);
        console.log('Generated WhatsApp link:', whatsappLink);
        
        // Open WhatsApp link
        window.open(whatsappLink, '_blank');
        
        // Wait for 2 seconds before opening the next link
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      onInvitesSent();
    } catch (error) {
      console.error('Error sending invites:', error);
    } finally {
      setIsSending(false);
    }
  };

  const isButtonDisabled = !quizId || !participants || participants.length === 0 || isSending;
  console.log('Button disabled state:', isButtonDisabled);
  console.log('Current state:', { quizId, participantsCount: participants?.length, isSending });

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button
          onClick={handleWhatsAppInvites}
          disabled={isButtonDisabled}
          className="w-full max-w-md"
        >
          {isSending 
            ? 'Sending Invites...' 
            : `Send ${participants?.length || 0} WhatsApp Invite${participants?.length !== 1 ? 's' : ''}`}
        </Button>
      </div>

      <p className="text-sm text-gray-500 text-center">
        {isSending 
          ? 'Please wait while we send the invites...' 
          : 'This will open WhatsApp with a pre-filled message for each participant'}
      </p>
    </div>
  );
};

export default InviteParticipants; 