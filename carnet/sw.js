// Service worker du carnet CCC 4330.
// Portee : /ccc-hub/carnet/ uniquement. Le SW du Hub, a la racine, a un scope
// plus large ; pour toute page sous /carnet/ c'est celui-ci qui gagne, le
// navigateur retenant toujours la portee la plus specifique.
//
// Strategie : cache d'abord, revalidation en arriere-plan. En mode avion tout
// repond depuis le cache. En ligne, la version fraiche est recuperee en fond et
// servie au chargement suivant. Bumper CACHE a chaque deploiement.

const CACHE = 'ccc-v2-carnet-6';

const NOYAU = [
  './',
  'index.html',
  'app.css',
  'app.js',
  'data.js',
  'profil.js',
  'prepa-data.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(NOYAU))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(noms => Promise.all(
        noms.filter(n => n.startsWith('ccc-v2-carnet-') && n !== CACHE)
            .map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// Met a jour l'entree en cache sans bloquer la reponse.
function revalide(req, cache) {
  return fetch(req)
    .then(rep => {
      if (rep && (rep.ok || rep.type === 'opaque')) cache.put(req, rep.clone());
      return rep;
    })
    .catch(() => null);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const memeOrigine = url.origin === self.location.origin;
  const dansLeCarnet = memeOrigine && url.pathname.startsWith(new URL('./', self.location).pathname);

  // Les polices Google : cache d'abord, sinon reseau. L'app reste lisible sans
  // elles grace aux polices systeme de repli, donc un echec n'est pas grave.
  const police = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (!dansLeCarnet && !police) return;

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req).then(enCache => {
        if (enCache) {
          revalide(req, cache);
          return enCache;
        }
        return revalide(req, cache).then(rep => {
          if (rep) return rep;
          // hors ligne et jamais vu : pour une navigation, on rend l'app
          if (req.mode === 'navigate') return cache.match('index.html');
          return new Response('', { status: 504, statusText: 'hors ligne' });
        });
      })
    )
  );
});
