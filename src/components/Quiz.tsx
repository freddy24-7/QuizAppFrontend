import QuizForm from './QuizForm';

const Quiz = () => {
  return (
    <div className="h-[calc(100vh-10rem)] w-full bg-gradient-to-b from-sky-50 to-sky-100 overflow-y-auto">
      <div className="w-full h-full">
        <QuizForm />
      </div>
    </div>
  );
};

export default Quiz; 