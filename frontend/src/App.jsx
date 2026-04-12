import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/UI/LoadingSpinner';

const HomePage = lazy(() => import('./pages/HomePage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const OfflinePage = lazy(() => import('./pages/OfflinePage'));

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/offline" element={<OfflinePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;