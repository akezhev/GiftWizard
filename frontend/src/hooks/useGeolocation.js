import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation not supported'));
      setLoading(false);
      return;
    }
    const success = (position) => { setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }); setLoading(false); };
    const errorHandler = (err) => { setError(err); setLoading(false); };
    const watchId = navigator.geolocation.watchPosition(success, errorHandler, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [options]);
  return { coords, loading, error };
};