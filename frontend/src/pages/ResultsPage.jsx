import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, Heart, MapPin, Filter, ArrowLeft } from 'lucide-react';
import GiftCard from '../components/Gift/GiftCard';
import FilterSidebar from '../components/Gift/FilterSidebar';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { shareResults } from '../utils/share';

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ priceRange: [0, 100000], categories: [], sortBy: 'relevance' });
  const [filteredGifts, setFilteredGifts] = useState([]);
  const [showMarketplaces, setShowMarketplaces] = useState(false);

  const { recommendations, answers } = location.state || {};

  useEffect(() => {
    if (recommendations) applyFilters();
  }, [recommendations, filters]);

  const applyFilters = () => {
    let filtered = [...recommendations];
    filtered = filtered.filter(g => g.price >= filters.priceRange[0] && g.price <= filters.priceRange[1]);
    if (filters.categories.length > 0) filtered = filtered.filter(g => filters.categories.includes(g.category));
    switch (filters.sortBy) {
      case 'price_asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
    }
    setFilteredGifts(filtered);
  };

  const handleShare = () => shareResults({ title: 'Мои рекомендации подарков от GiftWizard', text: `Я нашел идеальные подарки для ${answers?.age}-летнего ${answers?.gender === 'male' ? 'мужчины' : 'женщины'} с помощью AI!`, url: window.location.href });
  const handleSave = () => { localStorage.setItem('savedRecommendations', JSON.stringify(recommendations)); alert('Рекомендации сохранены!'); };

  if (!recommendations) return <div className="text-center py-12"><h2 className="text-2xl font-bold mb-4">Результаты не найдены</h2><button onClick={() => navigate('/quiz')} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">Пройти тест заново</button></div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <button onClick={() => navigate('/quiz')} className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-4"><ArrowLeft className="w-5 h-5" /><span>Вернуться к тесту</span></button>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Ваши персональные рекомендации</h1>
          <p className="text-lg opacity-90 mb-6">На основе ваших ответов AI подобрал лучшие варианты подарков</p>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleShare} className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"><Share2 className="w-5 h-5" /><span>Поделиться</span></button>
            <button onClick={handleSave} className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"><Heart className="w-5 h-5" /><span>Сохранить</span></button>
            <button onClick={() => setShowMarketplaces(!showMarketplaces)} className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"><MapPin className="w-5 h-5" /><span>{showMarketplaces ? 'Скрыть магазины' : 'Где купить рядом?'}</span></button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4"><FilterSidebar filters={filters} onChange={setFilters} totalResults={filteredGifts.length} /></div>
        <div className="lg:w-3/4">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">Найдено <span className="font-semibold">{filteredGifts.length}</span> подарков</p>
            <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="relevance">По релевантности</option><option value="price_asc">По возрастанию цены</option><option value="price_desc">По убыванию цены</option><option value="rating">По рейтингу</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGifts.map((gift, index) => <motion.div key={gift.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}><GiftCard gift={gift} showActions /></motion.div>)}
          </div>
          {filteredGifts.length === 0 && <div className="text-center py-12 bg-gray-50 rounded-lg"><p className="text-gray-600 mb-4">Нет подарков, соответствующих фильтрам</p><button onClick={() => setFilters({ priceRange: [0, 100000], categories: [], sortBy: 'relevance' })} className="text-purple-600 hover:text-purple-700 font-semibold">Сбросить фильтры</button></div>}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;