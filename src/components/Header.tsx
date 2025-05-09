import { Button } from './ui/button';

const Header = () => {
  return (
    <header
      className="fixed top-0 w-full bg-sky-100/90 backdrop-blur-sm border-b border-sky-200 z-50"
      role="banner"
    >
      <div className="w-full px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-sky-900">
          <span className="sr-only">Quiz Generator</span>
          QuizGenerator
        </h1>
        <nav aria-label="Main navigation">
          <Button
            variant="ghost"
            className="text-sky-700 hover:text-sky-900"
            aria-label="About Quiz Generator"
          >
            About
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
