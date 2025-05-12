export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  console.log('Original phone number:', phoneNumber);
  console.log('Cleaned phone number:', cleaned);
  console.log('Regex test result:', /^06\d{8}$/.test(cleaned));
  
  // Check if it's a 10-digit number starting with 06
  if (!/^06\d{8}$/.test(cleaned)) {
    throw new Error('Phone number must be 10 digits starting with 06');
  }
  
  // Convert to international format for WhatsApp
  return `31${cleaned.slice(1)}`;
};

export const generateWhatsAppLink = (phoneNumber: string, message: string): string => {
  const formattedNumber = formatPhoneNumber(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
};

export const generateQuizInviteMessage = (quizId: string): string => {
  const baseUrl = window.location.hostname === 'localhost' 
    ? 'localhost:5173' 
    : window.location.origin;
    
  const quizUrl = `${baseUrl}/quiz/respond?quizId=${quizId}`;
  return `You've been invited to take a quiz! Click the link below to participate:\n\n${quizUrl}`;
}; 