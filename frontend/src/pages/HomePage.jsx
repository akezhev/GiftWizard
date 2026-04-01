import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, TrendingUp, MapPin, Star, ArrowRight } from 'lucide-react';
import QuizPreview from '../components/Quiz/QuizPreview';
import GiftCard from '../components/Gift/GiftCard';
import { api } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const HomePage = () => {
  const { data: popularGifts, isLoading, error } = useQuery({
    queryKey: ['popularGifts'],
    queryFn: () => api.getPopularGifts(),
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: 'AI-помощник',
      description: 'Искусственный интеллект анализирует интересы и подбирает идеальный подарок',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Тренды 2026',
      description: 'Актуальные идеи подарков на основе анализа миллионов покупок',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MapPin,
      title: 'Геолокация',
      description: 'Находите магазины с подарками рядом с вашим домом',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Star,
      title: 'Рейтинги',
      description: 'Честные отзывы и рейтинги от реальных покупателей',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-6 py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Найдите идеальный подарок
            <span className="block text-2xl md:text-3xl mt-2">
              с помощью искусственного интеллекта
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90"
          >
            Ответьте на несколько вопросов, и AI подберет персонализированные
            рекомендации, учитывая возраст, интересы и даже знак зодиака
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              to="/quiz"
              className="inline-flex items-center space-x-2 bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <span>Начать тест</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        {/* Animated background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Почему GiftWizard?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quiz Preview */}
      <QuizPreview />

      {/* Popular Gifts */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Популярные подарки
          </h2>
          <Link
            to="/quiz"
            className="text-purple-600 hover:text-purple-700 font-semibold flex items-center space-x-1"
          >
            <span>Все подарки</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center text-red-600 py-12">
            Не удалось загрузить популярные подарки. Попробуйте позже.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularGifts?.slice(0, 4).map((gift) => (
              <GiftCard key={gift.id} gift={gift} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Готовы найти идеальный подарок?</h2>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          Пройдите бесплатный тест и получите персонализированные рекомендации
          уже через 2 минуты
        </p>
        <Link
          to="/quiz"
          className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
        >
          <span>Пройти тест</span>
          <Sparkles className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
};

export default HomePage;