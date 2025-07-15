// キャッシュの名前とバージョンの定義
const CACHE_NAME = 'crossy-road-cache-v1';

// キャッシュするファイルのリスト
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
  // アイコン画像など、他にキャッシュしたいファイルがあればここに追加
];

// Service Workerのインストールイベント
self.addEventListener('install', event => {
  // インストール処理
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Service Workerの有効化イベント
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 古いバージョンのキャッシュがあれば削除
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// fetchイベント（ネットワークリクエストへの介入）
self.addEventListener('fetch', event => {
  event.respondWith(
    // まずキャッシュ内にリクエストされたリソースがあるか確認
    caches.match(event.request)
      .then(response => {
        // キャッシュにあれば、それを返す
        if (response) {
          return response;
        }

        // キャッシュになければ、ネットワークにリクエストを送信
        return fetch(event.request);
      }
    )
  );
});
