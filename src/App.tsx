import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Quiz from './components/Quiz';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full flex flex-col bg-sky-50">
        <Header />
        <main className="flex-1 w-full mt-20 mb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
