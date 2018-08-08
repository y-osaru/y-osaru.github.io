// キャッシュ名とキャッシュファイルの指定
var CACHE_NAME = 'pwa-caches';
var urlsToCache = [
    'https://y-osaru.github.io/atapon/atapon_calc.html',
    'https://y-osaru.github.io/atapon/atapon.js'
];

// インストール処理
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                return response ? response : fetch(event.request);
            })
    );
});