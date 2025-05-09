import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100vh-10rem)] w-full bg-gradient-to-b from-sky-50 to-sky-100">
      <div className="w-full h-full flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 max-w-7xl mx-auto">
          {/* Image Section */}
          <div className="relative w-full h-full min-h-[300px] md:min-h-[400px]">
            <img
              src="/quizguy.jpg"
              alt="Quiz Generator mascot"
              className="w-full h-full object-cover rounded-lg shadow-lg"
              loading="eager"
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col justify-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900">
              Welcome to QuizGenerator
            </h2>
            <p className="text-sky-700 text-base md:text-lg">
              Create a quiz and get your friends or family to play!
            </p>
            <Button
              onClick={() => navigate("/quiz")}
              className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-fit"
              aria-label="Start the quiz"
            >
              Start Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 