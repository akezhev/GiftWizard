import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, MapPin, ExternalLink } from 'lucide-react';

const GiftCard = ({ gift, showActions = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const getPriceRange = (price) => {
    if (typeof price === 'string') return price;
    if (price < 1000) return `до ${price} ₽`;
    if (price < 5000) return `${Math.floor(price / 1000)}-5 тыс. ₽`;
    if (price < 20000) return `${Math.floor(price / 1000)}-20 тыс. ₽`;
    return `от ${Math.floor(price / 1000)} тыс. ₽`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        {!imageError && gift.image ? (
          <img
            src={gift.image}
            alt={gift.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
            <span className="text-4xl">🎁</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex space-x-2">
          {gift.isPopular && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              Популярное
            </span>
          )}
          {gift.discount && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{gift.discount}%
            </span>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">{gift.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-semibold">{gift.rating || 4.5}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{gift.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {gift.tags?.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-purple-600">
              {getPriceRange(gift.price)}
            </span>
            {gift.oldPrice && (
              <span className="ml-2 text-sm text-gray-400 line-through">
                {gift.oldPrice} ₽
              </span>
            )}
          </div>
          {gift.available && (
            <span className="text-xs text-green-600 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              В наличии
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center space-x-1 transition-colors">
              <ShoppingCart className="w-4 h-4" />
              <span>Купить</span>
            </button>
            <button className="flex-1 border border-gray-300 hover:border-purple-600 text-gray-600 hover:text-purple-600 px-3 py-2 rounded-lg text-sm flex items-center justify-center space-x-1 transition-colors">
              <MapPin className="w-4 h-4" />
              <span>Рядом</span>
            </button>
          </div>
        )}

        {/* Marketplace Links */}
        {gift.marketplaces && gift.marketplaces.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 mb-2">Где купить:</p>
            <div className="flex space-x-2">
              {gift.marketplaces.map((marketplace) => (
                <a
                  key={marketplace.name}
                  href={marketplace.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>{marketplace.name}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCard;