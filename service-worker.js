// اسم ذاكرة التخزين المؤقت للإصدار الحالي
const CACHE_NAME = 'currency-converter-v1';

// قائمة بالموارد التي يجب تخزينها مؤقتًا للعمل دون اتصال بالإنترنت
const urlsToCache = [
  '/', // الصفحة الرئيسية
  '/currency-converter.html', // ملف HTML الرئيسي
  '/style.css', // ملف CSS
  '/script.js', // ملف JavaScript
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap', // خطوط Google Fonts
  '/icons/icon-192x192.png', // أيقونات التطبيق
  '/icons/icon-512x512.png'
];

// حدث التثبيت: يتم تشغيله عند تثبيت Service Worker لأول مرة
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME) // افتح ذاكرة التخزين المؤقت
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache); // أضف جميع الموارد إلى ذاكرة التخزين المؤقت
      })
      .catch(error => {
        console.error('[Service Worker] Cache addAll failed:', error);
      })
  );
});

// حدث الجلب: يتم تشغيله عند جلب أي مورد من الشبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request) // حاول مطابقة الطلب مع مورد في ذاكرة التخزين المؤقت
      .then(response => {
        // إذا تم العثور على استجابة في ذاكرة التخزين المؤقت، أعدها
        if (response) {
          return response;
        }
        // وإلا، قم بجلب الطلب من الشبكة
        return fetch(event.request);
      })
      .catch(error => {
        console.error('[Service Worker] Fetch failed:', error);
        // يمكنك هنا إرجاع صفحة "بلا اتصال بالإنترنت" إذا أردت
      })
  );
});

// حدث التفعيل: يتم تشغيله عند تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  // احذف أي ذاكرة تخزين مؤقت قديمة لم تعد مطلوبة
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
