/* sw.js — CCC 2026 Hub
   Stratégie « réseau d'abord » : quand il y a du réseau, l'app charge TOUJOURS
   la dernière version (fini les versions bloquées en cache). Le cache ne sert
   plus que de repli hors-ligne. Le nouveau service worker prend la main
   immédiatement à chaque déploiement (skipWaiting + clients.claim) et purge
   les anciens caches. => Plus jamais besoin de « vider les données ». */

const CACHE = 'ccc-hub-v2';

self.addEventListener('install', function (e) {
  // Le nouveau SW n'attend pas la fermeture des onglets pour s'activer
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    // Supprime tous les anciens caches (toute version différente de CACHE)
    const keys = await caches.keys();
    await Promise.all(keys.filter(function (k) { return k !== CACHE; })
                          .map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  // On ne touche pas aux écritures (PUT/POST vers l'API) ni aux non-GET
  if (req.method !== 'GET') return;

  e.respondWith((async function () {
    try {
      // Réseau d'abord
      const fresh = await fetch(req);
      // On ne met en cache que les réponses valides de NOTRE origine (l'app),
      // jamais les réponses de l'API backend (qui doivent rester fraîches).
      try {
        if (fresh && fresh.status === 200 &&
            new URL(req.url).origin === self.location.origin) {
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
        }
      } catch (ignore) {}
      return fresh;
    } catch (err) {
      // Hors-ligne : repli sur le cache
      const cached = await caches.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const home = (await caches.match('./')) || (await caches.match('index.html'));
        if (home) return home;
      }
      throw err;
    }
  })());
});
