import React, { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Store, Navigation, Filter, Star, Clock, Phone, Globe } from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const MarketplacePage = () => {
  const { coords, loading: geoLoading, error: geoError } = useGeolocation();
  const [radius, setRadius] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStore, setSelectedStore] = useState(null);

  const { data: stores, isLoading, refetch } = useQuery({
    queryKey: ['nearbyStores', coords?.latitude, coords?.longitude, radius],
    queryFn: () => api.getNearbyStores(coords.latitude, coords.longitude, radius),
    enabled: !!coords,
    staleTime: 5 * 60 * 1000,
  });

  const categories = [
    { id: 'all', name: 'Все', icon: Store },
    { id: 'electronics', name: 'Электроника', icon: null },
    { id: 'clothing', name: 'Одежда', icon: null },
    { id: 'books', name: 'Книги', icon: null },
    { id: 'toys', name: 'Игрушки', icon: null },
    { id: 'jewelry', name: 'Ювелирка', icon: null },
  ];

  useEffect(() => {
    if (coords) {
      refetch();
    }
  }, [coords, radius, refetch]);

  const getDistanceText = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} м`;
    }
    return `${distance.toFixed(1)} км`;
  };

  const getOpeningStatus = (store) => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();

    // Здесь должна быть логика проверки времени работы
    // Для примера просто возвращаем случайный статус
    const isOpen = store.isOpen !== undefined ? store.isOpen : Math.random() > 0.3;

    return {
      isOpen,
      text: isOpen ? 'Открыто' : 'Закрыто',
      className: isOpen ? 'text-green-600' : 'text-red-600',
    };
  };

  if (geoLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
        <p className="ml-3 text-gray-600">Определяем ваше местоположение...</p>
      </div>
    );
  }

  if (geoError) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Геолокация недоступна</h2>
        <p className="text-gray-600 mb-4">
          Пожалуйста, разрешите доступ к геолокации в настройках браузера
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">Магазины рядом с вами</h1>
        <p className="text-lg opacity-90">
          Найдите лучшие места для покупки подарков в вашем районе
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <MapPin className="text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Ваше местоположение</p>
              <p className="font-semibold">
                {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-gray-700">Радиус:</label>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={1}>1 км</option>
              <option value={3}>3 км</option>
              <option value={5}>5 км</option>
              <option value={10}>10 км</option>
              <option value={20}>20 км</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stores Grid */}
      {stores && stores.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Магазины не найдены</h3>
          <p className="text-gray-600">
            В выбранном радиусе не найдено магазинов. Попробуйте увеличить радиус поиска.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores?.map((store) => {
            const status = getOpeningStatus(store);
            return (
              <div
                key={store.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedStore(store)}
              >
                {store.image && (
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold">{store.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">{store.rating || 4.5}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{store.address}</p>

                  <div className="flex items-center space-x-4 mb-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <Navigation className="w-4 h-4 text-gray-500" />
                      <span>{getDistanceText(store.distance)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className={status.className}>{status.text}</span>
                    </div>
                  </div>

                  {store.products && store.products.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {store.products.slice(0, 3).map((product, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {product}
                        </span>
                      ))}
                      {store.products.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{store.products.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {store.phone && (
                      <a
                        href={`tel:${store.phone}`}
                        className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">Позвонить</span>
                      </a>
                    )}
                    {store.website && (
                      <a
                        href={store.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="w-4 h-4" />
                        <span className="text-sm">Сайт</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Store Details Modal */}
      {selectedStore && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedStore(null)}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedStore.name}</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Адрес</h3>
                  <p className="text-gray-600">{selectedStore.address}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Часы работы</h3>
                  <div className="space-y-1 text-gray-600">
                    {selectedStore.schedule?.map((day, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{day.day}</span>
                        <span>{day.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Товары в наличии</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStore.products?.map((product, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      window.open(
                        `https://maps.google.com/?q=${selectedStore.lat},${selectedStore.lng}`,
                        '_blank'
                      );
                    }}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Построить маршрут
                  </button>
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;