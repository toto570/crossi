// Service Worker for PWA

const CACHE_NAME = 'crossy-road-pwa-cache-v1';
// キャッシュするファイルのリスト
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  // アイコンもキャッシュする場合はここに追加します
  // 'https://placehold.co/192x192/facc15/1f2937?text=C',
  // 'https://placehold.co/512x512/facc15/1f2937?text=C'
];

// installイベント: Service Workerがインストールされたときに発生
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// activateイベント: Service Workerが有効になったときに発生
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    // 古いキャッシュを削除する
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});


// fetchイベント: ページがリソースをリクエストしたときに発生
self.addEventListener('fetch', event => {
  // console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(
    // 1. キャッシュにリソースがあるか確認
    caches.match(event.request)
      .then(response => {
        // 2. キャッシュにあれば、それを返す
        if (response) {
          // console.log('Service Worker: Found in cache', event.request.url);
          return response;
        }
        // 3. キャッシュになければ、ネットワークから取得
        // console.log('Service Worker: Not in cache, fetching from network', event.request.url);
        return fetch(event.request);
      })
  );
});
