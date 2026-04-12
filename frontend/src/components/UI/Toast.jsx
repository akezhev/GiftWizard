import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
  const colors = { success: 'bg-green-500', error: 'bg-red-500', warning: 'bg-yellow-500', info: 'bg-blue-500' };
  const Icon = icons[type] || Info;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`${colors[type]} text-white rounded-lg shadow-lg p-4 max-w-sm flex items-start space-x-3`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="flex-1 text-sm">{message}</p>
        <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

export default Toast;