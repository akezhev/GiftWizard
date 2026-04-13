export const showNotification = (title, body, type = 'info') => {
    if (!('Notification' in window)) { console.warn('Notifications not supported'); return; }
    if (Notification.permission === 'granted') new Notification(title, { body, icon: '/icon-192.png', badge: '/favicon-32x32.png', vibrate: [200, 100, 200] });
    else if (Notification.permission !== 'denied') Notification.requestPermission().then((permission) => { if (permission === 'granted') new Notification(title, { body, icon: '/icon-192.png' }); });
    const toastEvent = new CustomEvent('show-toast', { detail: { message: body, type } });
    window.dispatchEvent(toastEvent);
  };
  export const requestNotificationPermission = async () => { if (!('Notification' in window)) return false; const permission = await Notification.requestPermission(); return permission === 'granted'; };