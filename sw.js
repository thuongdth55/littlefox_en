const BUILD = '__BUILD__'; // được workflow thay bằng commit SHA để làm mới cache
const SHELL = `lf-shell-${BUILD}`;
const DATA = 'lf-data';
const IMG = 'lf-img';
const LIB = 'lf-lib';
const KEEP = [SHELL, DATA, IMG, LIB];

const FILES = [
  './', 'index.html', 'style.css', 'app.js', 'config.js',
  'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !KEEP.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: false });
    if (hit) return hit;
    throw err;
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const fetching = fetch(req)
    .then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; })
    .catch(() => null);
  return hit || (await fetching) || Response.error();
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.headers.has('range') || req.destination === 'video' || req.destination === 'audio') return;

  const url = new URL(req.url);

  // Dữ liệu Firebase Realtime Database (REST)
  if (url.hostname.endsWith('firebaseio.com') || url.hostname.endsWith('firebasedatabase.app')) {
    e.respondWith(networkFirst(req, DATA));
    return;
  }

  // File của chính app
  if (url.origin === self.location.origin) {
    e.respondWith(
      networkFirst(req, SHELL).catch(() => caches.match('index.html'))
    );
    return;
  }

  // Thư viện từ CDN (QR, hls.js)
  if (url.hostname === 'cdnjs.cloudflare.com') {
    e.respondWith(cacheFirst(req, LIB));
    return;
  }

  // Ảnh bìa
  if (req.destination === 'image') {
    e.respondWith(staleWhileRevalidate(req, IMG));
  }
});
