/* sw.js — CCC 2026 Hub
   Stratégie « réseau d'abord AVEC timeout » :
   - avec du réseau, l'app charge TOUJOURS la dernière version ;
   - en « lie-fi » (réseau qui rame sans tomber, typique en vallée de montagne),
     on sert le cache après NETWORK_TIMEOUT_MS au lieu de laisser un écran
     blanc 30-75 s — critique le jour de la course ;
   - hors-ligne franc (mode avion), repli cache immédiat.
   L'app shell est PRÉ-CACHÉ à l'install : une seule visite en ligne suffit
   pour que l'app se charge ensuite sans réseau.
   Le nouveau SW prend la main immédiatement (skipWaiting + clients.claim). */

const CACHE = 'ccc-hub-v2';
const NETWORK_TIMEOUT_MS = 3000;

self.addEventListener('install', function (e) {
  // Le nouveau SW n'attend pas la fermeture des onglets pour s'activer
  self.skipWaiting();
  // Précache de l'app shell : garantit le hors-ligne même si la visite en
  // cours n'a pas (re)mis index.html en cache.
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(['./', './index.html']); })
      .catch(function () { /* réseau absent à l'install : le runtime cache prendra le relais */ })
  );
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
    // Réseau (met à jour le cache same-origin au passage, jamais l'API backend)
    const network = (async function () {
      const fresh = await fetch(req);
      try {
        if (fresh && fresh.status === 200 &&
            new URL(req.url).origin === self.location.origin) {
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
        }
      } catch (ignore) {}
      return fresh;
    })();

    // Course réseau / timeout
    const winner = await Promise.race([
      network.then(function (r) { return { ok: true, r: r }; },
                   function (err) { return { ok: false, err: err }; }),
      new Promise(function (res) {
        setTimeout(function () { res({ timeout: true }); }, NETWORK_TIMEOUT_MS);
      }),
    ]);

    if (winner.ok) return winner.r;

    if (winner.timeout) {
      // Réseau trop lent : on sert le cache s'il existe (l'app shell y est),
      // et le réseau continue en fond pour rafraîchir le cache.
      const cached = await caches.match(req);
      if (cached) {
        e.waitUntil(network.catch(function () {}));
        return cached;
      }
      // Pas de cache (ex : appel API cross-origin) : on attend le réseau comme avant
      try { return await network; } catch (err) { /* repli ci-dessous */ }
    }

    // Échec réseau franc : repli cache
    const cached = await caches.match(req);
    if (cached) return cached;
    if (req.mode === 'navigate') {
      const home = (await caches.match('./')) || (await caches.match('index.html'));
      if (home) return home;
    }
    return network; // rien à servir : propage l'erreur réseau d'origine
  })());
});
