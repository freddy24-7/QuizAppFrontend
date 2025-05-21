import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className="w-full py-4 px-6 text-left flex justify-between items-center hover:bg-gray-50"
        onClick={onToggle}
      >
        <span className="text-lg font-medium text-gray-900">{title}</span>
        <svg
          className={cn(
            "w-6 h-6 transform transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[1000px] py-4 px-6" : "max-h-0"
        )}
      >
        {children}
      </div>
    </div>
  );
};

interface AccordionProps {
  items: {
    title: string;
    content: React.ReactNode;
  }[];
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}; 