// Service worker du carnet CCC 4330.
// Portee : /ccc-hub/carnet/ uniquement. Le SW du Hub, a la racine, a un scope
// plus large ; pour toute page sous /carnet/ c'est celui-ci qui gagne, le
// navigateur retenant toujours la portee la plus specifique.
//
// Strategie, revue le 23/08 apres que Pierre a vu trois fois de suite une
// version perimee :
//
//   Le code de l'app (html, js, css) va chercher le RESEAU D'ABORD, avec un
//   delai de 1,5 s, et retombe sur le cache s'il n'a pas repondu. En ligne, la
//   nouvelle version arrive donc des la PREMIERE ouverture. Hors ligne, le
//   fetch echoue immediatement et le cache repond : le comportement du jour J
//   ne change pas d'un pouce.
//
//   Tout le reste (images, gpx, prive-docs.js qui pese 2,6 Mo) reste en cache
//   d'abord : ces fichiers ne changent qu'a un redeploiement, et les relire au
//   reseau ne ferait que ralentir le demarrage.
//
// Bumper CACHE a chaque deploiement.

const CACHE = 'ccc-v2-carnet-34';

const NOYAU = [
  './',
  'index.html',
  'app.css',
  'app.js',
  'data.js',
  'profil.js',
  'trace.js',
  'cartes-data.js',
  'parcours-data.js',
  'prepa-data.js',
  'nutrition-data.js',
  'sac-data.js',
  'voyage-data.js',
  'meteo-data.js',
  'confiance-data.js',
  'maj20-data.js',
  'maj23-data.js',
  'meteo-points.js',
  'prive-data.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

// `prive-docs.js` n'existe que si Pierre a depose des pieces jointes. Un
// addAll echouerait en bloc sur un seul 404 : on met donc en cache fichier par
// fichier, et un absent n'empeche pas les autres.
const EN_PLUS = ['prive-docs.js',
  'assets/CCC_2026_RAVITOS_SOMMETS.gpx', 'assets/CCC_2026_RAVITOS.gpx'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(NOYAU).then(() =>
        Promise.allSettled(EN_PLUS.map(u => c.add(u)))))
  );
  // PAS de skipWaiting() ici. Avec lui, le nouveau worker n'atteignait jamais
  // l'etat `waiting`, et le bandeau « nouvelle version » de l'app ne pouvait
  // pas se declencher de facon fiable : il ne trouvait jamais reg.waiting.
  // C'est la page qui decide, via le message prendreLaMain.
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

// La page peut demander au nouveau worker de prendre la main tout de suite.
self.addEventListener('message', e => {
  if (e.data && e.data.action === 'prendreLaMain') self.skipWaiting();
});

/* Combien de temps on laisse au reseau avant de servir le cache. Assez pour
   une 4G correcte, assez court pour ne pas faire attendre dans un fond de
   vallee ou le signal existe mais ne repond pas. */
const DELAI_RESEAU = 1500;

/* Ce dont la fraicheur compte vraiment : le code. Pas les 2,6 Mo du coffre. */
function fraicheurRequise(url, req) {
  if (url.pathname.endsWith('prive-docs.js')) return false;
  if (req.mode === 'navigate') return true;
  return /\.(html|js|css|webmanifest)$/.test(url.pathname);
}

function reseauDabord(req, cache) {
  return new Promise(resolve => {
    let rendu = false;
    const servirLeCache = () => {
      if (rendu) return;
      rendu = true;
      cache.match(req).then(c => resolve(c ||
        new Response('', { status: 504, statusText: 'hors ligne' })));
    };
    const minuteur = setTimeout(servirLeCache, DELAI_RESEAU);
    /* `cache: 'reload'` court-circuite le cache HTTP DU NAVIGATEUR, qui est une
       couche distincte de celle du service worker. Sans lui, on croit aller au
       reseau et on recoit la meme vieille reponse : le bug exact qu'on essaie
       de corriger, mais une couche plus bas. */
    let requete;
    try { requete = new Request(req, { cache: 'reload' }); } catch (err) { requete = req; }
    fetch(requete).then(rep => {
      clearTimeout(minuteur);
      if (rep && rep.ok) {
        cache.put(req, rep.clone());          // toujours, meme si le cache a deja repondu
        if (!rendu) { rendu = true; resolve(rep); }
      } else {
        servirLeCache();
      }
    }).catch(servirLeCache);
  });
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
    caches.open(CACHE).then(cache => {
      if (dansLeCarnet && fraicheurRequise(url, req)) return reseauDabord(req, cache);
      return cache.match(req).then(enCache => {
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
      });
    })
  );
});
