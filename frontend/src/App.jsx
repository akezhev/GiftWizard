import React, { useState, useEffect } from 'react';
import { useGeolocated } from 'react-geolocated';
import QuizForm from './components/QuizForm';
import GiftResults from './components/GiftResults';
import MarketplaceList from './components/MarketplaceList';

function App() {
  const [quizAnswers, setQuizAnswers] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Хук для геолокации [citation:2]
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    },
    userDecisionTimeout: 5000,
    watchPosition: false,
  });

  // Обработка отправки теста
  const handleQuizSubmit = async (data) => {
    setLoading(true);
    setQuizAnswers(data);

    try {
      // 1. Получаем рекомендации от AI (через наш API)
      const aiResponse = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const aiData = await aiResponse.json();
      setGifts(aiData.gifts);

    } catch (error) {
      console.error('AI failed:', error);
      // Заглушка на случай ошибки AI
      setGifts([
        { name: 'Подарочная карта Amazon', reason: 'Универсальный выбор' },
        { name: 'Настольная игра', reason: 'Для компании' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Поиск рядом (сработает, когда получим координаты)
  useEffect(() => {
    if (coords && gifts.length > 0) {
      // Запрос на бэкенд с геоданными
      fetch(`/api/products/search?lat=${coords.latitude}&lon=${coords.longitude}&radius=5`)
        .then(res => res.json())
        .then(data => {
          // Здесь можно сохранить список магазинов
          console.log('Nearby shops:', data.nearby);
        });
    }
  }, [coords, gifts]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-white text-center mb-8">
          🎁 GiftWizard
        </h1>
        
        {!isGeolocationAvailable && (
          <div className="bg-yellow-100 p-4 rounded-lg mb-4">
            Ваш браузер не поддерживает геолокацию
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Форма теста */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Помогите нам выбрать подарок</h2>
            <QuizForm onSubmit={handleQuizSubmit} loading={loading} />
          </div>

          {/* Результаты */}
          <div className="space-y-4">
            {loading && (
              <div className="bg-white rounded-lg shadow-xl p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
                <p className="mt-4">AI колдует над подарками...</p>
              </div>
            )}

            {!loading && gifts.length > 0 && (
              <>
                <GiftResults gifts={gifts} />
                {/* Геолокация включена, показываем карту */}
                {coords && (
                  <MarketplaceList 
                    lat={coords.latitude} 
                    lon={coords.longitude} 
                    gifts={gifts} 
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;