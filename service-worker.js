// اسم ذاكرة التخزين المؤقت للإصدار الحالي
const CACHE_NAME = 'currency-converter-v1';

// قائمة بالموارد التي يجب تخزينها مؤقتًا للعمل دون اتصال بالإنترنت
const urlsToCache = [
  '/', 
  '/index.html', /* تم التحديث هنا */
  '/style.css', 
  '/script.js', 
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap', 
  '/icons/icon-192x192.png', 
  '/icons/icon-512x512.png'
];

// حدث التثبيت: يتم تشغيله عند تثبيت Service Worker لأول مرة
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME) 
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache); 
      })
      .catch(error => {
        console.error('[Service Worker] Cache addAll failed:', error);
      })
  );
});

// حدث الجلب: يتم تشغيله عند جلب أي مورد من الشبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request) 
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(error => {
        console.error('[Service Worker] Fetch failed:', error);
      })
  );
});

// حدث التفعيل: يتم تشغيله عند تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
