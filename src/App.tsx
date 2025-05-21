import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Quiz from './components/Quiz';
import QuizResponse from './components/QuizResponse';
import QuizResults from './components/QuizResults';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full flex flex-col bg-sky-50">
        <Header />
        <main className="flex-1 w-full mt-16 mb-16 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/respond" element={<QuizResponse />} />
            <Route path="/quiz/results/:quizId" element={<QuizResults />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
