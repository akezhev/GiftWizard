import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Gift, MapPin, User } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Главная', icon: null },
    { path: '/quiz', label: 'Подобрать подарок', icon: Gift },
    { path: '/marketplace', label: 'Где купить', icon: MapPin },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-gradient-to-r from-purple-600 to-pink-600'
      }`}
    >
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold transition-transform hover:scale-105"
          >
            <Gift
              className={`w-8 h-8 ${isScrolled ? 'text-purple-600' : 'text-white'}`}
            />
            <span className={isScrolled ? 'text-gray-800' : 'text-white'}>
              GiftWizard
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  isActive(path)
                    ? isScrolled
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-white/20 text-white'
                    : isScrolled
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              className={`p-2 rounded-full transition-colors ${
                isScrolled
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'hover:bg-white/10 text-white'
              }`}
              aria-label="Профиль"
            >
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Меню"
          >
            {isMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 animate-slideDown">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(path)
                    ? 'bg-purple-100 text-purple-700'
                    : isScrolled
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/10'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span>{label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;