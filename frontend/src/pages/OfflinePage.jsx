import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getQuizResults } from '../utils/indexedDB';

const OfflinePage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [savedResults, setSavedResults] = useState([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    loadSavedResults();
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const loadSavedResults = async () => {
    const results = await getQuizResults();
    setSavedResults(results);
  };

  if (isOnline) { window.location.href = '/'; return null; }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"><WifiOff className="w-12 h-12 text-gray-500" /></div>
        <h1 className="text-2xl font-bold mb-2">Вы оффлайн</h1>
        <p className="text-gray-600 mb-6">Похоже, у вас нет подключения к интернету. Но не волнуйтесь, вы все еще можете просмотреть сохраненные рекомендации!</p>
        <div className="space-y-4">
          <button onClick={() => window.location.reload()} className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"><RefreshCw className="w-5 h-5" /><span>Проверить соединение</span></button>
          <Link to="/" className="w-full block bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200">Вернуться на главную</Link>
        </div>
        {savedResults.length > 0 && (
          <div className="mt-8 pt-6 border-t"><h2 className="font-semibold mb-4 flex items-center justify-center space-x-2"><Gift className="w-5 h-5" /><span>Сохраненные рекомендации</span></h2>
            <div className="space-y-2">{savedResults.map((result) => <Link key={result.id} to={`/results/${result.id}`} className="block text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100"><p className="font-medium">{new Date(result.timestamp).toLocaleDateString()}</p><p className="text-sm text-gray-600">{result.answers.age} лет, {result.answers.gender === 'male' ? 'мужчина' : 'женщина'}</p></Link>)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflinePage;