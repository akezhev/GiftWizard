import React, { useState } from 'react';
import { MapPin, Navigation, Star, ExternalLink, Clock, Phone } from 'lucide-react';

const MarketplaceList = ({ offers, lat, lon }) => {
  const [selectedOffer, setSelectedOffer] = useState(null);

  const getDistanceText = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} м`;
    }
    return `${distance.toFixed(1)} км`;
  };

  const getOpeningStatus = (hours) => {
    if (!hours) return { text: 'Время работы не указано', className: 'text-gray-500' };

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour + minute / 60;

    // Простая проверка (в реальном приложении нужна более сложная логика)
    const isOpen = Math.random() > 0.3;

    return {
      isOpen,
      text: isOpen ? 'Открыто' : 'Закрыто',
      className: isOpen ? 'text-green-600' : 'text-red-600',
    };
  };

  if (!offers || offers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Нет предложений рядом</h3>
        <p className="text-gray-600">
          Попробуйте изменить радиус поиска или проверьте другие подарки
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">
          Где купить рядом с вами
        </h2>
        <p className="text-white/80 text-sm mt-1">
          Найдено {offers.length} предложений в магазинах поблизости
        </p>
      </div>

      <div className="divide-y">
        {offers.map((offer) => {
          const status = getOpeningStatus(offer.hours);
          return (
            <div
              key={offer.id}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setSelectedOffer(offer)}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Store Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{offer.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{offer.rating || 4.5}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center space-x-1">
                          <Navigation className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {getDistanceText(offer.distance)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${status.className}`}>
                      {status.text}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{offer.address}</p>

                  {/* Products */}
                  {offer.products && offer.products.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {offer.products.slice(0, 3).map((product, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          {product}
                        </span>
                      ))}
                      {offer.products.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{offer.products.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Gift Card Preview */}
                  {offer.gift && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <p className="text-xs text-gray-500 mb-1">Актуальное предложение:</p>
                      <div className="flex items-center space-x-3">
                        {offer.gift.image && (
                          <img
                            src={offer.gift.image}
                            alt={offer.gift.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{offer.gift.name}</p>
                          <p className="text-purple-600 font-semibold text-sm">
                            {offer.gift.price} ₽
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://maps.google.com/?q=${offer.lat},${offer.lng}`,
                        '_blank'
                      );
                    }}
                    className="flex-1 md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Маршрут</span>
                  </button>
                  {offer.phone && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${offer.phone}`;
                      }}
                      className="flex-1 md:w-auto border border-gray-300 hover:border-purple-600 text-gray-600 hover:text-purple-600 px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Позвонить</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal with detailed store info */}
      {selectedOffer && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOffer(null)}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedOffer.name}</h2>
                <button
                  onClick={() => setSelectedOffer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Адрес</h3>
                  <p className="text-gray-600">{selectedOffer.address}</p>
                </div>

                {selectedOffer.phone && (
                  <div>
                    <h3 className="font-semibold mb-2">Телефон</h3>
                    <a
                      href={`tel:${selectedOffer.phone}`}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      {selectedOffer.phone}
                    </a>
                  </div>
                )}

                {selectedOffer.hours && (
                  <div>
                    <h3 className="font-semibold mb-2">Часы работы</h3>
                    <div className="space-y-1">
                      {Object.entries(selectedOffer.hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="text-gray-600">{day}</span>
                          <span>{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOffer.products && (
                  <div>
                    <h3 className="font-semibold mb-2">Товары в наличии</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedOffer.products.map((product, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      window.open(
                        `https://maps.google.com/?q=${selectedOffer.lat},${selectedOffer.lng}`,
                        '_blank'
                      );
                    }}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Построить маршрут
                  </button>
                  <button
                    onClick={() => setSelectedOffer(null)}
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

export default MarketplaceList;