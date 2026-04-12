import React, { useState } from 'react';
import { useGeolocated } from 'react-geolocated';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Store, Navigation, Star, Clock, Phone, Globe } from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const MarketplacePage = () => {
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({ positionOptions: { enableHighAccuracy: true }, userDecisionTimeout: 5000 });
  const [radius, setRadius] = useState(5);
  const [selectedStore, setSelectedStore] = useState(null);

  const { data: stores, isLoading, refetch } = useQuery({
    queryKey: ['nearbyStores', coords?.latitude, coords?.longitude, radius],
    queryFn: () => api.getNearbyStores(coords.latitude, coords.longitude, radius),
    enabled: !!coords,
    staleTime: 5 * 60 * 1000,
  });

  const getDistanceText = (distance) => distance < 1 ? `${Math.round(distance * 1000)} м` : `${distance.toFixed(1)} км`;
  const getOpeningStatus = () => ({ isOpen: Math.random() > 0.3, text: Math.random() > 0.3 ? 'Открыто' : 'Закрыто', className: Math.random() > 0.3 ? 'text-green-600' : 'text-red-600' });

  if (!isGeolocationAvailable) return <div className="text-center py-12"><MapPin className="w-16 h-16 text-red-500 mx-auto mb-4" /><h2 className="text-2xl font-bold mb-2">Геолокация не поддерживается</h2><p className="text-gray-600">Ваш браузер не поддерживает геолокацию</p></div>;
  if (!isGeolocationEnabled) return <div className="text-center py-12"><MapPin className="w-16 h-16 text-yellow-500 mx-auto mb-4" /><h2 className="text-2xl font-bold mb-2">Геолокация отключена</h2><p className="text-gray-600 mb-4">Пожалуйста, разрешите доступ к геолокации</p><button onClick={() => window.location.reload()} className="bg-purple-600 text-white px-6 py-3 rounded-lg">Попробовать снова</button></div>;
  if (isLoading || !coords) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8"><h1 className="text-3xl font-bold mb-2">Магазины рядом с вами</h1><p className="text-lg opacity-90">Найдите лучшие места для покупки подарков в вашем районе</p></div>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4"><MapPin className="text-purple-600" /><div><p className="text-sm text-gray-600">Ваше местоположение</p><p className="font-semibold">{coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}</p></div></div>
          <div className="flex items-center space-x-4"><label className="text-gray-700">Радиус:</label><select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="px-3 py-2 border rounded-lg"><option value={1}>1 км</option><option value={3}>3 км</option><option value={5}>5 км</option><option value={10}>10 км</option><option value={20}>20 км</option></select></div>
        </div>
      </div>

      {stores?.length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-lg"><Store className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Магазины не найдены</h3><p className="text-gray-600">В выбранном радиусе не найдено магазинов. Попробуйте увеличить радиус поиска.</p></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores?.map((store) => {
            const status = getOpeningStatus();
            return (
              <div key={store.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setSelectedStore(store)}>
                {store.image && <img src={store.image} alt={store.name} className="w-full h-48 object-cover" />}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2"><h3 className="text-xl font-semibold">{store.name}</h3><div className="flex items-center space-x-1"><Star className="w-4 h-4 text-yellow-500 fill-current" /><span className="text-sm font-semibold">{store.rating || 4.5}</span></div></div>
                  <p className="text-gray-600 text-sm mb-3">{store.address}</p>
                  <div className="flex items-center space-x-4 mb-3 text-sm"><div className="flex items-center space-x-1"><Navigation className="w-4 h-4 text-gray-500" /><span>{getDistanceText(store.distance)}</span></div><div className="flex items-center space-x-1"><Clock className="w-4 h-4 text-gray-500" /><span className={status.className}>{status.text}</span></div></div>
                  {store.products && <div className="flex flex-wrap gap-2 mb-4">{store.products.slice(0, 3).map((product, idx) => <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{product}</span>)}</div>}
                  <div className="flex space-x-2">
                    {store.phone && <a href={`tel:${store.phone}`} className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg" onClick={(e) => e.stopPropagation()}><Phone className="w-4 h-4" /><span className="text-sm">Позвонить</span></a>}
                    {store.website && <a href={store.website} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg" onClick={(e) => e.stopPropagation()}><Globe className="w-4 h-4" /><span className="text-sm">Сайт</span></a>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStore(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6"><h2 className="text-2xl font-bold mb-4">{selectedStore.name}</h2><div className="space-y-4"><div><h3 className="font-semibold mb-2">Адрес</h3><p className="text-gray-600">{selectedStore.address}</p></div><div><h3 className="font-semibold mb-2">Товары в наличии</h3><div className="flex flex-wrap gap-2">{selectedStore.products?.map((product, idx) => <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{product}</span>)}</div></div><div className="flex space-x-3 pt-4"><button onClick={() => window.open(`https://maps.google.com/?q=${selectedStore.lat},${selectedStore.lng}`, '_blank')} className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg">Построить маршрут</button><button onClick={() => setSelectedStore(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">Закрыть</button></div></div></div></div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;