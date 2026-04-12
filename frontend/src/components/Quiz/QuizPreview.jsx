import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const QuizPreview = () => {
  const benefits = ['Персонализированные рекомендации', 'Учет возраста и интересов', 'Анализ знака зодиака', 'Бюджетные варианты', 'Ссылки на маркетплейсы', 'Геолокация магазинов'];
  return (
    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1"><div className="flex items-center space-x-2 mb-4"><Sparkles className="w-6 h-6 text-purple-600" /><h2 className="text-2xl font-bold">Как это работает?</h2></div><p className="text-gray-700 mb-6">Наш AI-помощник проанализирует ответы и подберет идеальный подарок, учитывая все важные детали</p><div className="grid grid-cols-2 gap-3 mb-6">{benefits.map((benefit, i) => (<div key={i} className="flex items-center space-x-2 text-sm"><div className="w-1.5 h-1.5 bg-purple-600 rounded-full" /><span>{benefit}</span></div>))}</div><Link to="/quiz" className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"><span>Пройти тест</span><ArrowRight className="w-4 h-4" /></Link></div>
        <div className="flex-1 grid grid-cols-2 gap-4"><div className="bg-white rounded-xl p-4 text-center"><div className="text-3xl font-bold text-purple-600">10k+</div><div className="text-sm text-gray-600">подобранных подарков</div></div><div className="bg-white rounded-xl p-4 text-center"><div className="text-3xl font-bold text-purple-600">98%</div><div className="text-sm text-gray-600">довольных пользователей</div></div><div className="bg-white rounded-xl p-4 text-center"><div className="text-3xl font-bold text-purple-600">5 мин</div><div className="text-sm text-gray-600">среднее время подбора</div></div><div className="bg-white rounded-xl p-4 text-center"><div className="text-3xl font-bold text-purple-600">50+</div><div className="text-sm text-gray-600">категорий подарков</div></div></div>
      </div>
    </div>
  );
};

export default QuizPreview;