import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100vh-10rem)] w-full bg-gradient-to-b from-sky-50 to-sky-100">
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-8 px-4">
          <h2 className="text-4xl font-bold text-sky-900 mb-8">
            Welcome to QuizGenerator
          </h2>
          <p className="text-sky-700 text-lg max-w-2xl mx-auto">
            Test your knowledge with our interactive quizzes. Get ready for an
            engaging learning experience!
          </p>
          <Button
            onClick={() => navigate("/quiz")}
            className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Start Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home; 