import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CookieConsent from '../UI/CookieConsent';
import UpdateNotification from '../UI/UpdateNotification';

const Layout = ({ children }) => {
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Проверяем согласие на cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowCookieConsent(true);
    }

    // Слушаем обновления Service Worker
    const handleUpdateAvailable = () => setShowUpdate(true);
    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowCookieConsent(false);
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookieConsent', 'false');
    setShowCookieConsent(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
      {showCookieConsent && (
        <CookieConsent
          onAccept={handleAcceptCookies}
          onDecline={handleDeclineCookies}
        />
      )}
      {showUpdate && <UpdateNotification />}
    </div>
  );
};

export default Layout;