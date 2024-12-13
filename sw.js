const CACHE_NAME = 'abc-divertido-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icons/android/android-launchericon-72-72.png',
    './icons/android/android-launchericon-96-96.png',
    './icons/android/android-launchericon-144-144.png',
    './icons/android/android-launchericon-192-192.png',
    './icons/android/android-launchericon-512-512.png',
    './icons/ios/apple-touch-icon-152x152.png',
    './icons/ios/apple-touch-icon-180x180.png',
    './icons/ios/apple-touch-icon-167x167.png',
    './icons/windows/favicon-32x32.png',
    './icons/windows/favicon-16x16.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
}); 