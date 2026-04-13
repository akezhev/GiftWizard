import { useCallback } from 'react';

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName, eventParams = {}) => { if (typeof window.gtag !== 'undefined') window.gtag('event', eventName, eventParams); }, []);
  const trackPageView = useCallback((pagePath) => { if (typeof window.gtag !== 'undefined') window.gtag('config', 'G-XXXXXXXXXX', { page_path: pagePath }); }, []);
  const trackQuizStart = useCallback((answers) => trackEvent('quiz_start', { age: answers.age, gender: answers.gender }), [trackEvent]);
  const trackQuizComplete = useCallback((answers, count) => trackEvent('quiz_complete', { age: answers.age, gender: answers.gender, recommendations_count: count }), [trackEvent]);
  const trackGiftClick = useCallback((id, name, source) => trackEvent('gift_click', { gift_id: id, gift_name: name, source }), [trackEvent]);
  return { trackEvent, trackPageView, trackQuizStart, trackQuizComplete, trackGiftClick };
};