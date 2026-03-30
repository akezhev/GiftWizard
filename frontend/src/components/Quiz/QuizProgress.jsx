import React from 'react';
import { Check } from 'lucide-react';

const QuizProgress = ({ currentStep, totalSteps }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="px-6 py-4 border-b">
      <div className="flex items-center justify-between">
        {steps.map((step) => (
          <div key={step} className="flex-1 flex items-center">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                    ? 'bg-purple-600 text-white ring-4 ring-purple-200'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step}</span>
                )}
              </div>
            </div>
            {step < totalSteps && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Основное</span>
        <span>Интересы</span>
        <span>Детали</span>
        <span>Готово</span>
      </div>
    </div>
  );
};

export default QuizProgress;