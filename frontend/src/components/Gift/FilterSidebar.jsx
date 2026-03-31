import React, { useState } from 'react';
import { Sliders, ChevronDown, ChevronUp, X } from 'lucide-react';

const FilterSidebar = ({ filters, onChange, totalResults }) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    categories: true,
    rating: true,
  });

  const categories = [
    { id: 'electronics', name: 'Электроника', count: 45 },
    { id: 'clothing', name: 'Одежда и обувь', count: 32 },
    { id: 'books', name: 'Книги', count: 28 },
    { id: 'toys', name: 'Игрушки', count: 24 },
    { id: 'jewelry', name: 'Украшения', count: 18 },
    { id: 'sports', name: 'Спорт', count: 22 },
    { id: 'beauty', name: 'Красота', count: 15 },
    { id: 'home', name: 'Для дома', count: 30 },
  ];

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceChange = (values) => {
    onChange({
      ...filters,
      priceRange: values,
    });
  };

  const handleCategoryToggle = (categoryId) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];

    onChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handleClearFilters = () => {
    onChange({
      priceRange: [0, 100000],
      categories: [],
      sortBy: 'relevance',
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 100000;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-lg">Фильтры</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Сбросить</span>
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full py-2 text-left font-semibold"
        >
          <span>Цена</span>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.price && (
          <div className="mt-4 space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500">От</label>
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    handlePriceChange([Number(e.target.value), filters.priceRange[1]])
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">До</label>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    handlePriceChange([filters.priceRange[0], Number(e.target.value)])
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="100000"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={filters.priceRange[1]}
              onChange={(e) =>
                handlePriceChange([filters.priceRange[0], Number(e.target.value)])
              }
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full py-2 text-left font-semibold"
        >
          <span>Категории</span>
          {expandedSections.categories ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.categories && (
          <div className="mt-4 space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="text-purple-600 focus:ring-purple-500 rounded"
                  />
                  <span className="text-sm">{category.name}</span>
                </div>
                <span className="text-xs text-gray-500">{category.count}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating */}
      <div>
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full py-2 text-left font-semibold"
        >
          <span>Рейтинг</span>
          {expandedSections.rating ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.rating && (
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={filters.rating === rating}
                  onChange={() => onChange({ ...filters, rating })}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">и выше</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm text-gray-600 text-center">
          Найдено <span className="font-semibold text-purple-600">{totalResults}</span>{' '}
          подарков
        </p>
      </div>
    </div>
  );
};

export default FilterSidebar;