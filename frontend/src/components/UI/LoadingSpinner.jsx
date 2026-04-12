import React from 'react';

const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = { sm: 'w-6 h-6', md: 'w-12 h-12', lg: 'w-16 h-16' };
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin`} />
      <p className="mt-4 text-gray-600">Загрузка...</p>
    </div>
  );

  if (fullScreen) {
    return <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">{spinner}</div>;
  }
  return spinner;
};

export default LoadingSpinner;