import React from 'react';
import { Modal } from './ui/modal';
import { Accordion } from './ui/accordion';

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ isOpen, onClose }) => {
  const accordionItems = [
    {
      title: 'Background',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>
            QuizApp was created as a demonstration project to showcase the integration of modern web technologies:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>A React Vite frontend for blazing-fast development and optimal performance</li>
            <li>A Spring Boot backend demonstrating enterprise-grade Java capabilities</li>
            <li>Real-world features like SMS integration and real-time updates</li>
          </ul>
          <p className="mt-4">
            The application serves as a practical example of full-stack development using Java and React.
            Users can easily test the entire system by creating quizzes.
          </p>
        </div>
      ),
    },
    {
      title: 'How to Use',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>QuizApp allows you to create and participate in interactive quizzes with the following steps:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Create a quiz by setting title and duration</li>
            <li>Add multiple-choice questions with correct answers</li>
            <li>Add participants using their phone numbers</li>
            <li>Participants receive SMS with quiz links</li>
            <li>Track results in real-time as participants complete the quiz</li>
          </ol>
        </div>
      ),
    },
    {
      title: 'Backend Tech Stack',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>The backend is built with:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Java 17+</li>
            <li>Spring Boot</li>
            <li>Spring Data JPA (Hibernate)</li>
            <li>H2/PostgreSQL (configurable)</li>
            <li>Lombok</li>
            <li>Maven</li>
          </ul>
          <p className="mt-4 font-medium">Key Features:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Create quizzes with questions and answer options</li>
            <li>Add participants by phone number</li>
            <li>Record and update user responses</li>
            <li>Automatically close quizzes after timeout</li>
            <li>Track quiz progress (per user)</li>
            <li>View quiz results with scores and metadata</li>
            <li>RESTful API for frontend integration</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Frontend Tech Stack',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>The frontend is built with:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>React 18</li>
            <li>TypeScript</li>
            <li>Vite</li>
            <li>TailwindCSS</li>
            <li>React Router</li>
            <li>Axios for API calls</li>
          </ul>
          <p className="mt-4 font-medium">Key Features:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Modern, responsive design</li>
            <li>Real-time quiz participation</li>
            <li>Interactive quiz creation wizard</li>
            <li>Live result tracking</li>
            <li>Error handling and validation</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'GitHub Repos',
      content: (
        <div className="space-y-4 text-gray-600">
          <p>The project is split into two repositories:</p>
          <div className="space-y-2">
            <p>Frontend Repository:</p>
            <a
              href="https://github.com/freddy24-7/QuizAppFrontend"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:underline break-all"
            >
              https://github.com/freddy24-7/QuizAppFrontend
            </a>
          </div>
          <div className="space-y-2">
            <p>Backend Repository:</p>
            <a
              href="https://github.com/freddy24-7/QuizApp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:underline break-all"
            >
              https://github.com/freddy24-7/QuizApp
            </a>
          </div>
        </div>
      ),
    },
    {
      title: 'Other Info',
      content: (
        <div className="space-y-4 text-gray-600">
          <div className="space-y-2">
            <p className="font-medium">Phone Number Format:</p>
            <p>The application is configured for Dutch phone numbers (starting with 06). This can be adjusted in the validation logic if needed for other regions.</p>
          </div>
          <div className="space-y-2">
            <p className="font-medium">Twilio Integration:</p>
            <p>To enable SMS functionality:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Twilio credentials must be added to application.properties</li>
              <li>The integration assumes a production environment</li>
              <li>SMS features will not work with localhost in development</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="About QuizApp"
      subtitle="Learn more about our quiz application"
    >
      <div className="mt-6 max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <Accordion items={accordionItems} />
      </div>
    </Modal>
  );
};

export default About; 