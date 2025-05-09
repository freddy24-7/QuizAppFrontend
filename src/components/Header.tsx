import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-sky-100/90 backdrop-blur-sm border-b border-sky-200 z-50">
      <div className="w-full px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-sky-900">QuizGenerator</h1>
        <nav>
          <Button variant="ghost" className="text-sky-700 hover:text-sky-900">
            About
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header; 