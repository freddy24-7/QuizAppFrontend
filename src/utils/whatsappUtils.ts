export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid Dutch mobile number (10 digits starting with 06)
  if (!cleaned.match(/^06\d{8}$/)) {
    throw new Error('Phone number must be 10 digits starting with 06');
  }

  // Convert 06 to +31 6 for WhatsApp international format
  return `31${cleaned.substring(1)}`;
};

export const generateQuizInviteMessage = (quizId: string): string => {
  // For development, use explicit http://localhost:5173
  const isDevelopment = window.location.hostname === 'localhost';
  const baseUrl = isDevelopment ? 'http://localhost:5173' : window.location.origin;
  
  return `Hello! You've been invited to participate in a quiz.\n\n` +
    `To start the quiz:\n` +
    `1. Click this link: ${baseUrl}/quiz/respond?quizId=${quizId}\n` +
    `2. Enter your username and phone number\n` +
    `3. Answer each question carefully\n\n` +
    `The quiz will save your answers automatically as you progress.\n\n` +
    `Good luck! 🎯`;
};

export const generateWhatsAppLink = (phoneNumber: string, quizId: string): string => {
  const formattedNumber = formatPhoneNumber(phoneNumber);
  const message = generateQuizInviteMessage(quizId);
  return `https://wa.me/${formattedNumber}/?text=${encodeURIComponent(message)}`;
}; 