const DB_NAME = 'GiftWizardDB';
const DB_VERSION = 1;

export const openDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onerror = () => reject(request.error);
  request.onsuccess = () => resolve(request.result);
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('quiz-results')) db.createObjectStore('quiz-results', { keyPath: 'id' }).createIndex('timestamp', 'timestamp');
    if (!db.objectStoreNames.contains('pending-sync')) db.createObjectStore('pending-sync', { keyPath: 'id', autoIncrement: true }).createIndex('timestamp', 'timestamp');
    if (!db.objectStoreNames.contains('favorites')) db.createObjectStore('favorites', { keyPath: 'id' });
  };
});

export const saveQuizResult = async (result) => { const db = await openDB(); const tx = db.transaction(['quiz-results'], 'readwrite'); tx.objectStore('quiz-results').put({ ...result, timestamp: Date.now() }); return tx.complete; };
export const getQuizResults = async () => { const db = await openDB(); const tx = db.transaction(['quiz-results'], 'readonly'); return tx.objectStore('quiz-results').getAll(); };
export const savePendingSync = async (data, type) => { const db = await openDB(); const tx = db.transaction(['pending-sync'], 'readwrite'); tx.objectStore('pending-sync').add({ data, type, timestamp: Date.now() }); return tx.complete; };