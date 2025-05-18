import * as React from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  currentStep?: number;
  totalSteps?: number;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  currentStep,
  totalSteps,
  children, 
  className 
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={cn(
        "relative z-50 w-full max-w-2xl bg-white rounded-lg shadow-lg p-8",
        "dark:bg-gray-800",
        className
      )}>
        <div className="mb-6">
          {currentStep && totalSteps && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Step {currentStep} of {totalSteps}
                </span>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-sky-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
          {!currentStep && (
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          {currentStep && (
            <div>
              <h2 className="text-2xl font-semibold">{title}</h2>
              {subtitle && (
                <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
} 