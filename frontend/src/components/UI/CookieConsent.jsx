import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

const CookieConsent = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent) setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 animate-slide-up">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <Cookie className="w-6 h-6 flex-shrink-0 mt-1" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Мы используем cookies</p>
            <p className="text-gray-300">Мы используем файлы cookie для улучшения работы сайта, анализа трафика и персонализации контента.</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => { onDecline(); setIsVisible(false); }} className="px-4 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors">Отклонить</button>
          <button onClick={() => { onAccept(); setIsVisible(false); }} className="px-4 py-2 text-sm bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">Принять</button>
        </div>
        <button onClick={() => setIsVisible(false)} className="absolute top-4 right-4 md:relative md:top-auto md:right-auto text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
    </div>
  );
};

export default CookieConsent;