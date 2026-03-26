import React, { useState } from 'react';

// Step 1: Основная информация
const Step1 = ({ data, onNext, onPrev }) => {
  const [localData, setLocalData] = useState({
    age: data.age || '',
    gender: data.gender || '',
    relationship: data.relationship || '',
  });

  const isValid = localData.age && localData.gender && localData.relationship;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onNext(localData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Сколько лет человеку? *
        </label>
        <input
          type="number"
          value={localData.age}
          onChange={(e) => setLocalData({ ...localData, age: e.target.value })}
          min="1"
          max="120"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Например: 25"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Пол *
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="male"
              checked={localData.gender === 'male'}
              onChange={(e) => setLocalData({ ...localData, gender: e.target.value })}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span>Мужской</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="female"
              checked={localData.gender === 'female'}
              onChange={(e) => setLocalData({ ...localData, gender: e.target.value })}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span>Женский</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Кем приходится человек? *
        </label>
        <select
          value={localData.relationship}
          onChange={(e) => setLocalData({ ...localData, relationship: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Выберите</option>
          <option value="partner">Партнер/Партнерша</option>
          <option value="parent">Родитель</option>
          <option value="child">Ребенок</option>
          <option value="friend">Друг/Подруга</option>
          <option value="colleague">Коллега</option>
          <option value="other">Другое</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Далее
      </button>
    </form>
  );
};

// Step 2: Интересы и хобби
const Step2 = ({ data, onNext, onPrev }) => {
  const [localData, setLocalData] = useState({
    hobby: data.hobby || '',
    interests: data.interests || [],
  });

  const hobbies = [
    'Спорт',
    'Музыка',
    'Книги',
    'Кулинария',
    'Путешествия',
    'Технологии',
    'Мода',
    'Игры',
    'Авто',
    'Рыбалка',
    'Фотография',
    'Рисование',
    'Танцы',
    'Йога',
    'Садоводство',
  ];

  const toggleInterest = (interest) => {
    setLocalData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const isValid = localData.hobby && localData.interests.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onNext(localData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Основное хобби *
        </label>
        <select
          value={localData.hobby}
          onChange={(e) => setLocalData({ ...localData, hobby: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Выберите хобби</option>
          {hobbies.map((hobby) => (
            <option key={hobby} value={hobby}>
              {hobby}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Дополнительные интересы *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {hobbies.map((interest) => (
            <label key={interest} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localData.interests.includes(interest)}
                onChange={() => toggleInterest(interest)}
                className="text-purple-600 focus:ring-purple-500 rounded"
              />
              <span className="text-sm">{interest}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Назад
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          Далее
        </button>
      </div>
    </form>
  );
};

// Step 3: Детали и предпочтения
const Step3 = ({ data, onNext, onPrev }) => {
  const [localData, setLocalData] = useState({
    zodiac: data.zodiac || '',
    occasion: data.occasion || '',
    budget: data.budget || '',
    personality: data.personality || '',
  });

  const zodiacs = [
    'Овен',
    'Телец',
    'Близнецы',
    'Рак',
    'Лев',
    'Дева',
    'Весы',
    'Скорпион',
    'Стрелец',
    'Козерог',
    'Водолей',
    'Рыбы',
  ];

  const occasions = [
    'День рождения',
    'Новый год',
    '8 Марта',
    '23 Февраля',
    'Свадьба',
    'Юбилей',
    'Без повода',
    'Другое',
  ];

  const budgets = [
    'До 1000 ₽',
    '1000-3000 ₽',
    '3000-5000 ₽',
    '5000-10000 ₽',
    '10000-20000 ₽',
    '20000+ ₽',
  ];

  const personalities = [
    'Экстраверт',
    'Интроверт',
    'Романтик',
    'Прагматик',
    'Креативный',
    'Спокойный',
    'Активный',
  ];

  const isValid =
    localData.zodiac && localData.occasion && localData.budget && localData.personality;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onNext(localData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Знак зодиака *
        </label>
        <select
          value={localData.zodiac}
          onChange={(e) => setLocalData({ ...localData, zodiac: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Выберите знак зодиака</option>
          {zodiacs.map((zodiac) => (
            <option key={zodiac} value={zodiac}>
              {zodiac}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Повод *
        </label>
        <select
          value={localData.occasion}
          onChange={(e) => setLocalData({ ...localData, occasion: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Выберите повод</option>
          {occasions.map((occasion) => (
            <option key={occasion} value={occasion}>
              {occasion}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Бюджет *
        </label>
        <select
          value={localData.budget}
          onChange={(e) => setLocalData({ ...localData, budget: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Выберите бюджет</option>
          {budgets.map((budget) => (
            <option key={budget} value={budget}>
              {budget}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Тип личности *
        </label>
        <select
          value={localData.personality}
          onChange={(e) => setLocalData({ ...localData, personality: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Выберите тип личности</option>
          {personalities.map((personality) => (
            <option key={personality} value={personality}>
              {personality}
            </option>
          ))}
        </select>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Назад
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          Далее
        </button>
      </div>
    </form>
  );
};

// Step 4: Проверка и отправка
const Step4 = ({ data, onSubmit, isLoading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg mb-4">Проверьте введенные данные:</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Возраст:</p>
            <p className="font-medium">{data.age} лет</p>
          </div>
          <div>
            <p className="text-gray-600">Пол:</p>
            <p className="font-medium">{data.gender === 'male' ? 'Мужской' : 'Женский'}</p>
          </div>
          <div>
            <p className="text-gray-600">Хобби:</p>
            <p className="font-medium">{data.hobby}</p>
          </div>
          <div>
            <p className="text-gray-600">Знак зодиака:</p>
            <p className="font-medium">{data.zodiac}</p>
          </div>
          <div>
            <p className="text-gray-600">Повод:</p>
            <p className="font-medium">{data.occasion}</p>
          </div>
          <div>
            <p className="text-gray-600">Бюджет:</p>
            <p className="font-medium">{data.budget}</p>
          </div>
        </div>

        <div>
          <p className="text-gray-600 mb-2">Интересы:</p>
          <div className="flex flex-wrap gap-2">
            {data.interests?.map((interest) => (
              <span key={interest} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isLoading ? 'Генерация рекомендаций...' : 'Получить рекомендации'}
      </button>
    </form>
  );
};

const QuizForm = {
  Step1,
  Step2,
  Step3,
  Step4,
};

export default QuizForm;