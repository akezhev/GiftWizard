import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

const UpdateNotification = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-purple-200 p-4 max-w-sm z-50 animate-slideUp">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">Доступно обновление</h4>
          <p className="text-sm text-gray-600 mb-3">
            Новая версия приложения готова к установке
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleUpdate}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Обновить
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-3 py-1 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Позже
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;