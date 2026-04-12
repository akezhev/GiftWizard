import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import QuizForm from '../components/Quiz/QuizForm';
import QuizProgress from '../components/Quiz/QuizProgress';
import { api } from '../services/api';
import { saveQuizResult } from '../utils/indexedDB';

const QuizPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ age: '', gender: '', hobby: '', zodiac: '', occasion: '', budget: '', interests: [], relationship: '', personality: '' });

  const mutation = useMutation({
    mutationFn: (data) => api.generateGiftRecommendations(data),
    onSuccess: async (data) => {
      await saveQuizResult({ id: data.id, answers, recommendations: data.gifts, timestamp: Date.now() });
      navigate(`/results/${data.id}`, { state: { recommendations: data.gifts, answers } });
    },
    onError: (error) => console.error('Quiz submission failed:', error),
  });

  const handleNextStep = (stepData) => { setAnswers((prev) => ({ ...prev, ...stepData })); setStep((prev) => Math.min(prev + 1, 4)); };
  const handlePrevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  const handleSubmit = (finalAnswers) => mutation.mutate({ ...answers, ...finalAnswers });

  const steps = [
    { number: 1, title: 'Основная информация', component: QuizForm.Step1 },
    { number: 2, title: 'Интересы', component: QuizForm.Step2 },
    { number: 3, title: 'Детали', component: QuizForm.Step3 },
    { number: 4, title: 'Результат', component: QuizForm.Step4 },
  ];
  const CurrentStepComponent = steps[step - 1].component;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Подбор идеального подарка</h1>
          <p className="opacity-90">Ответьте на несколько вопросов, и AI подберет персонализированные рекомендации</p>
        </div>
        <QuizProgress currentStep={step} totalSteps={4} />
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <CurrentStepComponent data={answers} onNext={handleNextStep} onPrev={handlePrevStep} onSubmit={handleSubmit} isLoading={mutation.isPending} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-between">
          {step > 1 && <button onClick={handlePrevStep} disabled={mutation.isPending} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"><ChevronLeft className="w-5 h-5" /><span>Назад</span></button>}
          {step < 4 && <button onClick={() => handleNextStep({})} disabled={mutation.isPending} className="ml-auto flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"><span>Далее</span><ChevronRight className="w-5 h-5" /></button>}
          {step === 4 && (
            <button onClick={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))} disabled={mutation.isPending} className="ml-auto flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50">
              {mutation.isPending ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Генерация...</span></> : <><span>Получить рекомендации</span><ChevronRight className="w-5 h-5" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;