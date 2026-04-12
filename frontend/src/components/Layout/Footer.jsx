import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-pink-500" />
              <span className="text-xl font-bold">GiftWizard</span>
            </div>
            <p className="text-gray-400 text-sm">
              Умный помощник для выбора идеальных подарков с использованием искусственного интеллекта.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="mailto:support@giftwizard.com" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/quiz" className="hover:text-white transition-colors">Подобрать подарок</Link></li>
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Магазины рядом</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">О проекте</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Блог</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center space-x-2"><MapPin className="w-4 h-4" /><span>Москва, Россия</span></li>
              <li className="flex items-center space-x-2"><Phone className="w-4 h-4" /><span>+7 (495) 123-45-67</span></li>
              <li className="flex items-center space-x-2"><Mail className="w-4 h-4" /><a href="mailto:support@giftwizard.com" className="hover:text-white">support@giftwizard.com</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Подписка на новости</h3>
            <p className="text-sm text-gray-400 mb-4">Получайте лучшие идеи подарков первыми!</p>
            <form className="space-y-2">
              <input type="email" placeholder="Ваш email" className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">Подписаться</button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {currentYear} GiftWizard. Все права защищены.</p>
          <p className="mt-2">
            <Link to="/privacy" className="hover:text-white transition-colors">Политика конфиденциальности</Link>
            {' | '}
            <Link to="/terms" className="hover:text-white transition-colors">Условия использования</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;