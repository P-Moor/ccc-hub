// CCC 4330 &#183; carnet de course v2
// Socle : preferences, theme jour/nuit, navigation, profil interactif.

import { RACE, SECTIONS, SCENARIOS, REGLES,
         PANIC, ALERTES, NAAK, NAAK_SOURCE, REPERES } from './data.js';
import { AFFUTAGE } from './prepa-data.js';
import { NUTRITION as NUT } from './nutrition-data.js';
import { SAC, KITS } from './sac-data.js';
import { VOYAGE } from './voyage-data.js';
import { METEO } from './meteo-data.js';
import { CONFIANCE } from './confiance-data.js';
import { PRIVE } from './prive-data.js';
import { VERDICT_CHAUSSURES, TROUSSE, VESTE, LAMPES,
         BALISE, MENUS, TRACES, PHYSIO } from './maj20-data.js';
import { CHANGEMENTS, GESTION_COGNITIVE, MONTRE, PRISE_DE_SANG,
         RECHARGE, VIGILANCE_NUTRITION, PHYSIO_24 } from './maj23-data.js';
import { CARTES } from './cartes-data.js';
import { METEO_POINTS, METEO_SOURCE, CODES_METEO, SEUILS } from './meteo-points.js';
import { PROFIL, altAt } from './profil.js';
import { TRACE } from './trace.js';
import { PARCOURS, kmRestant } from './parcours-data.js';

/* ============================ persistance ============================ */

const CLE = 'ccc-v2-';
const memoire = {};

const store = {
  get(k, def) {
    try {
      const v = localStorage.getItem(CLE + k);
      return v === null ? (k in memoire ? memoire[k] : def) : JSON.parse(v);
    } catch (e) { return k in memoire ? memoire[k] : def; }
  },
  set(k, v) {
    memoire[k] = v;
    try { localStorage.setItem(CLE + k, JSON.stringify(v)); } catch (e) { /* mode prive */ }
  }
};

/* ==================== mes donnees : sauvegarde et migration ====================
   Les modules *-data.js definissent la STRUCTURE, le localStorage detient
   l'ETAT. Ce sont deux choses separees et l'etat gagne toujours.

   Le chemin de lecture merge deja par construction : coche(id) lit par
   identifiant, un id inconnu vaut false. Un nouvel item arrive donc non coche
   sans toucher aux autres, et un id disparu n'efface rien.

   Ce qui suit ajoute le reste : un numero de schema, l'archivage des ids
   orphelins plutot que leur suppression, et l'export / import complet. */

const SCHEMA = 2;
const CLE_JOURNAL = 'ccc-journal-v1';

const CLES_ETAT = [
  'check', 'prepa', 'course', 'kits', 'scenario', 'theme',
  'sacMode', 'sacRouge', 'sacReste', 'voyMode',
  'partie', 'vue-prepa', 'vue-course', 'simu', 'schema', 'orphelins'
];

// Archive les identifiants qui n'existent plus dans les donnees, au lieu de
// les jeter. Si un fichier de donnees part en vrille, l'etat est recuperable.
/* Certaines listes cochables ne sont PAS enumerables au chargement : celle du
   coffre vit dans un fichier chiffre qu'on ne peut pas lire sans la phrase de
   passe. Leurs identifiants sont donc RESERVES par prefixe, sinon l'archivage
   des orphelins les effacerait a chaque ouverture de l'app.

   C'est exactement ce qui se passait jusqu'au 24/08 : les coches du coffre —
   dont « rendre la balise GPS, 155 € » — se decochaient toutes seules a chaque
   rechargement, en silence. */
const PREFIXES_RESERVES = [
  /^lg\d+$/,     // « A regler » du coffre, chiffre donc illisible d'ici
  /^mo\d+$/      // le reste-a-faire de la montre
];
const idReserve = id => PREFIXES_RESERVES.some(r => r.test(id));

function archiveOrphelins(idsConnus) {
  const etat = store.get('check', {}) || {};
  const orph = store.get('orphelins', {}) || {};
  let n = 0;
  Object.keys(etat).forEach(id => {
    if (!idsConnus.has(id) && !idReserve(id)) {
      orph[id] = etat[id]; delete etat[id]; n++;
    }
  });

  /* Reparation : tout ce qui a ete archive a tort par les versions
     precedentes revient dans l'etat actif. Sans ca, Pierre repartirait de zero
     sur des cases qu'il avait deja cochees. */
  let rendus = 0;
  Object.keys(orph).forEach(id => {
    if (idReserve(id)) { etat[id] = orph[id]; delete orph[id]; rendus++; }
  });

  if (n || rendus) { store.set('check', etat); store.set('orphelins', orph); }
  return n;
}

// Deux items ont change d'objet, pas seulement de libelle : c30 est passe du
// Salomon Sense Aero au BV Sport RTECH PRO, et v02 demande maintenant de peser
// DEUX t-shirts au lieu d'un. Un item coche qui ne correspond plus a la realite
// est plus dangereux qu'un item decoche : on les remet a zero, une seule fois.
const DECOCHAGES = { 2: ['c30', 'v02'] };

function migre(idsConnus) {
  const v = store.get('schema', 0);
  const n = archiveOrphelins(idsConnus);
  let remis = [];
  if (v < SCHEMA) {
    const etat = store.get('check', {}) || {};
    for (let k = v + 1; k <= SCHEMA; k++) {
      (DECOCHAGES[k] || []).forEach(id => {
        if (etat[id]) { delete etat[id]; remis.push(id); }
      });
    }
    if (remis.length) store.set('check', etat);
    store.set('schema', SCHEMA);
  }
  return { de: v, vers: SCHEMA, archives: n, remisAZero: remis };
}

function exporteEtat() {
  const d = { app: 'ccc-carnet', schema: SCHEMA, exporte: new Date().toISOString(), donnees: {} };
  CLES_ETAT.forEach(k => {
    const v = localStorage.getItem(CLE + k);
    if (v !== null) d.donnees[CLE + k] = v;
  });
  const j = localStorage.getItem(CLE_JOURNAL);
  if (j !== null) d.donnees[CLE_JOURNAL] = j;
  return JSON.stringify(d, null, 2);
}

// Retourne un compte-rendu plutot que de lancer une exception : on est sur un
// telephone, a J-10, il faut savoir ce qui s'est passe.
function importeEtat(texte) {
  let d;
  try { d = JSON.parse(texte); } catch (e) { return { ok: false, msg: "Ce n'est pas du JSON valide." }; }
  if (!d || d.app !== 'ccc-carnet' || !d.donnees) {
    return { ok: false, msg: "Ce fichier ne vient pas du carnet." };
  }
  let n = 0;
  Object.keys(d.donnees).forEach(k => {
    if (k !== CLE_JOURNAL && k.indexOf(CLE) !== 0) return;
    try { localStorage.setItem(k, d.donnees[k]); n++; } catch (e) { /* quota */ }
  });
  return { ok: true, msg: n + ' clés restaurées, sauvegarde du ' +
    (d.exporte || '').slice(0, 16).replace('T', ' à ') + '.' };
}

function compteEtat() {
  const c = store.get('check', {}) || {};
  const p = store.get('prepa', null) || {};
  const co = store.get('course', null) || {};
  return {
    coches: Object.values(c).filter(Boolean).length,
    taches: Object.values(p.taches || {}).filter(Boolean).length,
    reponses: Object.keys(p.inconnues || {}).length,
    pointages: (co.pointages || []).length,
    journal: (JSON.parse(localStorage.getItem(CLE_JOURNAL) || '[]') || []).length
  };
}

/* ============================ temps ============================ */

const DEPART = new Date(RACE.depart);
const FIN = new Date(RACE.barriereFinale);

// Horloge de l'app. Un decalage en ms permet de rejouer la course avant le
// jour J ; il pilotera le bouton "simuler" du mode course (phase 2).
function maintenant() {
  return new Date(Date.now() + (store.get('simu', 0) || 0));
}

// Decale l'horloge de l'app a une date choisie. Utilisable depuis la console
// pendant la mise au point : CCC.simuler('2026-08-28T22:47').
function simuler(quand) {
  if (quand === null) { store.set('simu', 0); return 'horloge reelle'; }
  const d = new Date(quand);
  if (isNaN(d)) return 'date illisible';
  store.set('simu', d.getTime() - Date.now());
  return 'horloge calee sur ' + d.toLocaleString('fr-FR');
}

// "1h08" ou "0h42" -> minutes
function versMin(txt) {
  const m = /(\d+)h(\d+)/.exec(txt || '');
  return m ? (+m[1]) * 60 + (+m[2]) : 0;
}

// "12:37" -> Date, en avancant d'un jour si l'heure repasse avant la precedente
function horaireVersDate(hhmm, apres) {
  const [h, mn] = hhmm.split(':').map(Number);
  const d = new Date(apres);
  d.setHours(h, mn, 0, 0);
  while (d <= apres) d.setDate(d.getDate() + 1);
  return d;
}

function hhmm(d) {
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

// Table {cumKm, date} du scenario actif, depart inclus.
function jalonsHoraires(scenario) {
  const out = [{ cumKm: 0, date: DEPART }];
  let prec = DEPART;
  scenario.rows.forEach((r, i) => {
    const t = r.horloge || r.max;
    if (!t || !SECTIONS[i]) return;
    const d = horaireVersDate(t, prec);
    out.push({ cumKm: SECTIONS[i].cumKm, date: d });
    prec = d;
  });
  return out;
}

// Heure de passage interpolee a un km donne.
function heureAu(km, jalons) {
  if (km <= 0) return jalons[0].date;
  for (let i = 1; i < jalons.length; i++) {
    if (km <= jalons[i].cumKm) {
      const a = jalons[i - 1], b = jalons[i];
      const t = (km - a.cumKm) / ((b.cumKm - a.cumKm) || 1);
      return new Date(a.date.getTime() + (b.date.getTime() - a.date.getTime()) * t);
    }
  }
  return jalons[jalons.length - 1].date;
}

/* ============================ etat ============================ */

const etat = {
  scenario: store.get('scenario', 'A'),
  vue: 'profil',
  traceFait: false
};

function scenarioActif() {
  return SCENARIOS.find(s => s.id === etat.scenario) || SCENARIOS[0];
}

/* ============================ theme ============================ */

function themeAuto() {
  const h = maintenant().getHours();
  return (h >= 20 || h < 7) ? 'nuit' : 'jour';
}

function appliqueTheme() {
  const manuel = store.get('theme', null);
  const t = manuel || themeAuto();
  document.documentElement.dataset.theme = t;
  const b = document.getElementById('btnTheme');
  b.textContent = t === 'nuit' ? '☀' : '☽';
  b.classList.toggle('on', t === 'nuit');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'nuit' ? '#08061A' : '#17153B');
}

document.getElementById('btnTheme').addEventListener('click', () => {
  const actuel = document.documentElement.dataset.theme;
  store.set('theme', actuel === 'nuit' ? 'jour' : 'nuit');
  appliqueTheme();
});

/* ==================== la crete, signature du bandeau ====================
   La touche trail : ce n'est pas un motif decoratif, c'est LE profil de la
   CCC, tire du meme GPX que l'ecran Trace. Il court sous le dossard, du
   depart de Courmayeur a l'arrivee de Chamonix, et la nuit y est marquee. */

function traceCrete() {
  const hote = document.getElementById('crete');
  if (!hote) return;

  const L = 600, Hh = 30, sol = Hh - 1;
  const aMin = PROFIL.altMin - 120, aMax = PROFIL.altMax + 60;
  const x = km => (km / PROFIL.kmTotal) * L;
  const y = a => sol - ((a - aMin) / (aMax - aMin)) * (sol - 3);

  const d = PROFIL.points.map((pt, i) => (i ? 'L' : 'M') + x(pt[0]).toFixed(1) + ' ' + y(pt[1]).toFixed(1)).join(' ');
  // Champex, ou la nuit commence : la crete change de couleur a cet endroit.
  const champex = SECTIONS.find(sec => sec.nom.indexOf('Champex') > -1);
  const xNuit = (champex ? x(champex.cumKm) : L * 0.55) / L;

  hote.innerHTML =
    '<svg viewBox="0 0 ' + L + ' ' + Hh + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="grCrete" x1="0" x2="1">' +
        '<stop offset="0" stop-color="var(--jour)"/>' +
        '<stop offset="' + xNuit.toFixed(3) + '" stop-color="var(--jour)"/>' +
        '<stop offset="' + Math.min(1, xNuit + .06).toFixed(3) + '" stop-color="var(--nuit-clair)"/>' +
        '<stop offset="1" stop-color="var(--accent)"/>' +
      '</linearGradient>' +
      '<linearGradient id="grCreteF" x1="0" x2="0" y1="0" y2="1">' +
        '<stop offset="0" stop-color="var(--accent)" stop-opacity=".26"/>' +
        '<stop offset="1" stop-color="var(--accent)" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      '<path d="' + d + ' L' + L + ' ' + Hh + ' L0 ' + Hh + ' Z" fill="url(#grCreteF)"/>' +
      '<path d="' + d + '" fill="none" stroke="url(#grCrete)" stroke-width="1.6" ' +
        'stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
    '</svg>';
}

/* ============================ navigation ============================ */

// L'app a deux moities : preparer jusqu'au 28, et courir le 28.
const PARTIES = {
  prepa: [
    ['aujourdhui', "Aujourd'hui", '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M3 11h18"/><path d="M9 16l1.8 1.8L14.5 14"/>'],
    ['sac', 'Le sac', '<path d="M8 8V6.5a4 4 0 0 1 8 0V8"/><rect x="4" y="8" width="16" height="13" rx="3"/><path d="M9 13h6"/>'],
    ['journal', 'Journal', '<path d="M6 3h11a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M4 17h15"/><path d="M9 8h6"/><path d="M9 12h4"/>'],
    ['nutrition', 'Nutrition', '<path d="M10 3v6l-4.6 9.2A2 2 0 0 0 7.2 21h9.6a2 2 0 0 0 1.8-2.8L14 9V3"/><path d="M9 3h6"/>'],
    ['voyage', 'Voyage', '<path d="M4 17V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10"/><path d="M4 13h16"/><circle cx="8" cy="17" r="1.6"/><circle cx="16" cy="17" r="1.6"/><path d="M9 4V2h6v2"/>']
  ],
  course: [
    ['profil', 'Tracé', '<path d="M2 18l6-9 4 5 3-4 7 8z"/>'],
    ['deroule', 'Pacing', '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><path d="M6 8v8"/><path d="M11 6h9"/><path d="M11 18h9"/>'],
    ['ravitos', 'Ravitos', '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/>'],
    ['cartes', 'Cartes', '<rect x="3" y="6" width="13" height="9" rx="2"/><rect x="8" y="9" width="13" height="9" rx="2"/>'],
    ['course', 'Jour J', '<path d="M6 4l13 8-13 8z"/>']
  ]
};

etat.partie = store.get('partie', 'prepa');
if (!PARTIES[etat.partie]) etat.partie = 'prepa';

const vueParDefaut = p => PARTIES[p][0][0];

function traceTabbar() {
  const bar = document.getElementById('tabbar');
  bar.innerHTML = PARTIES[etat.partie].map(([id, lbl, ico]) =>
    '<button class="tab' + (id === etat.vue ? ' actif' : '') + '" data-vue="' + id + '" role="tab">' +
    '<svg viewBox="0 0 24 24">' + ico + '</svg>' + lbl + '</button>').join('');
  bar.querySelectorAll('.tab').forEach(t =>
    t.addEventListener('click', () => montre(t.dataset.vue)));
  document.querySelectorAll('.parties button').forEach(b =>
    b.classList.toggle('on', b.dataset.partie === etat.partie));
}

function montre(nom) {
  etat.vue = nom;
  store.set('vue-' + etat.partie, nom);
  // pilote le mode 3h du matin : typo XXL et fond noir sur l'onglet du jour J
  document.documentElement.dataset.course = nom === 'course' ? '1' : '0';
  document.querySelectorAll('.vue').forEach(v => v.classList.toggle('actif', v.id === 'v-' + nom));
  traceTabbar();
  window.scrollTo(0, 0);
  if (nom === 'course') majCourse(true);
}

function changePartie(p) {
  if (!PARTIES[p]) return;
  etat.partie = p;
  store.set('partie', p);
  const memorisee = store.get('vue-' + p, null);
  const valide = PARTIES[p].some(x => x[0] === memorisee);
  montre(valide ? memorisee : vueParDefaut(p));
}

document.querySelectorAll('.parties button').forEach(b =>
  b.addEventListener('click', () => changePartie(b.dataset.partie)));

// les deux axes de lecture du sac, et les deux filtres
document.addEventListener('click', e => {
  const m = e.target.closest('#sacMode button');
  if (m) { sacMode = m.dataset.mode; store.set('sacMode', sacMode); traceSac(); return; }
  if (e.target.closest('#fRouge')) { fRouge = !fRouge; store.set('sacRouge', fRouge); traceSac(); return; }
  if (e.target.closest('#fReste')) { fReste = !fReste; store.set('sacReste', fReste); traceSac(); }
});

/* ============================ profil ============================ */

const VB_W = 500, VB_H = 212;
const PAD = 7, TOP = 38, BASE = 168;
const Y_NUIT = 10, Y_SOM = 21, PAS_SOM = 10;
const W = VB_W - PAD * 2, H = BASE - TOP;
const A_MIN = 950, A_MAX = 2620;

const px = km => PAD + (km / PROFIL.kmTotal) * W;
const py = alt => BASE - ((alt - A_MIN) / (A_MAX - A_MIN)) * H;
const kmDepuisX = x => Math.max(0, Math.min(PROFIL.kmTotal, ((x - PAD) / W) * PROFIL.kmTotal));

// Nom court d'un poste, pour les zones etroites.
const court = nom => nom.replace('Refuge ', '').replace('-Lac', '');

// Sommet nomme de chaque section : point le plus haut du troncon.
// Les etiquettes sont empilees sur plusieurs etages pour ne jamais se chevaucher.
function sommets() {
  const out = [];
  SECTIONS.forEach((s, i) => {
    if (!s.sommet) return;
    const debut = i === 0 ? 0 : SECTIONS[i - 1].cumKm;
    let best = null;
    PROFIL.points.forEach(([km, alt]) => {
      if (km >= debut && km <= s.cumKm && (!best || alt > best[1])) best = [km, alt];
    });
    if (best) out.push({ km: best[0], alt: best[1], nom: s.sommet.replace(/\s*\d+\s*m$/, '') });
  });

  // placement : largeur estimee du texte, puis premier etage libre
  out.sort((a, b) => a.km - b.km);
  const etages = [];
  out.forEach(s => {
    const larg = s.nom.length * 5.3 + 6;
    const x = px(s.km);
    let g = x - larg / 2, d = x + larg / 2;
    if (g < PAD) { g = PAD; d = g + larg; }
    if (d > VB_W - PAD) { d = VB_W - PAD; g = d - larg; }
    let e = 0;
    while (etages[e] && etages[e].some(o => g < o.d && d > o.g)) e++;
    (etages[e] = etages[e] || []).push({ g, d });
    s.etage = e;
    s.cx = (g + d) / 2;
  });
  return out;
}

function traceProfil() {
  const pts = PROFIL.points;
  let d = '';
  pts.forEach(([km, alt], i) => { d += (i ? 'L' : 'M') + px(km).toFixed(2) + ' ' + py(alt).toFixed(2) + ' '; });
  const aire = d + 'L' + px(PROFIL.kmTotal).toFixed(2) + ' ' + BASE + ' L' + PAD + ' ' + BASE + ' Z';
  const xNuit = px(RACE.nuit.kmEstime);

  const som = sommets().map(s => {
    const x = px(s.km), y = py(s.alt);
    const yTxt = Y_SOM + s.etage * PAS_SOM;
    return '<line class="pf-sommet-t" x1="' + x.toFixed(1) + '" y1="' + (y - 3).toFixed(1) +
           '" x2="' + x.toFixed(1) + '" y2="' + (yTxt + 2).toFixed(1) + '"/>' +
           '<text class="pf-sommet" x="' + s.cx.toFixed(1) + '" y="' + yTxt.toFixed(1) +
           '" text-anchor="middle">' + s.nom + '</text>';
  }).join('');

  const dots = SECTIONS.map((s, i) => {
    const x = px(s.cumKm), y = py(altAt(s.cumKm));
    const cls = 'pf-pt' + (s.arret === 'grand' ? ' grand' : '') + (s.arret === 'arrivee' ? ' fin' : '');
    const r = s.arret === 'grand' ? 3.8 : 2.8;
    return '<circle class="' + cls + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '"/>' +
           '<circle class="pf-pt-hit" data-i="' + i + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="13"/>';
  }).join('');

  const nommes = [3, 5, 6, 7].map(i => {
    const s = SECTIONS[i], x = px(s.cumKm);
    const ancre = x > VB_W - 40 ? 'end' : 'middle';
    return '<text class="pf-pt-lbl" x="' + (ancre === 'end' ? VB_W - PAD : x).toFixed(1) + '" y="' + (BASE + 11) +
           '" text-anchor="' + ancre + '">' + court(s.nom) + '</text>';
  }).join('');

  const kFin = RACE.distanceKm;
  // On saute la graduation ronde trop proche de la fin : a 108,8 km le « 100 »
  // se collait au libelle final et les deux devenaient illisibles. Le seuil est
  // proportionnel pour que ca tienne quelle que soit la distance.
  const axe = [0, 25, 50, 75, 100].filter(k => k < kFin * 0.88).concat([kFin]).map(k =>
    '<text class="pf-axe-txt" x="' + px(k).toFixed(1) + '" y="' + (VB_H - 4) +
    '" text-anchor="' + (k === 0 ? 'start' : (k >= kFin ? 'end' : 'middle')) + '">' +
    (k === kFin ? kmFmt(k) + ' km' : k) + '</text>').join('');

  return '' +
  '<svg class="profil-svg" id="pfSvg" viewBox="0 0 ' + VB_W + ' ' + VB_H + '" role="img" aria-label="Profil altimetrique de la CCC">' +
    '<defs>' +
      '<linearGradient id="gradJour" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="var(--jour)" stop-opacity=".46"/>' +
        '<stop offset="100%" stop-color="var(--jour)" stop-opacity=".08"/>' +
      '</linearGradient>' +
      '<linearGradient id="gradNuit" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="var(--nuit)" stop-opacity=".55"/>' +
        '<stop offset="100%" stop-color="var(--nuit)" stop-opacity=".10"/>' +
      '</linearGradient>' +
      '<clipPath id="clipJour"><rect x="0" y="0" width="' + xNuit.toFixed(1) + '" height="' + VB_H + '"/></clipPath>' +
      '<clipPath id="clipNuit"><rect x="' + xNuit.toFixed(1) + '" y="0" width="' + (VB_W - xNuit).toFixed(1) + '" height="' + VB_H + '"/></clipPath>' +
    '</defs>' +
    '<line class="pf-grille" x1="' + PAD + '" y1="' + BASE + '" x2="' + (VB_W - PAD) + '" y2="' + BASE + '"/>' +
    '<g class="pf-fade">' +
      '<path class="pf-aire" clip-path="url(#clipJour)" d="' + aire + '"/>' +
      '<path class="pf-aire-n" clip-path="url(#clipNuit)" d="' + aire + '"/>' +
      '<line class="pf-nuit-t" x1="' + xNuit.toFixed(1) + '" y1="' + (Y_NUIT + 3) + '" x2="' + xNuit.toFixed(1) + '" y2="' + BASE + '"/>' +
      '<text class="pf-nuit-lbl" x="' + (xNuit + 5).toFixed(1) + '" y="' + Y_NUIT + '" text-anchor="start">nuit ~20:30</text>' +
    '</g>' +
    '<path class="pf-trace anime" id="pfTrace" d="' + d + '"/>' +
    '<g class="pf-fade">' + som + dots + nommes + axe + '</g>' +
    '<g class="pf-cache" id="pfCurseur">' +
      '<line class="pf-curseur" id="pfCurLigne" x1="0" y1="' + TOP + '" x2="0" y2="' + BASE + '"/>' +
      '<circle class="pf-curseur-b" id="pfCurBille" cx="0" cy="0" r="5"/>' +
    '</g>' +
  '</svg>';
}

function sectionAu(km) {
  for (const s of SECTIONS) if (km <= s.cumKm) return s;
  return SECTIONS[SECTIONS.length - 1];
}

let kmCourant = 0;

function litProfil(km) {
  kmCourant = km;
  const alt = Math.round(altAt(km) / 5) * 5;
  const sec = sectionAu(km);
  document.getElementById('lecKm').textContent = km.toFixed(1).replace('.', ',');
  document.getElementById('lecAlt').textContent = alt;
  document.getElementById('lecSec').textContent = court(sec.nom);
  document.getElementById('lecH').textContent = hhmm(heureAu(km, jalonsHoraires(scenarioActif())));
}

// Ravito le plus proche, si le doigt s'arrete assez pres.
const AIMANT_KM = 3;
function ravitoProche(km) {
  let best = null;
  SECTIONS.forEach(s => {
    const d = Math.abs(s.cumKm - km);
    if (d <= AIMANT_KM && (!best || d < best.d)) best = { s, d };
  });
  return best && best.s;
}

function placeCurseur(km) {
  const cx = px(km), cy = py(altAt(km));
  const lig = document.getElementById('pfCurLigne');
  document.getElementById('pfCurseur').classList.add('on');
  lig.setAttribute('x1', cx); lig.setAttribute('x2', cx);
  const bil = document.getElementById('pfCurBille');
  bil.setAttribute('cx', cx); bil.setAttribute('cy', cy);
  litProfil(km);
}

function brancheScrub() {
  const svg = document.getElementById('pfSvg');
  let actif = false, dernierKm = 0;

  const kmSous = ev => {
    const r = svg.getBoundingClientRect();
    return kmDepuisX(((ev.clientX - r.left) / r.width) * VB_W);
  };

  svg.addEventListener('pointerdown', ev => {
    actif = true;
    svg.setPointerCapture(ev.pointerId);
    dernierKm = kmSous(ev);
    placeCurseur(dernierKm);
  });
  svg.addEventListener('pointermove', ev => {
    if (!actif) return;
    ev.preventDefault();
    dernierKm = kmSous(ev);
    placeCurseur(dernierKm);
  });
  const fin = () => {
    if (!actif) return;
    actif = false;
    // aimantage : un doigt qui s'arrete pres d'un ravito tombe dessus
    const r = ravitoProche(dernierKm);
    if (r) placeCurseur(r.cumKm);
  };
  svg.addEventListener('pointerup', fin);
  svg.addEventListener('pointercancel', fin);
}

/* ---- barre de marge ---- */

// Une ligne par poste : le nom, une barre proportionnelle, la valeur.
// La couleur suit la convention du carnet : vert au dela de 1h30, ambre au
// dela de 45 min, rouge en dessous. Pas de degrade decoratif.
function traceMarge() {
  const plan = scenarioActif();
  const marges = SECTIONS.map((s, i) => versMin(margeDe(plan, i)));
  const max = Math.max(...marges, 1);
  const mini = Math.min(...marges);
  const iMini = marges.indexOf(mini);

  const lignes = SECTIONS.map((s, i) => {
    const txt = margeDe(plan, i);
    const cl = classeMarge(txt);
    return '<div class="mg' + (i === iMini ? ' serre' : '') + '">' +
      '<div class="mg-n">' + court(s.nom) + '</div>' +
      '<div class="mg-p"><i class="' + cl + '" style="width:' +
        Math.max(3, (marges[i] / max) * 100).toFixed(1) + '%"></i></div>' +
      '<div class="mg-v ' + cl + '">' + txt + '</div></div>';
  }).join('');

  return lignes + '<div class="mg-mot">' + motMarge(plan, marges, iMini) + '</div>';
}

function motMarge(plan, marges, iMini) {
  if (plan.id === 'C') return "Vingt minutes partout. Ce n'est pas une marge, c'est une limite.";
  const nom = court(SECTIONS[iMini].nom);
  return 'La barrière la plus serrée est <b>' + nom + '</b>, avec ' + margeDe(plan, iMini) +
    '. Elle passe, tout le reste respire : la marge ne fait que grandir ensuite.';
}

/* ============================ feuille ============================ */

const feuille = document.getElementById('feuille');
const feuilleFond = document.getElementById('feuilleFond');

function ouvreFeuille(titre, corps) {
  document.getElementById('feuilleTitre').innerHTML = titre;
  document.getElementById('feuilleCorps').scrollTop = 0;
  feuille.scrollTop = 0;
  document.getElementById('feuilleCorps').innerHTML = corps;
  feuille.classList.add('on');
  feuilleFond.classList.add('on');
}
function fermeFeuille() {
  feuille.classList.remove('on');
  feuilleFond.classList.remove('on');
}

feuilleFond.addEventListener('click', fermeFeuille);
document.getElementById('feuilleFermer').addEventListener('click', fermeFeuille);
document.addEventListener('keydown', e => { if (e.key === 'Escape') fermeFeuille(); });

const htmlRegles = () => REGLES.map(r =>
  '<div class="regle"><b>' + r.n + '</b><p>' + r.t + '</p></div>').join('');

// 4. Les regles, accessibles partout. Celles de la prepa d'un cote, celles de
// la course de l'autre : ce ne sont pas les memes et elles ne servent pas au
// meme moment.
document.getElementById('btnRegles').addEventListener('click', () => {
  if (etat.partie === 'prepa') {
    ouvreFeuille('Les 4 règles de la prépa', AFFUTAGE.regles.map(r =>
      '<div class="regle"><b>' + r.n + '</b><p><b style="display:block;background:none;color:inherit;width:auto;height:auto;font-size:17px">' +
      r.titre + '</b><span style="color:var(--texte-doux);font-size:14.5px">' + r.detail + '</span></p></div>').join('') +
      '<div class="jr-note" style="margin-top:14px">' + AFFUTAGE.meta.meteoSemaine + '</div>');
  } else {
    ouvreFeuille('Les 5 règles', htmlRegles());
  }
});

/* ---- l'ecran Mes donnees ---- */

// Tous les identifiants cochables connus, toutes sources confondues.
function idsConnusCheck() {
  const e = new Set();
  SAC.items.forEach(i => e.add(i.id));
  SAC.kits.forEach(k => k.items.forEach(i => e.add(i.id)));
  SAC.verifications.forEach(v => e.add(v.id));
  SAC.telephone.protocole.forEach(i => e.add(i.id));
  NUT.listeAchat.trakks.concat(NUT.listeAchat.maison).forEach(i => e.add(i.id));
  VOYAGE.aller.surMoiDansLeTrain.forEach(i => e.add(i.id));
  VOYAGE.documentsHorsLigne.forEach(i => e.add(i.id));
  VOYAGE.retour.aFaire.forEach(i => e.add(i.id));
  return e;
}

const VERSION = 'ccc-v2-carnet-38';

/* L'estampille du coffre ne suit PAS la version de l'app : elle ne bouge que
   quand le contenu chiffre change. Sinon chaque livraison ferait croire a un
   coffre perime alors que l'ancien fichier est parfaitement valide. */
const COFFRE_ATTENDU = 'ccc-v2-carnet-36';

function ouvreDonnees() {
  const c = compteEtat();
  const json = exporteEtat();
  const nom = 'carnet-ccc-' + isoLocal(new Date()) + '.json';
  const href = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);

  ouvreFeuille('Mes données', '' +
    '<div class="dn-c">' +
      '<div><b>' + c.coches + '</b><span>cases cochées</span></div>' +
      '<div><b>' + c.taches + '</b><span>tâches de prépa</span></div>' +
      '<div><b>' + c.reponses + '</b><span>réponses saisies</span></div>' +
      '<div><b>' + c.pointages + '</b><span>pointages</span></div>' +
    '</div>' +
    '<p class="dn-p">Fais une sauvegarde avant chaque grosse mise à jour. ' +
      'Si quelque chose se perd, tu restaures ici.</p>' +
    '<div class="dn-b">' +
      '<a class="dn-btn plein" download="' + nom + '" href="' + href + '">Télécharger</a>' +
      '<button class="dn-btn" id="dnCopier">Copier</button>' +
    '</div>' +
    '<textarea class="dn-t" id="dnExport" readonly rows="4">' +
      json.replace(/</g, '&lt;') + '</textarea>' +
    '<div class="fi-titre">Restaurer une sauvegarde</div>' +
    '<textarea class="dn-t" id="dnImport" rows="3" placeholder="Colle ici le contenu d\'une sauvegarde"></textarea>' +
    '<button class="dn-btn large" id="dnImporter">Restaurer</button>' +
    '<div class="dn-msg" id="dnMsg"></div>' +
    '<div class="fi-titre">Version</div>' +
    '<div class="dn-vers"><b>' + VERSION + '</b>' +
      '<small>Si le carnet te semble en retard sur ce qu\'on a fait, ' +
      'c\'est le cache. Ce bouton va chercher la version fraiche.</small></div>' +
    '<button class="dn-btn large" id="dnMaj">Chercher une mise à jour</button>' +
    '<div class="dn-msg" id="dnMajMsg"></div>');

  const bMaj = document.getElementById('dnMaj');
  bMaj.addEventListener('click', async () => {
    const msg = document.getElementById('dnMajMsg');
    msg.textContent = 'Recherche…';
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) await r.update();
      // on vide le cache et on repart du reseau : c'est brutal mais sur
      for (const k of await caches.keys()) await caches.delete(k);
      msg.textContent = 'Cache vidé. Rechargement…';
      setTimeout(() => location.reload(), 600);
    } catch (e) {
      msg.textContent = 'Impossible ici. Ferme et rouvre le carnet.';
    }
  });

  const cop = document.getElementById('dnCopier');
  cop.addEventListener('click', () => {
    const t = document.getElementById('dnExport');
    t.select(); t.setSelectionRange(0, 999999);
    const fini = () => { cop.textContent = 'Copié ✓'; setTimeout(() => cop.textContent = 'Copier', 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(json).then(fini, fini);
    else { try { document.execCommand('copy'); } catch (e) {} fini(); }
  });

  document.getElementById('dnImporter').addEventListener('click', () => {
    const v = document.getElementById('dnImport').value.trim();
    const msg = document.getElementById('dnMsg');
    if (!v) { msg.className = 'dn-msg non'; msg.textContent = 'Colle d\'abord une sauvegarde.'; return; }
    const r = importeEtat(v);
    msg.className = 'dn-msg ' + (r.ok ? 'oui' : 'non');
    msg.textContent = r.msg + (r.ok ? ' Rechargement…' : '');
    if (r.ok) setTimeout(() => location.reload(), 1200);
  });
}

document.getElementById('btnDonnees').addEventListener('click', ouvreDonnees);
document.getElementById('btnConfiance').addEventListener('click', () => ouvreConfiance());

/* ============================ deroule ============================ */

const [PLAN_A, PLAN_B, PLAN_C] = SCENARIOS;

const kmFmt = n => n.toFixed(1).replace('.', ',');
const MODE = { express: 'Arrêt express', moyen: 'Arrêt moyen', grand: 'Grand arrêt', arrivee: 'Arrivée' };

// vert au dela de 1h30, ambre au dela de 45 min, rouge en dessous
function classeMarge(txt) {
  const m = versMin(txt);
  return m >= 90 ? 'ok' : (m >= 45 ? 'tiede' : 'chaud');
}

const estNuit = km => km > RACE.nuit.kmEstime;

// Le plan C n'a pas de marge : il EST la barriere moins 20 min.
const MARGE_C = '0h20';
const SCEN_COURT = { A: 'cible 22h25', B: 'pied ~25h30', C: 'survie' };

const heureDe = (s, i) => { const r = s.rows[i]; return r.horloge || r.max; };
const margeDe = (s, i) => s.rows[i].marge || (s.id === 'C' ? MARGE_C : null);

function traceSwitch() {
  const h = SCENARIOS.map(s =>
    '<button data-s="' + s.id + '" class="' + (s.id === etat.scenario ? 'on' : '') + '">' +
    s.id + '<small>' + SCEN_COURT[s.id] + '</small></button>').join('');
  document.querySelectorAll('[data-role="scenario"]').forEach(el => {
    el.innerHTML = h;
    el.querySelectorAll('button').forEach(b =>
      b.addEventListener('click', () => changeScenario(b.dataset.s)));
  });
}

function infoScenario() {
  const s = scenarioActif();
  return '<div class="scenar-t">' + s.label + '</div>' +
    '<div class="scenar-s">' + (s.arrets
      ? 'Arrêts cumulés <b>' + s.arrets + '</b>'
      : 'Ce n\'est pas un plan, c\'est une limite. Vingt minutes de marge partout, pas une de plus.') +
    '</div>';
}

function changeScenario(id) {
  etat.scenario = id;
  store.set('scenario', id);
  traceSwitch();
  majScenario();
}

function majScenario() {
  const s = scenarioActif();
  document.getElementById('titreDeroule').innerHTML = 'Le déroulé &#183; plan ' + s.id;
  document.getElementById('scenarInfo').innerHTML = infoScenario();
  document.getElementById('timeline').innerHTML = traceTimeline();
  document.querySelectorAll('#timeline button[data-i]').forEach(b => {
    b.addEventListener('click', () => ouvreFiche(+b.dataset.i));
  });
  document.getElementById('lecPlan').textContent = 'passage ' + s.id;

  document.getElementById('margeHote').innerHTML = traceMarge();
  traceCarte();   // le jour et la nuit se deplacent avec le scenario
  // les heures de passage changent avec le scenario : la meteo doit suivre
  if (typeof traceMeteoPrevue === 'function') traceMeteoPrevue();

  litProfil(kmCourant);
  if (document.getElementById('ravitosHote')) traceRavitos();
}

function traceTimeline() {
  let h = '<div class="tl-ligne debut jour">' +
    '<div class="tl-rail"><i class="tl-dot"></i></div>' +
    '<div class="tl-poste"><div class="tl-h">' + hhmm(DEPART) + '</div>' +
    '<div class="tl-nom">Courmayeur<small>départ &#183; vague ' + RACE.vague + '</small></div></div></div>';

  const plan = scenarioActif();

  SECTIONS.forEach((s, i) => {
    const debut = i === 0 ? 0 : SECTIONS[i - 1].cumKm;
    const cls = estNuit(s.cumKm) ? (estNuit(debut) ? 'nuit' : 'bascule') : 'jour';
    // la duree de section n'est chiffree que dans le plan A
    const duree = PLAN_A.rows[i].section;

    h += '<div class="tl-ligne ' + cls + '"><div class="tl-rail"></div>' +
      '<div class="tl-seg"><b>' + kmFmt(s.km) + ' km</b> &#183; +' + s.dplus.toLocaleString('fr-FR') +
      ' m &#183; -' + s.dminus.toLocaleString('fr-FR') + ' m' +
      (plan.id === 'A' ? ' &#183; <b>' + duree + '</b>' : '') +
      (s.sommet ? '<br><em>' + s.sommet + '</em>' : '') +
      (s.laPlusDure ? '<br><span class="dure">la plus dure de la course</span>' : '') +
      '</div></div>';

    const dernier = i === SECTIONS.length - 1;
    const dot = 'tl-dot' + (s.arret === 'grand' ? ' grand' : '') + (s.arret === 'arrivee' ? ' arrivee' : '');
    const marge = margeDe(plan, i);
    h += '<button class="tl-ligne ' + (estNuit(s.cumKm) ? 'nuit' : 'jour') + (dernier ? ' fin' : '') +
      '" data-i="' + i + '">' +
      '<div class="tl-rail"><i class="' + dot + '"></i></div>' +
      '<div class="tl-poste"><div class="tl-h">' + heureDe(plan, i) + '</div>' +
      '<div class="tl-nom">' + court(s.nom) + '<small>km ' + kmFmt(s.cumKm) +
      ' &#183; reste ' + kmFmt(kmRestant(s.cumKm)) +
      (s.arretMin ? ' &#183; ' + s.arretMin + ' min' : '') + '</small></div>' +
      (marge ? '<span class="pastille ' + classeMarge(marge) + '">' + marge + '</span>' : '') +
      '<span class="tl-chev">&#8250;</span></div></button>';
  });
  return h;
}

/* ---- fiche ravito ---- */

function ficheRavito(i) {
  const s = SECTIONS[i];
  const a = PLAN_A.rows[i], b = PLAN_B.rows[i], c = PLAN_C.rows[i];
  const suite = SECTIONS[i + 1];

  let h = '<div class="fi-mode"><span class="pastille ' +
    (s.arret === 'grand' ? 'teal' : 'tiede') + '">' + MODE[s.arret] +
    (s.arretMin ? ' &#183; ' + s.arretMin + ' min' : '') + '</span></div>';

  // le trio suit le scenario actif, la barriere est un fait, elle ne bouge pas
  const plan = scenarioActif();
  h += '<div class="fi-trio">' +
    '<div><span>' + (plan.id === 'C' ? 'au plus tard' : 'plan ' + plan.id) + '</span><b>' +
      heureDe(plan, i) + '</b></div>' +
    '<div><span>barrière</span><b>' + a.barriere + '</b></div>' +
    '<div><span>marge</span><b>' + margeDe(plan, i) + '</b></div></div>';

  const autres = SCENARIOS.filter(x => x.id !== plan.id).map(x =>
    'plan ' + x.id + ' <b>' + heureDe(x, i) + '</b>' +
    (x.rows[i].marge ? ' (marge ' + x.rows[i].marge + ')' : ' au plus tard'));
  h += '<div class="fi-plans">' + autres.join(' &#183; ') + '</div>';

  if (s.todo && s.todo.length) {
    h += '<div class="fi-titre">À faire ici</div><ul class="fi-todo">' +
      s.todo.map(t => '<li>' + t + '</li>').join('') + '</ul>';
  }

  if (suite) {
    h += '<div class="fi-titre">Ensuite</div>';
    if (suite.laPlusDure) {
      h += '<div class="fi-dure"><b>La section la plus dure</b>' +
        '<p>' + PLAN_A.rows[i + 1].section + ' &#183; blocs, de nuit &#183; <em>elle est prévue</em>. ' +
        'Après elle, c\'est fini.</p></div>';
    }
    h += '<div class="fi-suite"><h4>&#8594; ' + court(suite.nom) + '</h4>' +
      '<div class="chiffres">' + kmFmt(suite.km) + ' km &#183; +' + suite.dplus.toLocaleString('fr-FR') +
      ' m &#183; -' + suite.dminus.toLocaleString('fr-FR') + ' m &#183; ' + PLAN_A.rows[i + 1].section + '</div>' +
      // la consigne de cette section est deja dans le bandeau, ne pas la repeter
      (suite.laPlusDure ? '' : '<p>' + suite.consigne + '</p>') +
      (suite.sommet ? '<div class="sommet">Point haut : ' + suite.sommet + '</div>' : '') +
      '</div>';
  } else {
    h += '<div class="fi-titre">Ensuite</div>' +
      '<div class="fi-suite"><h4>Rien</h4><p>C\'est fini. Tu es arrivé.</p></div>';
  }

  return h;
}

function ouvreFiche(i) {
  const s = SECTIONS[i];
  ouvreFeuille(court(s.nom) + '  &#183;  km ' + kmFmt(s.cumKm), ficheRavito(i));
}

/* ============================ mode course ============================ */

let course = store.get('course', null) || {};
if (!Array.isArray(course.pointages)) course.pointages = [];
if (!course.vues || typeof course.vues !== 'object') course.vues = {};
if (typeof course.ralenti !== 'boolean') course.ralenti = false;

const sauveCourse = () => store.set('course', course);

// "1h08" a partir d'une duree en ms, signe compris
function dureeTxt(ms) {
  const neg = ms < 0;
  const t = Math.round(Math.abs(ms) / 60000);
  return (neg ? '-' : '') + Math.floor(t / 60) + 'h' + String(t % 60).padStart(2, '0');
}

// Les barrieres sont des heures absolues, identiques pour toutes les vagues.
let _barrieres = null;
function barrieres() {
  if (_barrieres) return _barrieres;
  const out = [];
  let prec = DEPART;
  PLAN_A.rows.forEach(r => { const d = horaireVersDate(r.barriere, prec); out.push(d); prec = d; });
  _barrieres = out;
  return out;
}

// Duree de chaque section pour un plan donne.
function dureesDe(plan) {
  const j = jalonsHoraires(plan), d = [];
  for (let i = 1; i < j.length; i++) d.push(j[i].date - j[i - 1].date);
  return d;
}

// Le plan nutrition n'a que 8 postes : Plan de l'Au est un pointage seul.
// On relie donc chaque poste du carnet a sa fiche par le nom.
const norm = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z]/g, '');
function ravitoNut(i) {
  const cible = norm(court(SECTIONS[i].nom));
  const s = NUT.sections.find(x => norm(x.ravito.nom).includes(cible) || cible.includes(norm(x.vers)));
  return s ? s.ravito : null;
}

const dernierPointage = () => course.pointages[course.pointages.length - 1] || null;

function prochainIndex() {
  const d = dernierPointage();
  const i = d ? d.i + 1 : 0;
  return i < SECTIONS.length ? i : -1;
}

// ETA de chaque poste. Avant tout pointage c'est le plan brut ; ensuite tout est
// recale sur l'heure reelle du dernier pointage, section par section.
function etas() {
  const plan = scenarioActif();
  const base = jalonsHoraires(plan);
  const out = SECTIONS.map((s, i) => base[i + 1].date);
  const dur = dureesDe(course.ralenti ? PLAN_B : plan);
  const d = dernierPointage();
  if (d) {
    let t = new Date(d.t).getTime();
    for (let i = d.i + 1; i < SECTIONS.length; i++) { t += dur[i]; out[i] = new Date(t); }
  }
  course.pointages.forEach(p => { out[p.i] = new Date(p.t); });
  return out;
}

// Position estimee en km, par interpolation temporelle sur les ETA.
function positionKm(now) {
  const e = etas();
  const d = dernierPointage();
  let kmA = d ? SECTIONS[d.i].cumKm : 0;
  let tA = d ? new Date(d.t) : DEPART;
  if (now <= tA) return kmA;
  for (let i = (d ? d.i + 1 : 0); i < SECTIONS.length; i++) {
    const kmB = SECTIONS[i].cumKm, tB = e[i];
    if (now <= tB) return kmA + (kmB - kmA) * ((now - tA) / ((tB - tA) || 1));
    kmA = kmB; tA = tB;
  }
  return RACE.distanceKm;
}

/* ---- mini profil ---- */

const M_W = 486, M_PAD = 7, M_TOP = 9, M_BASE = 66, M_H = 86;
const mx = k => M_PAD + (k / PROFIL.kmTotal) * M_W;
const my = a => M_BASE - ((a - A_MIN) / (A_MAX - A_MIN)) * (M_BASE - M_TOP);

function traceMiniProfil(km) {
  let d = '';
  PROFIL.points.forEach(([k, a], i) => { d += (i ? 'L' : 'M') + mx(k).toFixed(1) + ' ' + my(a).toFixed(1) + ' '; });
  const x = mx(km), y = my(altAt(km));
  const ticks = SECTIONS.map(s =>
    '<rect class="tick' + (s.arret === 'grand' ? ' grand' : '') + '" x="' +
    (mx(s.cumKm) - 1).toFixed(1) + '" y="' + (M_BASE + 3) + '" width="2" height="' +
    (s.arret === 'grand' ? 8 : 5) + '" rx="1"/>').join('');

  return '<svg class="co-mini" viewBox="0 0 500 ' + M_H + '" role="img" aria-label="Position estimée sur le parcours">' +
    '<rect class="fait" x="0" y="0" width="' + x.toFixed(1) + '" height="' + M_BASE + '"/>' +
    '<path class="tr" d="' + d + '"/>' + ticks +
    '<line class="lig" x1="' + x.toFixed(1) + '" y1="' + M_TOP + '" x2="' + x.toFixed(1) + '" y2="' + (M_BASE + 2) + '"/>' +
    '<circle class="moi" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.5"/>' +
    '<text class="pf-axe-txt" x="' + M_PAD + '" y="' + (M_H - 2) + '">km ' + kmFmt(km) + '</text>' +
    '<text class="pf-axe-txt" x="' + (500 - M_PAD) + '" y="' + (M_H - 2) + '" text-anchor="end">' +
      kmFmt(RACE.distanceKm - km) + ' km restants</text>' +
    '</svg>';
}

/* ---- alertes ---- */

function alertesActives() {
  const out = [];
  const faits = new Set(course.pointages.map(p => p.i));
  // une alerte vaut pour le poste ou elle se declenche et le troncon qui suit :
  // des que le poste suivant est pointe, elle n'a plus lieu d'etre
  ALERTES.forEach(a => {
    if (faits.has(a.apres) && !faits.has(a.apres + 1) && !course.vues[a.cle]) out.push(a);
  });

  // marge serree sur la prochaine barriere
  const i = prochainIndex();
  if (i >= 0) {
    const marge = barrieres()[i] - etas()[i];
    if (marge < 45 * 60000 && !course.vues['marge' + i]) {
      out.push({ cle: 'marge' + i, icone: "⚠️", barriere: true,
        t: 'Marge ' + dureeTxt(marge) + ' sur ' + court(SECTIONS[i].nom),
        d: "Ralentis les arrêts, pas la marche. Tu manges en marchant." });
    }
  }
  return out;
}

/* ---- rendu ---- */

function traceCourse() {
  const now = maintenant();
  const simu = store.get('simu', 0);

  const barreSimu = '<div class="co-simu"><span>Simuler l\'horloge</span><div class="lignes">' +
    [['Départ', '2026-08-28T09:16'], ['Bertone', '2026-08-28T12:40'],
     ['Champex', '2026-08-28T19:30'], ['Trient', '2026-08-28T22:55'],
     ['Vallorcine', '2026-08-29T01:45'], ['Flégère', '2026-08-29T04:40']]
      .map(([l, t]) => '<button data-simu="' + t + '">' + l + '</button>').join('') +
    '<button data-simu="reel" class="reel">horloge réelle</button>' +
    '</div></div>';

  if (now < DEPART) {
    return '<div class="carte co-attente"><b>La course n\'a pas commencé</b>' +
      '<p>Le mode course s\'allumera tout seul le 28 août à ' + hhmm(DEPART) + '.<br>' +
      'En attendant, tu peux la rejouer en décalant l\'horloge.</p></div>' + barreSimu;
  }

  const i = prochainIndex();
  const e = etas();
  const b = barrieres();
  const km = positionKm(now);

  let h = '<div class="co-haut"><div class="h">' + hhmm(now) + '</div>' +
    '<div class="e">' + dureeTxt(now - DEPART) + ' <i>de course</i></div></div>';

  h += alertesActives().map(a =>
    '<div class="co-alerte' + (a.barriere ? ' barriere' : '') + '">' +
    '<div class="ico">' + a.icone + '</div><div class="txt"><b>' + a.t + '</b><small>' + a.d + '</small></div>' +
    '<button data-vu="' + a.cle + '" aria-label="Vu">&#10005;</button></div>').join('');

  if (i < 0) {
    const fin = new Date(dernierPointage().t);
    h += '<div class="carte co-carte"><div class="co-oeil">Arrivée</div>' +
      '<div class="co-nom">Chamonix</div>' +
      '<div class="co-trio">' +
        '<div><span>arrivé à</span><b>' + hhmm(fin) + '</b></div>' +
        '<div><span>temps</span><b>' + dureeTxt(fin - DEPART) + '</b></div>' +
        '<div><span>marge</span><b class="ok">' + dureeTxt(b[b.length - 1] - fin) + '</b></div>' +
      '</div><div class="co-consigne"><span>Fini</span>C\'est fait. ' +
      kmFmt(RACE.distanceKm) + ' km et ' + RACE.dplus.toLocaleString('fr-FR') +
      ' m de D+.</div></div>';
  } else {
    const s = SECTIONS[i];
    const marge = b[i] - e[i];
    const cls = marge >= 90 * 60000 ? 'ok' : (marge >= 45 * 60000 ? 'tiede' : 'chaud');
    const reste = Math.max(0, s.cumKm - km);

    h += '<div class="carte co-carte">' +
      '<div class="co-oeil">Prochain &#183; ' + kmFmt(reste) + ' km</div>' +
      '<div class="co-nom">' + court(s.nom) + '</div>' +
      '<div class="co-trio">' +
        '<div><span>arrivée</span><b>' + hhmm(e[i]) + '</b></div>' +
        '<div><span>barrière</span><b>' + hhmm(b[i]) + '</b></div>' +
        '<div><span>marge</span><b class="' + cls + '">' + dureeTxt(marge) + '</b></div>' +
      '</div>' +
      '<div class="co-consigne"><span>Maintenant</span>' + s.consigne + '</div></div>';

    h += traceMiniProfil(km);

    // 6. la fiche du poste s'ouvre 20 min avant l'heure d'arrivee prevue
    const dans = e[i] - now;
    const rn = ravitoNut(i);
    if (rn && dans > 0 && dans <= 20 * 60000) {
      h += '<div class="co-rav"><div class="co-rav-h"><span>Dans ' + Math.round(dans / 60000) +
        ' min</span><b>' + rn.nom + '</b><i>' + rn.type + ' &#183; ' + rn.duree + '</i></div>' +
        '<div class="sn-l oui"><span>Sur place</span><ul>' +
          rn.surPlace.map(x => '<li>' + x + '</li>').join('') + '</ul></div>' +
        (rn.eviter.length ? '<div class="sn-l non"><span>À éviter</span><ul>' +
          rn.eviter.map(x => '<li>' + x + '</li>').join('') + '</ul></div>' : '') +
        (rn.note ? '<div class="sn-note">' + rn.note + '</div>' : '') +
      '</div>';
    }

    h += '<button class="co-pointer" data-point="' + i + '">✅ Je suis à ' + court(s.nom) + '</button>';
  }

  h += '<div class="co-actions">' +
    '<button class="panik" id="btnPanic">🧭 Ça va mal</button>' +
    '<button id="btnRalenti" class="' + (course.ralenti ? 'on' : '') + '">' +
      (course.ralenti ? 'Je ralentis ✓' : 'Je ralentis') + '</button></div>';

  if (course.pointages.length) {
    const planA = jalonsHoraires(PLAN_A);
    h += '<div class="titre">Pointages</div><div class="carte">' +
      course.pointages.map(p => {
        const t = new Date(p.t);
        const ec = t - planA[p.i + 1].date;
        const pile = Math.abs(ec) < 60000;
        return '<div class="hi"><b>' + hhmm(t) + '</b><div class="n">' + court(SECTIONS[p.i].nom) + '</div>' +
          '<div class="ec ' + (ec <= 0 ? 'avance' : 'retard') + '">' +
            (pile ? "pile sur A" : (ec < 0 ? '' : '+') + dureeTxt(ec) + ' / A') + '</div></div>';
      }).join('') +
      '</div><div class="co-actions"><button id="btnUndo">Annuler le dernier</button>' +
      '<button id="btnReset">Tout effacer</button></div>';
  }

  if (simu) h += barreSimu;
  else h += '<div class="co-simu"><span>Mise au point</span><div class="lignes">' +
    '<button data-simu="2026-08-28T09:16">rejouer la course</button></div></div>';

  return h;
}

let signatureCourse = '';

function majCourse(force) {
  const hote = document.getElementById('courseHote');
  if (!hote) return;
  const now = maintenant();
  const sig = hhmm(now) + '|' + course.pointages.length + '|' + course.ralenti + '|' +
    Object.keys(course.vues).join() + '|' + etat.scenario + '|' + (now < DEPART);
  if (!force && sig === signatureCourse) return;
  signatureCourse = sig;
  // le rendu se refait a chaque minute : on ne bouge pas sous les doigts
  const y = window.scrollY;
  hote.innerHTML = traceCourse();
  brancheCourse();
  if (window.scrollY !== y) window.scrollTo(0, y);
}

function brancheCourse() {
  const q = (sel, fn) => document.querySelectorAll(sel).forEach(fn);

  q('#courseHote [data-point]', b => b.addEventListener('click', () => {
    course.pointages.push({ i: +b.dataset.point, t: maintenant().toISOString() });
    sauveCourse(); majCourse(true);
  }));

  q('#courseHote [data-vu]', b => b.addEventListener('click', () => {
    course.vues[b.dataset.vu] = true; sauveCourse(); majCourse(true);
  }));

  q('#courseHote [data-simu]', b => b.addEventListener('click', () => {
    const v = b.dataset.simu;
    simuler(v === 'reel' ? null : v);
    dernierCompte = '';
    if (!store.get('theme', null)) appliqueTheme();
    majCompte(); majCourse(true);
  }));

  const panic = document.getElementById('btnPanic');
  if (panic) panic.addEventListener('click', ouvrePanic);

  const ral = document.getElementById('btnRalenti');
  if (ral) ral.addEventListener('click', () => {
    course.ralenti = !course.ralenti; sauveCourse(); majCourse(true);
  });

  const undo = document.getElementById('btnUndo');
  if (undo) undo.addEventListener('click', () => {
    course.pointages.pop(); sauveCourse(); majCourse(true);
  });

  const reset = document.getElementById('btnReset');
  if (reset) reset.addEventListener('click', () => {
    course.pointages = []; course.vues = {}; course.ralenti = false;
    sauveCourse(); majCourse(true);
  });
}

/* ---- panic card ---- */

function ouvrePanic() {
  const i = prochainIndex();
  const marge = i >= 0 ? barrieres()[i] - etas()[i] : (barrieres()[8] - new Date(dernierPointage().t));

  const entete = marge > 0
    ? 'Tu as ' + dureeTxt(marge) + ' de marge'
    : 'Barrière dépassée de ' + dureeTxt(-marge);

  let h = '<div class="pk-mantra"><span class="pk-marge">' + entete + '</span>' +
    PANIC.mantra + '</div>';

  h += PANIC.arbre.map(b =>
    '<div class="pk-branche ' + (b.n === 'vert' ? '' : b.n) + '">' +
    '<b>' + (b.n === 'vert' ? '🟢' : b.n === 'orange' ? '🟠' : '🔴') + ' ' + b.t + '</b>' +
    '<i>' + b.q + '</i><p>' + b.a + '</p></div>').join('');

  h += '<div class="fi-titre">Protocole pieds, au ravito</div><ol class="pk-etapes">' +
    PANIC.protocole.map(p => '<li>' + p + '</li>').join('') + '</ol>';

  ouvreFeuille('Ça va mal', h);
}

/* ==================== feuille de course (papier) ==================== */

// Un roadbook dense, pense pour etre plie et lu a la frontale, sans telephone.
function traceFeuilleCourse() {
  const b = barrieres();
  const jourB = jalonsHoraires(PLAN_B);

  let lignes = '<tr class="fc-poste depart"><td class="p">Courmayeur</td><td>0</td><td></td>' +
    '<td class="t">' + hhmm(DEPART) + '</td><td></td><td></td><td></td></tr>';

  SECTIONS.forEach((s, i) => {
    const a = PLAN_A.rows[i];
    lignes += '<tr class="fc-sec"><td colspan="7">' +
      '<b>' + kmFmt(s.km) + ' km</b> &#183; +' + s.dplus.toLocaleString('fr-FR') + ' m &#183; -' +
      s.dminus.toLocaleString('fr-FR') + ' m &#183; <b>' + a.section + '</b>' +
      (s.sommet ? ' &#183; ' + s.sommet : '') +
      '<i>' + s.consigne + '</i></td></tr>';

    lignes += '<tr class="fc-poste' + (s.arret === 'grand' ? ' grand' : '') + '">' +
      '<td class="p">' + court(s.nom) + '</td>' +
      '<td>' + kmFmt(s.cumKm) + '</td>' +
      '<td>' + (s.arretMin ? s.arretMin + "'" : '') + '</td>' +
      '<td class="t">' + a.horloge + '</td>' +
      '<td class="b">' + a.barriere + '</td>' +
      '<td class="m">' + a.marge + '</td>' +
      '<td class="pb">' + hhmm(jourB[i + 1].date) + '</td></tr>';

    if (s.todo && s.todo.length) {
      lignes += '<tr class="fc-todo"><td colspan="7"><b>' + court(s.nom).toUpperCase() + '</b>' +
        s.todo.map(t => '<span>&#9744; ' + t + '</span>').join('') + '</td></tr>';
    }
  });

  const tableau = '<table class="fc-tab"><thead><tr>' +
    '<th>Poste</th><th>km</th><th>arrêt</th><th>cible A</th><th>barrière</th><th>marge</th><th>plan B</th>' +
    '</tr></thead><tbody>' + lignes + '</tbody></table>';

  const regles = '<div class="fc-bloc"><h3>Les 5 règles</h3><ol class="fc-regles">' +
    REGLES.map(r => '<li>' + r.t + '</li>').join('') + '</ol></div>';

  const nutri = '<div class="fc-bloc"><h3>Nutrition</h3>' +
    '<p><b>' + NUT.meta.cibleGlucidesParHeure + ' g/h</b><br>' + NUT.meta.regleOr + '</p>' +
    '<p class="fc-cadre"><b>Champex &#8594; Trient : 16,5 km, 3h05, aucun ravito.</b> ' +
      'Prendre du salé au départ de Champex : pain, TUC, fromage. ' +
      'L\'écœurement du sucré arrive entre la 11e et la 14e heure, ' +
      'c\'est-à-dire exactement là.</p>' +
    '<p>' + NUT.cafeine.filter(c => c.n !== 'R').map(c =>
      '<b>Café ' + c.n + '</b> ' + c.ou + ' ' + c.quand).join(' &#183; ') + '</p>' +
    '<p class="fc-petit">Zéro caféine avant Champex &#183; espacer de 2 h minimum &#183; ' +
      'les caféinés dans un sachet à part, illisibles à la frontale</p>' +
    '<p><b>Départ</b> ' + NUT.repartition.depart.contenu.join(' &#183; ') +
      '<br><b>Champex</b> ' + NUT.repartition.champex.contenu.join(' &#183; ') + '</p>' +
    '<p class="fc-menu">' + NAAK.map(p => p.n.replace('Ultra Energy ', '').replace('Energy ', '') +
      ' ' + p.g + ' g').join(' &#183; ') + '</p></div>';

  // Le froid de nuit en altitude est le vrai risque thermique, pas la chaleur.
  const froid = '<div class="fc-bloc"><h3>Le froid, les gants</h3>' +
    '<p class="fc-cadre"><b>' + SAC.gants.regleUnique + '</b></p>' +
    '<ol class="fc-regles">' + SAC.gants.paliers.map(x =>
      '<li><b>' + x.conditions + '</b> &#183; ' + x.config + '</li>').join('') + '</ol>' +
    '<p class="fc-petit">Le point bas thermique : Tête aux Vents vers 03:30, ' +
      '0 à 4 °C, après 18 h d\'effort, en mouvement lent.</p>' +
    '<p><b>Champex</b> ' + SAC.longsChauds.principe + '</p>' +
    '<p class="fc-petit">Téléphone : mode économie, Wi-Fi et Bluetooth coupés, ' +
      'luminosité au minimum, contre le corps la nuit, recharge à Champex. ' +
      'Il reste allumé et joignable, c\'est du matériel obligatoire.</p></div>';

  const panic = '<div class="fc-bloc fc-panic"><h3>Si ça va mal</h3>' +
    '<p class="fc-mantra">' + PANIC.mantra + '</p>' +
    PANIC.arbre.map(x => '<p><b>' + (x.n === 'vert' ? '(V)' : x.n === 'orange' ? '(O)' : '(R)') + ' ' +
      x.t + '</b> ' + x.a + '</p>').join('') +
    '<p><b>Protocole pieds :</b> ' + PANIC.protocole.map((p, i) => (i + 1) + '. ' + p).join(' ') + '</p></div>';

  // profil statique, sans interaction, pour le verso
  const PW = 700, PPAD = 4, PTOP = 18, PBASE = 152;
  const fx = k => PPAD + (k / PROFIL.kmTotal) * (PW - PPAD * 2);
  const fy = a => PBASE - ((a - A_MIN) / (A_MAX - A_MIN)) * (PBASE - PTOP);
  let dp = '';
  PROFIL.points.forEach(([k, a], i) => { dp += (i ? 'L' : 'M') + fx(k).toFixed(1) + ' ' + fy(a).toFixed(1) + ' '; });
  const xn = fx(RACE.nuit.kmEstime);
  // etiquettes sur deux rangees alternees : neuf noms sur 700 unites se
  // chevauchent sur une seule ligne
  const pastilles = SECTIONS.map((s, i) => {
    const x = fx(s.cumKm);
    const y = PBASE + 11 + (i % 2) * 10;
    const ancre = i === SECTIONS.length - 1 ? 'end' : 'middle';
    return '<circle cx="' + x.toFixed(1) + '" cy="' + fy(altAt(s.cumKm)).toFixed(1) + '" r="' +
      (s.arret === 'grand' ? 4 : 2.8) + '" fill="#fff" stroke="#17153B" stroke-width="1.6"/>' +
      '<line class="fcp-tick" x1="' + x.toFixed(1) + '" y1="' + PBASE + '" x2="' + x.toFixed(1) +
        '" y2="' + (y - 7) + '"/>' +
      '<text class="fcp-l" x="' + x.toFixed(1) + '" y="' + y + '" text-anchor="' + ancre + '">' +
      court(s.nom) + '</text>';
  }).join('');

  const profil = '<div class="fc-bloc fc-profil"><h3>Le profil</h3>' +
    '<svg viewBox="0 0 ' + PW + ' 178" class="fcp">' +
      '<path d="' + dp + 'L' + fx(PROFIL.kmTotal).toFixed(1) + ' ' + PBASE + ' L' + PPAD + ' ' + PBASE + ' Z" class="fcp-a"/>' +
      '<rect class="fcp-n" x="' + xn.toFixed(1) + '" y="' + PTOP + '" width="' + (PW - PPAD - xn).toFixed(1) +
        '" height="' + (PBASE - PTOP) + '"/>' +
      '<path d="' + dp + '" class="fcp-t"/>' +
      '<line class="fcp-nl" x1="' + xn.toFixed(1) + '" y1="' + PTOP + '" x2="' + xn.toFixed(1) + '" y2="' + PBASE + '"/>' +
      '<text class="fcp-l" x="' + (xn + 4).toFixed(1) + '" y="' + (PTOP - 4) + '">nuit ~20:30</text>' +
      pastilles +
    '</svg></div>';

  return '<div class="fc-tete">' +
      '<div class="fc-titre">CCC <b>4330</b></div>' +
      '<div class="fc-faits">vendredi 28 août &#183; départ <b>' + hhmm(DEPART) + '</b> Courmayeur &#183; vague 2 &#183; ' +
        kmFmt(RACE.distanceKm) + ' km &#183; ' + RACE.dplus.toLocaleString('fr-FR') +
        ' m D+ &#183; barrière finale <b>' + hhmm(FIN) + '</b> &#183; cible ' +
        SCENARIOS[0].label.replace('Cible ', '') + '</div>' +
    '</div>' + tableau +
    '<div class="fc-verso">' + profil +
      '<div class="fc-colonnes">' + regles + nutri + froid + '</div>' + panic + '</div>';
}

/* ============================ nutrition ============================ */

function traceNutrition() {
  const m = NUT.meta;
  let h = '<div class="nu-gros">' +
      '<div><b>' + m.cibleGlucidesParHeure + '</b><i>g/h</i><span>la cadence</span></div>' +
      '<div><b>1 400</b><i>g</i><span>sur la course</span></div>' +
    '</div>' +
    '<div class="nu-regle">' + m.regleOr + '<span>' + m.pourquoi + '</span></div>';

  h += '<div class="nu-sec"><span>Les flasques</span><p class="nu-fl-t">' + NUT.portage.flasques + '</p></div>';

  h += '<div class="nu-sec"><span>La caféine</span>' +
    NUT.cafeine.map(c => '<div class="nu-cf' + (c.n === 'R' ? ' res' : '') + '"><b>' + c.n + '</b>' +
      '<div class="nu-cf-c"><b>' + c.ou + '</b><small>' + c.pourquoi + '</small></div>' +
      '<i>' + c.quand + '</i></div>').join('') +
    '<p class="nu-rech">' + (NUT.cafeineMgParGel
      ? NUT.cafeineMgParGel + ' mg par gel.'
      : 'Les mg par gel restent à relever sur l\'étiquette, lundi chez TraKKs.') +
    '</p></div>';

  h += '<div class="nu-sec"><span>Les deux sacs</span>' +
    [NUT.repartition.depart, NUT.repartition.champex].map(s =>
      '<div class="nu-ch"><b>' + s.label + '</b><ul class="nu-ul">' +
      s.contenu.map(c => '<li>' + c + '</li>').join('') + '</ul></div>').join('') +
    '<div class="nu-ch"><b>Dans le sac de Champex, hors nourriture</b><ul class="nu-ul">' +
      NUT.portage.sacChampex.contenu.filter(c => !/gels|barres|ziplocks/i.test(c))
        .map(c => '<li>' + c + '</li>').join('') + '</ul></div>' +
    '<p class="nu-rech">' + NUT.portage.note + '</p></div>';

  h += '<div class="nu-sec"><span>Les cinq règles</span><ol class="nu-reg">' +
    NUT.reglesAbsolues.map(r => '<li>' + r + '</li>').join('') + '</ol></div>';

  h += '<details class="nu-det"><summary>Ce que vaut chaque Näak</summary>' +
    '<table class="nu-tab"><tr><th></th><th>gluc</th><th>kcal</th></tr>' +
    NAAK.map(p => '<tr><td><b>' + p.n + '</b><small>' + p.u + ' &#183; ' + p.note + '</small></td>' +
      '<td>' + p.g + ' g</td><td>' + p.kcal + '</td></tr>').join('') +
    '</table><p class="nu-src">' + NAAK_SOURCE + '. Ces valeurs sont celles de la gamme ' +
    'Ultra Energy ; les gels Boost que tu achètes lundi peuvent différer, d\'où l\'étiquette à lire.</p></details>';

  return h;
}

/* ==================== nutrition : plan officiel ====================
   Source : nutrition-data.js, bati sur le PDF officiel UTMB 2026.
   Les huit sections portent leur propre besoin en glucides et le contenu
   reel du poste qui les termine. */

/* 3. les alertes, en bandeau permanent */
function traceAlertes() {
  const crit = NUT.alertes.filter(a => a.niveau === 'critique');
  const info = NUT.alertes.filter(a => a.niveau !== 'critique');
  return document.getElementById('alertesHote').innerHTML =
    crit.map(a => '<div class="al al-crit"><div class="al-i">' + a.icone + '</div>' +
      '<div><b>' + a.titre + '</b><p>' + a.texte + '</p></div></div>').join('') +
    '<details class="carte al-plus"><summary>Deux rappels de plus</summary>' +
      info.map(a => '<div class="al al-info"><div class="al-i">' + a.icone + '</div>' +
        '<div><b>' + a.titre + '</b><p>' + a.texte + '</p></div></div>').join('') +
    '</details>';
}

/* 4. le compte des glucides, section par section */
function traceBilan() {
  const besoin = NUT.sections.reduce((s, x) => s + x.besoinG, 0);
  const apport = NUT.sections.reduce((s, x) => s + x.apportG, 0);
  const ecart = apport - besoin;
  const pct = Math.min(100, Math.round((apport / besoin) * 100));
  const auto = NUT.sections.filter(s => s.autonomieRequise);

  return document.getElementById('bilanHote').innerHTML =
    '<div class="bl-h"><div><span>ce que le plan apporte</span><b>' + apport + ' g</b></div>' +
      '<div><span>ce que la course demande</span><b>' + besoin + ' g</b></div></div>' +
    '<div class="ck-piste"><i style="width:' + pct + '%"></i></div>' +
    '<div class="bl-t">' + (ecart < 0
      ? '<b>' + Math.abs(ecart) + ' g de moins</b> que la cible sur les ' +
        SCENARIOS[0].label.replace('Cible ~', '') + ', soit environ ' +
        Math.round(Math.abs(ecart) / NUT.meta.dureeCibleH) + ' g par heure. C\'est assumé : la première section ' +
        'vise 55 à 60 g/h, pas 70.'
      : 'Le plan couvre la cible.') + '</div>' +
    '<div class="bl-avert"><b>' + auto.length + ' sections sans aucun ravito :</b> ' +
      auto.map(s => s.de + ' vers ' + s.vers + ' (' + s.duree + ')').join(' et ') +
      '. Sur celles-là, ce que tu n\'as pas sur le dos, tu ne l\'auras pas.</div>';
}

/* 1 et 2. pacing et nutrition, avec la fiche du poste qui termine la section */
function traceSectionsNut() {
  return document.getElementById('secNutHote').innerHTML = NUT.sections.map((s, i) => {
    const r = s.ravito;
    const manque = s.apportG - s.besoinG;

    let h = '<div class="sn' + (s.autonomieRequise ? ' auto' : '') + '">' +
      '<div class="sn-tete"><div class="sn-trajet"><b>' + s.de + '</b><i>&#8594;</i><b>' + s.vers + '</b></div>' +
        '<div class="sn-chiffres">' + kmFmt(s.km) + ' km &#183; ' + s.duree + ' &#183; arrivée ' + s.eta + '</div></div>';

    if (s.viaPointage) h += '<div class="sn-point">Au passage : ' + s.viaPointage + '</div>';

    h += '<div class="sn-g"><div><span>besoin</span><b>' + s.besoinG + ' g</b></div>' +
      '<div><span>apporté</span><b class="' + (manque < 0 ? 'chaud' : 'ok') + '">' + s.apportG + ' g</b></div>' +
      '<div class="sn-porte"><span>porté</span><p>' + s.porte + '</p></div></div>';

    if (s.alerte) h += '<div class="sn-al">' + s.alerte + '</div>';

    h += '<div class="sn-bloc"><span>En courant</span><ul>' +
      s.enCourant.map(c => '<li>' + c + '</li>').join('') + '</ul></div>';

    h += '<div class="sn-rav' + (r.assistance ? ' assist' : '') + '">' +
      '<div class="sn-rav-h"><b>' + r.nom + '</b><i>' + r.duree + '</i></div>' +
      '<div class="sn-rav-t">' + r.type + (r.assistance ? ' &#183; assistance équipe' : '') + '</div>';

    if (r.surPlace.length) h += '<div class="sn-l oui"><span>Sur place</span><ul>' +
      r.surPlace.map(x => '<li>' + x + '</li>').join('') + '</ul></div>';
    if (r.eviter.length) h += '<div class="sn-l non"><span>À éviter</span><ul>' +
      r.eviter.map(x => '<li>' + x + '</li>').join('') + '</ul></div>';
    if (r.note) h += '<div class="sn-note">' + r.note + '</div>';

    h += '</div></div>';
    return h;
  }).join('');
}

/* 5. l'inventaire remplace la liste d'achat : le stock est ferme depuis le 17. */
const listeAchatTout = () => NUT.listeAchat.trakks.concat(NUT.listeAchat.maison);

/* ==================== voyage et logistique ====================
   Source : voyage-data.js. Le trou de la prepa : le 26 aout, trois
   correspondances sur dix heures, avec un maillon faible identifie. */

let voyMode = store.get('voyMode', 'aller');

const battClasse = n => n < 30 ? 'chaud' : (n < 60 ? 'tiede' : 'ok');

function segTrain(s) {
  const t = { train: '🚄', bus: '🚌', avion: '✈️', arrivee: '🏠' }[s.type] || '•';
  return '<div class="vy vy-' + s.type + '">' +
    '<div class="vy-h"><b>' + (s.depart || '') + '</b>' +
    (s.arrivee ? '<i>&#8594; ' + s.arrivee + '</i>' : '') +
    (s.duree ? '<em>' + s.duree + '</em>' : '') + '</div>' +
    '<div class="vy-c"><div class="vy-t">' + t + ' ' + s.de + ' &#8594; ' + s.vers + '</div>' +
    (s.ref ? '<div class="vy-ref">' + s.ref + '</div>' : '') +
    (s.date ? '<div class="vy-ref alerte">' + s.date + '</div>' : '') +
    (s.bagages ? '<div class="vy-ref">' + s.bagages + '</div>' : '') +
    (s.alerte ? '<div class="vy-al">' + s.alerte + '</div>' : '') +
    (s.aFaire ? '<ul class="vy-l">' + s.aFaire.map(x => '<li>' + x + '</li>').join('') + '</ul>' : '') +
    '</div></div>';
}

function segCorr(s) {
  return '<div class="vy-corr ' + battClasse(s.battement) + '">' +
    '<div class="vy-corr-h"><span>Correspondance</span><b>' + s.battementLabel + '</b></div>' +
    '<div class="vy-corr-t">' + s.de + ' &#8594; ' + s.vers + '</div>' +
    (s.alerte ? '<div class="vy-al">' + s.alerte + '</div>' : '') +
    '<ul class="vy-l">' + s.aFaire.map(x => '<li>' + x + '</li>').join('') + '</ul></div>';
}

function traceVoyage() {
  const a = VOYAGE.aller;
  document.getElementById('voyAlerte').innerHTML =
    '<div class="al al-crit vy-reveal"><div class="al-i">👟</div><div>' +
    '<b>Pas les Reveal le 26</b><p>' + VOYAGE.meta.risquePrincipal + '</p></div></div>';

  let h = '';
  if (voyMode === 'aller') {
    // compte a rebours discret vers le prochain segment, le jour meme
    const now = maintenant();
    let prochain = '';
    if (minuit(now).getTime() === dateDe(a.date).getTime()) {
      const suiv = a.segments.filter(s => s.depart && s.depart.match(/^\d\d:/))
        .map(s => ({ s, t: horaireVersDate(s.depart, new Date(now.getTime() - 86400000)) }))
        .find(x => x.t > now);
      if (suiv) prochain = '<div class="vy-next">Prochain segment dans <b>' +
        dureeTxt(suiv.t - now) + '</b> &#183; ' + suiv.s.de + '</div>';
    }

    h = prochain + '<div class="carte vy-tete"><b>' + a.label + '</b>' +
      '<div class="vy-duree">' + a.dureeTotale + '</div>' +
      '<div class="vy-conflit">' + a.conflitAgenda + '</div></div>' +
      a.segments.map(s => s.type === 'correspondance' ? segCorr(s) : segTrain(s)).join('') +
      '<div class="titre">Sur moi dans le train</div><div class="ck-liste carte-l">' +
      a.surMoiDansLeTrain.map(i =>
        '<button class="sk' + (i.crit ? ' sk-reglementaire' : ' sk-perso') +
        (coche(i.id) ? ' ok' : '') + '" data-voyck="' + i.id + '">' +
        '<i class="ck-box"></i><span class="sk-t">' + i.txt +
        (i.detail ? '<small>' + i.detail + '</small>' : '') + '</span></button>').join('') +
      '</div>' +
      '<div class="titre">Documents hors ligne</div><div class="ck-liste carte-l">' +
      VOYAGE.documentsHorsLigne.map(d =>
        '<button class="sk' + (d.crit ? ' sk-reglementaire' : '') + (coche(d.id) ? ' ok' : '') +
        '" data-voyck="' + d.id + '"><i class="ck-box"></i><span class="sk-t">' + d.txt +
        (d.detail ? '<small>' + d.detail + '</small>' : '') + '</span></button>').join('') +
      '</div>';

  } else if (voyMode === 'place') {
    h = VOYAGE.surPlace.map(j => {
      const d = dateDe(j.date);
      return '<div class="titre">' + j.label + '</div><div class="carte vy-jour">' +
        j.bloc.map(b => '<div class="vy-b' + (b.crit ? ' crit' : '') + '">' +
          '<b>' + b.h + '</b><div><p>' + b.quoi + '</p>' +
          (b.detail ? '<small>' + b.detail + '</small>' : '') + '</div></div>').join('') +
        '</div>';
    }).join('');

  } else {
    // l'incoherence de dates est levee depuis le 18 : le bandeau devient un
    // constat, plus une alerte
    h = '<div class="al al-ok"><div class="al-i">✅</div><div><b>Dates cohérentes</b>' +
      '<p>' + VOYAGE.retour.resolu.replace('\u2705 ', '') + '</p>' +
      '<small class="vy-renvoi">' + VOYAGE.retour.renvoi + '</small></div></div>' +
      '<div class="vy-marge">' + VOYAGE.retour.marge + '</div>' +
      VOYAGE.retour.segments.map(segTrain).join('') +
      '<div class="titre">À régler</div><div class="ck-liste carte-l">' +
      VOYAGE.retour.aFaire.map(i =>
        '<button class="sk' + (i.crit ? ' sk-reglementaire' : '') + (coche(i.id) ? ' ok' : '') +
        '" data-voyck="' + i.id + '"><i class="ck-box"></i><span class="sk-t">' + i.txt +
        '</span></button>').join('') + '</div>';
  }

  h += '<div class="titre">Contacts</div><div class="carte">' +
    VOYAGE.contacts.map(c => '<div class="vy-ct"><b>' + c.qui + '</b><span>' + c.num + '</span></div>').join('') +
    '</div>';

  document.getElementById('voyHote').innerHTML = h;
  document.querySelectorAll('#voyMode button').forEach(b =>
    b.classList.toggle('on', b.dataset.voy === voyMode));
  document.querySelectorAll('#voyHote [data-voyck]').forEach(b =>
    b.addEventListener('click', () => { basculeCoche(b.dataset.voyck); traceVoyage(); }));
}

document.addEventListener('click', e => {
  const v = e.target.closest('#voyMode button');
  if (v) { voyMode = v.dataset.voy; store.set('voyMode', voyMode); traceVoyage(); }
});

/* ==================== le coffre ====================
   Les references de reservation, l'adresse du logement, les cautions : tout
   cela vit dans un depot PUBLIC. La seule reponse honnete est de ne jamais y
   ecrire le clair. `prive-data.js` ne contient que du chiffre, la phrase de
   passe n'existe que dans la tete de Pierre, et le dechiffrement se fait ici,
   dans le telephone, hors ligne.

   Le coffre reste ouvert le temps de la session et pas une seconde de plus :
   rien n'est ecrit dans localStorage, un rechargement redemande la phrase. */

let coffre = null;          // le clair, en memoire vive uniquement
let cleVive = null;         // la cle derivee, le temps de la session
let coffreEnCours = false;

const b64Vers = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));

async function cleDuCoffre(phrase) {
  const base = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(phrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64Vers(PRIVE.kdf.sel), iterations: PRIVE.kdf.tours, hash: PRIVE.kdf.hash },
    // 'encrypt' en plus : la meme cle sert aux pieces que Pierre ajoute lui-meme
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function ouvreCoffre(phrase) {
  const k = await cleDuCoffre(phrase);
  const brut = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64Vers(PRIVE.chiffre.iv) }, k, b64Vers(PRIVE.chiffre.donnees));
  return JSON.parse(new TextDecoder().decode(brut));
}

/* Les pieces jointes vivent dans un second fichier, charge seulement quand le
   coffre s'ouvre : inutile de trainer un mega-octet de billets a chaque
   demarrage. Une fois dechiffres, ils restent en memoire sous forme d'URL
   d'objet, revoquees a la fermeture. */
let docs = null;          // { id -> {nom, type, url} }
let docsCharges = false;

async function chargeDocs(cle) {
  if (docsCharges) return;
  docsCharges = true;
  let mod;
  try { mod = await import('./prive-docs.js'); }
  catch (e) { return; }                     // pas de pieces jointes deployees
  const b = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));
  docs = {};
  for (const p of (mod.DOCS && mod.DOCS.pieces) || []) {
    try {
      const oct = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: b(p.iv) }, cle, b(p.donnees));
      const estTexte = /^text\/|markdown/.test(p.type) || /\.md$/i.test(p.nom);
      docs[p.id] = {
        nom: p.nom, type: p.type, taille: p.taille,
        octets: estTexte ? new Uint8Array(oct) : null,
        url: URL.createObjectURL(new Blob([oct], { type: estTexte ? 'text/plain' : p.type }))
      };
    } catch (e) { /* une piece illisible n'empeche pas les autres */ }
  }
}

function libereDocs() {
  if (docs) Object.values(docs).forEach(d => URL.revokeObjectURL(d.url));
  docs = null; docsCharges = false;
}

/* Rendu markdown minimal : titres, listes, citations, tableaux, gras, code.
   Les notes de Pierre en sont pleines et il faut pouvoir les lire dans l'app,
   hors ligne, sans embarquer de bibliotheque. */
function md(txt) {
  const ech = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const enligne = t => ech(t)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  const lignes = txt.split('\n');
  let h = '', liste = null, tableau = null, citation = false;

  const fermeListe = () => { if (liste) { h += '</' + liste + '>'; liste = null; } };
  const fermeTableau = () => { if (tableau) { h += '</table>'; tableau = null; } };
  const fermeCitation = () => { if (citation) { h += '</blockquote>'; citation = false; } };
  const fermeTout = () => { fermeListe(); fermeTableau(); fermeCitation(); };

  for (let l of lignes) {
    const brut = l;
    l = l.replace(/\s+$/, '');

    if (/^\s*$/.test(l)) { fermeTout(); continue; }

    // tableau : on ignore la ligne de separation
    if (/^\s*\|/.test(l)) {
      if (/^\s*\|[\s:|-]+\|?\s*$/.test(l)) continue;
      const cell = l.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim());
      if (!tableau) { fermeListe(); fermeCitation(); h += '<table class="md-t">'; tableau = 'th'; }
      const b = tableau === 'th' ? 'th' : 'td';
      h += '<tr>' + cell.map(c => '<' + b + '>' + enligne(c) + '</' + b + '>').join('') + '</tr>';
      tableau = 'td';
      continue;
    }
    fermeTableau();

    let m;
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) {
      fermeTout();
      const n = Math.min(m[1].length, 4);
      h += '<h' + n + '>' + enligne(m[2]) + '</h' + n + '>';
      continue;
    }
    if (/^\s*(---+|===+|\*\*\*+)\s*$/.test(l)) { fermeTout(); h += '<hr>'; continue; }

    if ((m = l.match(/^>\s?(.*)$/))) {
      fermeListe(); fermeTableau();
      if (!citation) { h += '<blockquote>'; citation = true; }
      h += '<p>' + enligne(m[1]) + '</p>';
      continue;
    }
    fermeCitation();

    if ((m = l.match(/^\s*[-*+]\s+(.*)$/))) {
      if (liste !== 'ul') { fermeListe(); h += '<ul>'; liste = 'ul'; }
      h += '<li>' + enligne(m[1]) + '</li>';
      continue;
    }
    if ((m = l.match(/^\s*\d+[.)]\s+(.*)$/))) {
      if (liste !== 'ol') { fermeListe(); h += '<ol>'; liste = 'ol'; }
      h += '<li>' + enligne(m[1]) + '</li>';
      continue;
    }
    fermeListe();
    h += '<p>' + enligne(brut.trim()) + '</p>';
  }
  fermeTout();
  return h;
}

function ouvreDoc(id) {
  const d = docs && docs[id];
  if (!d) return;
  // on prefere le nom de la fiche au nom de fichier
  const fiche = coffre && coffre.documents && coffre.documents.find(x => x.id === id);
  if (fiche) d.titre = fiche.nom;
  const image = /^image\//.test(d.type);
  const texte = /^text\/|markdown|\.md$/.test(d.type) || /\.md$/i.test(d.nom);

  if (texte) {
    let brut = '';
    try { brut = new TextDecoder().decode(d.octets); } catch (e) { brut = ''; }
    ouvreFeuille(d.titre || d.nom,
      '<div class="md">' + md(brut) + '</div>');
    return;
  }

  // Les PDF dans un cadre embarque ne s'affichent pas de facon fiable, ni ici
  // ni sur iOS : on les ouvre en plein ecran, ou le lecteur natif prend le
  // relais. Les images, elles, s'affichent tout de suite.
  ouvreFeuille(d.titre || d.nom,
    (image
      ? '<div class="dv"><img src="' + d.url + '" alt=""></div>'
      : '<div class="dv dv-pdf"><b>PDF</b><span>' +
        (d.taille > 1024 ? Math.round(d.taille / 1024) + ' Ko' : d.taille + ' o') +
        '</span></div>') +
    '<a class="dn-btn plein large" href="' + d.url + '" target="_blank" rel="noopener">' +
      (image ? 'Ouvrir en plein ecran' : 'Ouvrir le document') + '</a>' +
    '<p class="dv-n">Ce fichier est dans le coffre, pas sur le réseau. ' +
      'Il reste lisible sans aucune connexion.</p>');
}

/* ==================== ce que Pierre ajoute lui-meme ====================
   Une piece ajoutee depuis le telephone ne repart PAS dans le depot public :
   elle reste sur l'appareil, chiffree avec la meme phrase, dans IndexedDB.
   C'est le bon endroit pour une copie de carte d'identite. */

const RESERVE = 'ccc-coffre', MAGASIN = 'pieces';

function ouvreBase() {
  return new Promise((ok, ko) => {
    const d = indexedDB.open(RESERVE, 1);
    d.onupgradeneeded = () => {
      if (!d.result.objectStoreNames.contains(MAGASIN)) d.result.createObjectStore(MAGASIN, { keyPath: 'cle' });
    };
    d.onsuccess = () => ok(d.result);
    d.onerror = () => ko(d.error);
  });
}

function transaction(mode, fn) {
  return ouvreBase().then(db => new Promise((ok, ko) => {
    const t = db.transaction(MAGASIN, mode);
    const r = fn(t.objectStore(MAGASIN));
    t.oncomplete = () => ok(r && r.result !== undefined ? r.result : r);
    t.onerror = () => ko(t.error);
  }));
}

async function chargeLocaux() {
  if (!cleVive) return;
  let lignes = [];
  try { lignes = await transaction('readonly', m => m.getAll()) || []; } catch (e) { return; }
  docs = docs || {};
  for (const l of lignes) {
    try {
      const oct = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(l.iv) }, cleVive, l.donnees);
      const estTexte = /^text\/|markdown/.test(l.type);
      docs[l.cle] = {
        nom: l.nom, type: l.type, taille: l.taille, local: true, ajoute: l.ajoute,
        octets: estTexte ? new Uint8Array(oct) : null,
        url: URL.createObjectURL(new Blob([oct], { type: estTexte ? 'text/plain' : l.type }))
      };
    } catch (e) { /* une piece illisible n'empeche pas les autres */ }
  }
}

/* Une photo de carte d'identite fait 3 a 5 Mo : on la reduit avant de la
   chiffrer, sinon la reserve du navigateur sature pour rien. */
async function reduitImage(fichier, cote = 1800, qualite = 0.72) {
  if (!/^image\//.test(fichier.type) || /svg/.test(fichier.type)) return fichier;
  try {
    const bmp = await createImageBitmap(fichier);
    const r = Math.min(1, cote / Math.max(bmp.width, bmp.height));
    if (r === 1 && fichier.size < 700000) return fichier;
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * r); c.height = Math.round(bmp.height * r);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', qualite));
    return blob && blob.size < fichier.size ? blob : fichier;
  } catch (e) { return fichier; }
}

async function ajouteLocal(fichier, cible) {
  if (!cleVive) return;
  const petit = await reduitImage(fichier);
  const oct = new Uint8Array(await petit.arrayBuffer());
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const chiffre = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cleVive, oct);
  const cle = cible || ('local-' + isoLocal(new Date()) + '-' + Math.round(oct.length % 9973));
  await transaction('readwrite', m => m.put({
    cle, nom: fichier.name || 'document', type: petit.type || fichier.type || 'application/octet-stream',
    taille: oct.length, iv: Array.from(iv), donnees: chiffre, ajoute: isoLocal(new Date())
  }));
  if (docs && docs[cle] && docs[cle].url) URL.revokeObjectURL(docs[cle].url);
  await chargeLocaux();
}

async function retireLocal(cle) {
  await transaction('readwrite', m => m.delete(cle));
  if (docs && docs[cle]) { URL.revokeObjectURL(docs[cle].url); delete docs[cle]; }
}

function traceCoffre() {
  const hote = document.getElementById('coffreHote');
  if (!hote) return;

  if (PRIVE.vide && !coffre) {
    // Etat vide utile : il dit ce qui viendra ici et ce qu'il reste a faire.
    hote.innerHTML =
      '<div class="cff-tete"><i>&#128274;</i><div><b>Le coffre est encore vide</b>' +
      '<small>C\'est ici que vivront tes billets, tes réservations et tes ' +
      'références, chiffrés. Ce dépôt est public, donc rien n\'y est jamais ' +
      'écrit en clair.</small></div></div>' +
      '<ul class="cf-att">' +
        '<li>Billets de train, QR Eurostar et TGV, places comprises</li>' +
        '<li>Cartes d\'embarquement FlixBus, aller et retour</li>' +
        '<li>Contremarque de la navette CCC et créneau du dossard</li>' +
        '<li>Logement, caution, assurance, vol</li>' +
        '<li>Matériel obligatoire, et la place pour ta carte d\'identité</li>' +
      '</ul>' +
      '<div class="cf-quoi">Pour le remplir : ouvrir <b>_chiffrer.html</b> ' +
      'sur le Mac, déposer les fichiers, choisir la phrase de passe. ' +
      'Ensuite tout est lisible ici, hors ligne.</div>';
    return;
  }

  if (!coffre) {
    hote.innerHTML =
      '<div class="cff-tete"><i>&#128274;</i><div><b>Reservations et references</b>' +
      '<small>Chiffre. Ce depot est public, le clair n\'y est jamais ecrit.</small></div></div>' +
      (PRIVE.indice ? '<div class="cff-indice">Indice &#183; ' + PRIVE.indice + '</div>' : '') +
      '<div class="cff-saisie">' +
        '<input id="cffPhrase" type="password" autocomplete="off" ' +
        'autocapitalize="none" autocorrect="off" spellcheck="false" ' +
        'inputmode="text" enterkeyhint="go" placeholder="Ta phrase de passe">' +
        '<button class="dn-btn plein" id="cffGo">Ouvrir</button>' +
      '</div><div id="cffMsg"></div>';

    const go = document.getElementById('cffGo');
    const champ = document.getElementById('cffPhrase');
    const msg = document.getElementById('cffMsg');

    const tente = async () => {
      // Le clavier iOS met une majuscule au premier mot et laisse parfois une
      // espace finale. On nettoie, et on essaie quelques variantes plutot que
      // de renvoyer Pierre a son clavier.
      const saisie = champ.value.trim().replace(/\s+/g, ' ');
      if (!saisie || coffreEnCours) return;
      coffreEnCours = true;
      go.disabled = true;
      msg.className = 'cff-msg attente';
      msg.textContent = 'Ouverture…';
      await new Promise(r => setTimeout(r, 20));

      const variantes = [saisie, saisie.toLowerCase(), saisie.replace(/\s+/g, ''),
                         saisie.toLowerCase().replace(/\s+/g, '')];
      let clair = null, bonne = null;
      for (const v of variantes) {
        try { clair = await ouvreCoffre(v); bonne = v; break; } catch (e) { /* suivante */ }
      }

      if (clair) {
        coffre = clair;
        cleVive = await cleDuCoffre(bonne);
        await chargeDocs(cleVive);
        await chargeLocaux();
        traceCoffre();
      } else {
        msg.className = 'cff-msg ko';
        msg.innerHTML = 'Phrase refusée.' +
          (PRIVE.stamp && PRIVE.stamp !== COFFRE_ATTENDU
            ? '<br><b>Et ton coffre est en retard</b> : il date de ' + PRIVE.stamp +
              ', l\'app attend ' + COFFRE_ATTENDU + '. Ouvre Mes données, ' +
              '« Chercher une mise à jour », puis réessaie.'
            : '<br>Quatre mots, une espace entre chaque. Les majuscules ne comptent pas.');
        champ.value = '';
        champ.focus();
      }
      coffreEnCours = false;
      if (go) go.disabled = false;
    };

    go.addEventListener('click', tente);
    champ.addEventListener('keydown', e => { if (e.key === 'Enter') tente(); });
    return;
  }

  // ---- coffre ouvert ----
  const L = coffre;
  const ligne = (k, v) => '<div class="cff-l"><span>' + k + '</span><b>' + v + '</b></div>';

  hote.innerHTML =
    '<div class="cff-haut"><div><b>Coffre ouvert</b>' +
      '<small>En memoire seulement. Un rechargement le referme.</small></div>' +
      '<button class="cff-x" id="cffFerme">Refermer</button></div>' +

    /* Les codes en premier. A Chamonix, les mains froides, devant une boite a
       cles : c'est la seule chose qu'on cherche vraiment dans ce coffre. */
    (L.codes ? '<div class="fi-titre">Les codes</div>' +
      '<div class="cff-codes">' + L.codes.map(c =>
        '<div class="cff-cd' + (c.cle ? ' cle' : '') + '"><b>' + c.code + '</b>' +
        '<span>' + c.sert + '</span></div>').join('') + '</div>' : '') +

    (L.linge && L.linge.statut ? '<div class="cff-ouvert">' +
      '<div class="cff-ouvert-h"><i>&#128681;</i><b>' + L.linge.statut + '</b></div>' +
      '<p>' + L.linge.probleme + '</p>' +
      '<div class="cff-act">' + L.linge.action + '</div>' +
      '<div class="cff-pb"><b>Plan B</b>' + L.linge.planB + '</div>' +
      '<div class="cff-dl">' + L.linge.deadline + '</div></div>' : '') +

    (L.hotelLiege ? '<div class="fi-titre">Hôtel &#183; mardi 25</div>' +
      '<div class="cff-bloc">' +
        ligne('Statut', L.hotelLiege.statut) +
        ligne('Où', L.hotelLiege.nom + ' &#183; ' + L.hotelLiege.adresse) +
        ligne('Tel', L.hotelLiege.tel) +
        ligne('Reference', L.hotelLiege.reference) +
        ligne('CODE', '<b class="cff-code">' + L.hotelLiege.codeConfidentiel + '</b>') +
        ligne('Arrivee', L.hotelLiege.arrivee) +
        ligne('Depart', L.hotelLiege.depart) +
        ligne('Chambre', L.hotelLiege.chambre) +
        ligne('Montant', L.hotelLiege.montant) +
      '</div>' +
      '<div class="cff-al attention">' + L.hotelLiege.petitDejeuner + '</div>' +
      '<ul class="cff-af">' + L.hotelLiege.aFaire.map(x => '<li>' + x + '</li>').join('') + '</ul>' +
      '<div class="cff-note">' + L.hotelLiege.note + '</div>' +
      '<div class="cff-bonus">' + L.hotelLiege.pourquoi + '</div>' : '') +

    '<div class="fi-titre">Logement</div>' +
    '<div class="cff-bloc">' +
      ligne('Statut', L.logement.statut) +
      ligne('Adresse', L.logement.adresseLogement) +
      (L.logement.acces ? ligne('Boîte à clés', L.logement.acces.ou) +
        ligne('CODE', '<b class="cff-code">' + L.logement.acces.code + '</b>') : '') +
      ligne('Remise des cles', L.logement.remiseCles) +
      ligne('Dates', L.logement.dates) +
      ligne('Montant', L.logement.montant) +
      ligne('Reference', L.logement.reference) +
      ligne('Autres refs', L.logement.referenceAlt) +
      ligne('Gestionnaire', L.logement.gestionnaire) +
      ligne('Interlocuteur', L.logement.interlocuteur) +
      ligne('Arrivee', L.logement.horaires.arrivee) +
      ligne('Depart', L.logement.horaires.depart) +
      '<div class="cff-contact">' + L.logement.contact + '</div>' +
    '</div>' +
    (L.logement.acces ? '<div class="cff-ok">' + L.logement.acces.consequence +
      '<br>' + L.logement.depart.consequence + '</div>' : '') +
    L.logement.alertes.map(a =>
      '<div class="cff-al ' + a.niveau + '">' + a.txt + '</div>').join('') +
    (L.logement.linge ? '<div class="cff-linge"><b>' + L.logement.linge.titre + '</b>' +
      '<ul>' + L.logement.linge.options.map(o => '<li>' + o + '</li>').join('') + '</ul>' +
      '<div class="cff-act">' + L.logement.linge.action + '</div></div>' : '') +
    (L.logement.taxeDeSejour ? '<div class="cff-taxe"><b>Taxe de séjour · ' +
      L.logement.taxeDeSejour.montant + '</b>' + L.logement.taxeDeSejour.probleme +
      '<div class="cff-act">' + L.logement.taxeDeSejour.solution + '</div></div>' : '') +
    (L.logement.contactAgence ? '<div class="fi-titre">Le contact</div><div class="cff-bloc">' +
      ligne('Qui', L.logement.contactAgence.nom) +
      ligne('Urgence', L.logement.contactAgence.telUrgence) +
      ligne('Mail', L.logement.contactAgence.mail) + '</div>' : '') +
    (L.logement.timingArrivee26 ? '<div class="fi-titre">L\'arrivée du 26</div>' +
      L.logement.timingArrivee26.map(t => '<div class="cff-tm"><b>' + t.h + '</b>' +
        t.quoi + '</div>').join('') +
      '<div class="cff-bonus">' + L.logement.bonusTiming + '</div>' : '') +
    (L.logement.resolues ? '<div class="fi-titre">Ce qui est refermé</div><ul class="cff-res">' +
      L.logement.resolues.map(x => '<li>' + x + '</li>').join('') + '</ul>' : '') +
    '<div class="cff-note">' + L.logement.procedure + '</div>' +
    '<div class="cff-note">' + L.logement.relanceEnvoyee + '</div>' +

    '<div class="fi-titre">Caution</div>' +
    '<div class="cff-bloc">' +
      ligne('Montant', L.caution.montant) +
      ligne('Statut', L.caution.statut) +
      ligne('Systeme', L.caution.systeme) +
      ligne('Contrat', L.caution.contrat) +
    '</div>' +
    '<div class="cff-note">' + L.caution.note + '</div>' +

    (L.responsabiliteCivile ? '<div class="cff-rc"><b>Responsabilité civile</b>' +
      '<p>' + L.responsabiliteCivile.statut + '</p>' +
      '<div class="cff-act">' + L.responsabiliteCivile.action + '</div></div>' : '') +

    (L.reglesSejour ? '<details class="cff-rg"><summary>Les règles du séjour' +
      '<span>' + L.reglesSejour.source + '</span></summary>' +
      '<div class="cff-rg-c"><b>Avant de partir</b><ul>' +
        L.reglesSejour.avantDePartir.map(x => '<li>' + x + '</li>').join('') + '</ul>' +
      '<b>Interdits</b><ul>' +
        L.reglesSejour.interdits.map(x => '<li>' + x + '</li>').join('') + '</ul>' +
      '<div class="cff-note">' + L.reglesSejour.enCasDeProbleme + '</div></div></details>' : '') +

    '<div class="fi-titre">Retour &#183; ' + L.retour.note + '</div>' +
    L.retour.segments.map(g =>
      '<div class="cff-seg"><div class="cff-seg-h"><b>' + g.de + ' &#8594; ' + g.vers + '</b>' +
      '<span>' + g.depart + ' &#8594; ' + g.arrivee + '</span></div>' +
      '<div class="cff-ref">' + g.ref + '</div>' +
      (g.statut ? '<div class="cff-note">' + g.statut + '</div>' : '') +
      (g.bagages ? '<div class="cff-note">' + g.bagages + '</div>' : '') +
      (g.outil ? '<div class="cff-outil">' + g.outil + '</div>' : '') +
      (g.alerte ? '<div class="cff-al attention">' + g.alerte + '</div>' : '') +
      '</div>').join('') +
    '<div class="cff-note">' + L.retour.marge + '</div>' +

    (L.documents ? '<div class="fi-titre">Les documents</div>' +
      ['course', 'santé', 'aller', 'sur place', 'retour', 'notes'].map(cat => {
        const liste = L.documents.filter(d => d.cat === cat);
        if (!liste.length) return '';
        return '<div class="dc-cat">' + cat + '</div>' + liste.map(d => {
          const f = docs && docs[d.id];
          return '<div class="dc">' +
            '<div class="dc-h"><b>' + d.nom + '</b><span>' + d.quand + '</span></div>' +
            '<ul class="dc-r">' + d.refs.map(r => '<li>' + r + '</li>').join('') + '</ul>' +
            (d.note ? '<p class="dc-n">' + d.note + '</p>' : '') +
            '<div class="dc-b">' +
              (f ? '<button class="dc-v" data-doc="' + d.id + '">Voir le document</button>' : '') +
              '<button class="dc-a" data-ajout="' + d.id + '">' +
                (f ? 'Remplacer' : 'Ajouter le fichier') + '</button>' +
              (f && f.local ? '<button class="dc-x" data-otelocal="' + d.id + '">Retirer</button>' : '') +
              (d.lien ? '<a href="' + d.lien + '" target="_blank" rel="noopener">' +
                (d.lienNom || 'Le site') + '</a>' : '') +
              (d.app ? '<a href="' + d.app + '" target="_blank" rel="noopener">' +
                (d.appNom || 'Dans l\'app') + '</a>' : '') +
              (d.mail ? '<a href="' + d.mail + '" target="_blank" rel="noopener">Le mail</a>' : '') +
            '</div>' +
            (f ? '' : '<div class="dc-abs">Aucun fichier joint pour l\'instant</div>') +
            '</div>';
        }).join('');
      }).join('') : '') +

    '<div class="fi-titre">Ajoutés depuis cet appareil</div>' +
    '<div class="dc-loc">' +
      (Object.keys(docs || {}).filter(k => docs[k].local && !(L.documents || []).some(d => d.id === k)).length
        ? Object.keys(docs).filter(k => docs[k].local && !(L.documents || []).some(d => d.id === k)).map(k =>
            '<div class="dc"><div class="dc-h"><b>' + docs[k].nom + '</b>' +
            '<span>ajouté le ' + (docs[k].ajoute || '') + '</span></div>' +
            '<div class="dc-b"><button class="dc-v" data-doc="' + k + '">Voir</button>' +
            '<button class="dc-x" data-otelocal="' + k + '">Retirer</button></div></div>').join('')
        : '<div class="dc-vide">Rien pour l\'instant. Ce que tu ajoutes ici reste ' +
          'sur ce téléphone, chiffré, et ne part jamais en ligne.</div>') +
      '<button class="dn-btn plein large" id="cffAjout">Ajouter un document</button>' +
      '<input type="file" id="cffFichier" hidden accept="image/*,application/pdf,.pdf,.png,.jpg,.jpeg,.heic">' +
      '<div class="dc-msg" id="cffAjoutMsg"></div>' +
    '</div>' +

    (L.contacts ? '<div class="fi-titre">Numeros et references</div>' +
      '<div class="cff-bloc">' + L.contacts.map(c =>
        '<div class="cff-l"><span>' + c.qui + '</span><b>' + c.num + '</b></div>').join('') +
      '</div>' : '') +

    /* A regler. Les lignes deja retombees passent en bas, barrees : elles ne
       doivent plus attirer l'oeil, mais les effacer ferait douter Pierre de
       les avoir traitees. */
    '<div class="fi-titre">À régler</div>' +
    '<div class="ck-liste carte-l">' + L.aRegler.slice().sort((a, b) =>
        (a.fait ? 1 : 0) - (b.fait ? 1 : 0)).map(x => {
      const d = x.echeance ? dateDe(x.echeance) : null;
      const j = d ? Math.round((d - minuit(maintenant())) / 86400000) : null;
      return '<button class="sk' + (x.crit ? ' sk-reglementaire' : ' sk-perso') +
        (x.fait ? ' sk-clos' : '') + (coche(x.id) ? ' ok' : '') +
        '" data-cff="' + x.id + '">' +
        '<i class="ck-box"></i><span class="sk-t">' + x.txt +
        (x.detail ? '<small>' + x.detail + '</small>' : '') + '</span>' +
        (d && !x.fait ? '<span class="sk-ech' + (j <= 1 ? ' chaud' : '') + '">' +
          (j < 0 ? 'passé' : (j === 0 ? "auj." : (j === 1 ? 'demain' : 'J-' + j))) +
          '</span>' : '') + '</button>';
    }).join('') +
    '</div>';

  document.getElementById('cffFerme').addEventListener('click', () => {
    coffre = null; cleVive = null; libereDocs(); traceCoffre();
  });
  document.querySelectorAll('#coffreHote [data-cff]').forEach(b =>
    b.addEventListener('click', () => { basculeCoche(b.dataset.cff); traceCoffre(); }));
  document.querySelectorAll('#coffreHote [data-doc]').forEach(b =>
    b.addEventListener('click', () => ouvreDoc(b.dataset.doc)));

  const champFichier = document.getElementById('cffFichier');
  const msgAjout = document.getElementById('cffAjoutMsg');
  let cibleAjout = null;

  const demande = cible => { cibleAjout = cible; champFichier.value = ''; champFichier.click(); };
  document.getElementById('cffAjout').addEventListener('click', () => demande(null));
  document.querySelectorAll('#coffreHote [data-ajout]').forEach(b =>
    b.addEventListener('click', () => demande(b.dataset.ajout)));

  champFichier.addEventListener('change', async e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    msgAjout.textContent = 'Chiffrement…';
    try {
      await ajouteLocal(f, cibleAjout);
      traceCoffre();
    } catch (err) {
      msgAjout.textContent = "Impossible d'ajouter ce fichier : " + (err && err.name ? err.name : err);
    }
  });

  document.querySelectorAll('#coffreHote [data-otelocal]').forEach(b =>
    b.addEventListener('click', async () => {
      await retireLocal(b.dataset.otelocal);
      traceCoffre();
    }));
}

/* ==================== journal, meteo, confiance, blocs 18/08 ==================== */

const CLE_JN = CLE_JOURNAL;
const litJournal = () => { try { return JSON.parse(localStorage.getItem(CLE_JN) || '[]'); } catch (e) { return []; } };
const ecritJournal = j => { try { localStorage.setItem(CLE_JN, JSON.stringify(j)); } catch (e) {} };

function traceJournal() {
  const j = litJournal();
  const auj = isoLocal(maintenant());

  document.getElementById('jnSaisie').innerHTML =
    '<div class="jn-l"><label>Note libre</label>' +
    '<textarea id="jnTxt" rows="2" placeholder="Une ligne, un ressenti, ce que tu veux"></textarea></div>' +
    '<div class="jn-g">' +
      '<div class="jn-l"><label>Pied 0-3</label><select id="jnPied">' +
        '<option value="">&#183;</option><option value="0">0 · rien</option><option value="1">1 · léger</option>' +
        '<option value="2">2 · net</option><option value="3">3 · fort</option></select></div>' +
      '<div class="jn-l"><label>Zone</label><select id="jnZone">' +
        '<option value="">&#183;</option><option>Avant-pied</option><option>5ᵉ méta</option>' +
        '<option>Talon</option><option>Cheville G</option><option>Autre</option></select></div>' +
      '<div class="jn-l"><label>km d\'apparition</label><input id="jnKm" type="text" inputmode="decimal" placeholder="ex. 12"></div>' +
      '<div class="jn-l"><label>Nuit</label><select id="jnNuit">' +
        '<option value="">&#183;</option><option>Bonne</option><option>Moyenne</option><option>Mauvaise</option></select></div>' +
      '<div class="jn-l"><label>Poids (facultatif)</label><input id="jnPoids" type="text" inputmode="decimal" placeholder="kg"></div>' +
    '</div>' +
    '<button class="dn-btn plein large" id="jnAjout">Enregistrer</button>';

  document.getElementById('jnAjout').addEventListener('click', () => {
    const e = {
      d: auj, t: new Date().toISOString(),
      txt: document.getElementById('jnTxt').value.trim(),
      pied: document.getElementById('jnPied').value,
      zone: document.getElementById('jnZone').value,
      km: document.getElementById('jnKm').value.trim(),
      nuit: document.getElementById('jnNuit').value,
      poids: document.getElementById('jnPoids').value.trim()
    };
    if (!e.txt && !e.pied && !e.km && !e.nuit && !e.poids) return;
    const l = litJournal(); l.unshift(e); ecritJournal(l); traceJournal();
  });

  document.getElementById('jnHote').innerHTML = j.length
    ? j.map((e, i) => {
        const d = dateDe(e.d);
        const tags = [];
        if (e.pied !== '') tags.push('pied ' + e.pied);
        if (e.zone) tags.push(e.zone);
        if (e.km) tags.push('km ' + e.km);
        if (e.nuit) tags.push('nuit ' + e.nuit.toLowerCase());
        if (e.poids) tags.push(e.poids + ' kg');
        return '<div class="jn-e"><div class="jn-d">' + d.getDate() + ' ' + MOIS[d.getMonth()] + '</div>' +
          '<div class="jn-c">' + (e.txt ? '<p>' + e.txt + '</p>' : '') +
          (tags.length ? '<div class="jn-t">' + tags.map(t => '<span>' + t + '</span>').join('') + '</div>' : '') +
          '</div><button class="jn-x" data-jn="' + i + '" aria-label="Supprimer">&#10005;</button></div>';
      }).join('')
    : '<div class="vide">Rien encore. La première note peut être le débrief de mercredi.</div>';

  document.querySelectorAll('#jnHote [data-jn]').forEach(b =>
    b.addEventListener('click', () => {
      const l = litJournal(); l.splice(+b.dataset.jn, 1); ecritJournal(l); traceJournal();
    }));
}

/* ---- carb cycling ---- */
const NIV = { 'LOW':'low', 'MEDIUM':'med', 'MEDIUM / HIGH':'medhigh', 'HIGH':'high', 'RECHARGE':'rech' };
// abrege : « MEDI... » et « MEDI... » se ressemblaient trop sur neuf cases de 38 px
const NIV_L = { 'LOW':'low', 'MEDIUM':'med', 'MEDIUM / HIGH':'med+', 'HIGH':'high', 'RECHARGE':'rech' };
function traceCarb() {
  const c = AFFUTAGE.carbCycling;
  const auj = minuit(maintenant()).getTime();
  return document.getElementById('carbHote').innerHTML =
    '<div class="cb-x">' + c.contexte + '</div>' +
    '<div class="cb-g">' + c.plan.map(x => {
      const d = dateDe(x.date);
      const est = d.getTime() === auj;
      return '<div class="cb' + (est ? ' auj' : '') + ' n-' + NIV[x.niveau] + '">' +
        '<b>' + d.getDate() + '</b><span>' + NIV_L[x.niveau] + '</span></div>';
    }).join('') + '</div>' +
    '<div class="cb-r">' + c.regleAbsolue + '</div>' +
    (c.plan.filter(x => x.note).map(x => '<div class="cb-n"><b>' + dateDe(x.date).getDate() + '</b>' + x.note + '</div>').join(''));
}

/* ==================== la meteo, point par point ====================
   Le carnet est statique et doit repondre hors ligne : c'est la regle depuis
   le premier jour. Cette prevision est donc un BONUS EN LIGNE. On la va
   chercher quand il y a du reseau, on la garde en cache, et hors ligne on
   affiche la derniere connue avec sa date. Rien ne casse sans reseau.

   Ce qui fait la valeur du truc : chaque point est interroge A SON ALTITUDE et
   l'heure lue est celle du PASSAGE PREVU par le scenario actif. On ne lit pas
   la meteo de Chamonix a midi, on lit celle du Grand Col Ferret a 16h a
   2 529 m. Sept degres d'ecart, et ce n'est pas un detail a 2 500 m. */

const CLE_METEO = 'ccc-v2-meteo-prevue';

/* Signature du jeu de points. Le 23/08, deux sommets ont ete deplaces : le
   Grand Col Ferret etait lu au km 37 a 1 944 m, donc deja dans la descente.
   Un cache releve AVANT cette correction contient des previsions justes pour
   les mauvaises coordonnees. Il doit se perimer tout seul, sans que Pierre
   ait a le savoir. */
const SIGNATURE_POINTS = METEO_POINTS.map(p => p.km + ':' + p.alt).join('|');

let meteoPrevue = null;      // { releve, jour, signature, points: [...] }
let meteoEnCours = false;

function litMeteoCache() {
  try { return JSON.parse(localStorage.getItem(CLE_METEO) || 'null'); } catch (e) { return null; }
}
function ecritMeteoCache(o) {
  try { localStorage.setItem(CLE_METEO, JSON.stringify(o)); } catch (e) { /* mode prive */ }
}

/* On demande les 13 points en un seul appel : Open-Meteo accepte des listes. */
function urlMeteo(jour) {
  const p = METEO_POINTS;
  const q = new URLSearchParams({
    latitude:  p.map(x => x.lat).join(','),
    longitude: p.map(x => x.lon).join(','),
    elevation: p.map(x => x.alt).join(','),
    hourly: METEO_SOURCE.champs,
    timezone: 'Europe/Paris',
    start_date: jour,
    end_date: jourSuivant(jour)
  });
  return METEO_SOURCE.base + '?' + q.toString();
}

function jourSuivant(iso) {
  const d = dateDe(iso);
  d.setDate(d.getDate() + 1);
  return isoLocal(d);
}

async function chargeMeteo(force) {
  if (meteoEnCours) return;
  const cache = litMeteoCache();

  // un cache releve sur d'autres coordonnees ne vaut rien, meme frais
  const bon = cache && cache.signature === SIGNATURE_POINTS;

  // une prevision de moins de trois heures suffit largement
  if (!force && bon && (Date.now() - cache.releve) < 3 * 3600 * 1000) {
    meteoPrevue = cache;
    return;
  }
  if (!navigator.onLine) { meteoPrevue = bon ? cache : null; return; }

  meteoEnCours = true;
  traceMeteoPrevue();
  try {
    const jour = isoLocal(DEPART);
    const rep = await fetch(urlMeteo(jour), { cache: 'no-store' });
    if (!rep.ok) throw new Error(rep.status);
    const brut = await rep.json();
    const lieux = Array.isArray(brut) ? brut : [brut];

    const points = METEO_POINTS.map((pt, i) => {
      const l = lieux[i];
      if (!l || !l.hourly) return null;
      const h = l.hourly;
      return {
        nom: pt.nom, km: pt.km, alt: pt.alt, type: pt.type, expose: !!pt.expose,
        t: h.time,
        temp: h.temperature_2m,
        ressenti: h.apparent_temperature,
        pluieProb: h.precipitation_probability,
        vent: h.wind_speed_10m,
        rafales: h.wind_gusts_10m,
        code: h.weather_code
      };
    }).filter(Boolean);

    if (points.length) {
      meteoPrevue = { releve: Date.now(), jour, signature: SIGNATURE_POINTS, points };
      ecritMeteoCache(meteoPrevue);
    }
  } catch (e) {
    meteoPrevue = bon ? cache : null;   // on ne garde que ce qui est comparable
  } finally {
    meteoEnCours = false;
    traceMeteoPrevue();
  }
}

/* Lit un point a l'heure de passage du scenario ACTIF. C'est fait au rendu,
   pas au relevé : basculer de A a B decale les heures sans rien redemander. */
function litPoint(p, jalons) {
  const quand = heureAu(p.km, jalons);
  const cible = quand.getTime();
  let k = 0, ecart = Infinity;
  p.t.forEach((t, j) => {
    const e = Math.abs(new Date(t).getTime() - cible);
    if (e < ecart) { ecart = e; k = j; }
  });
  return {
    nom: p.nom, km: p.km, alt: p.alt, type: p.type, expose: p.expose,
    heure: hhmm(quand),
    temp: p.temp[k], ressenti: p.ressenti[k],
    pluieProb: p.pluieProb[k], vent: p.vent[k],
    rafales: p.rafales[k], code: p.code[k]
  };
}

/* ==================== les conseils, tires des chiffres ====================
   Un tableau de temperatures ne sert a rien si personne ne dit quoi en faire.
   Ici chaque conseil est ANCRE sur un point nomme et une heure, et renvoie au
   materiel que Pierre possede vraiment : les quatre paliers de gants, les deux
   longs chauds, les moufles restees en valise. Les chauffe-mains ont ete
   ecartes le 23/08 : introuvables hors saison. */

const NUIT_DE = 21, NUIT_A = 7;   // heures pleines

function heureDeNuit(hhmm) {
  const h = parseInt(hhmm.slice(0, 2), 10);
  return h >= NUIT_DE || h < NUIT_A;
}

function conseilsMeteo(P) {
  if (!P.length) return [];
  const out = [];
  const par = k => P.slice().sort((a, b) => a[k] - b[k]);
  const froidPt = par('ressenti')[0];
  const chaudPt = par('temp')[P.length - 1];
  const ventPt = par('rafales')[P.length - 1];
  const pluiePt = par('pluieProb')[P.length - 1];

  const sousCinq = P.filter(p => p.ressenti <= SEUILS.froid);
  const sousZero = P.filter(p => p.ressenti <= SEUILS.tresFroid);
  const gel = P.filter(p => p.temp <= SEUILS.gel);
  const orages = P.filter(p => p.code >= SEUILS.orage);
  const neige = P.filter(p => (p.code >= 71 && p.code <= 77) || p.code === 85 || p.code === 86);
  const pluieFroid = P.filter(p => (p.pluieProb || 0) >= SEUILS.pluie && p.ressenti <= SEUILS.pluieFroide);
  const ou = p => p.nom + ' &#183; ' + p.heure;

  /* 1. l'orage : le seul risque qu'on ne gere pas, on le subit */
  if (orages.length) {
    out.push({ n: 'crit', titre: 'Orage annoncé',
      ou: orages.map(ou).join(' &#183; '),
      txt: 'C\'est le seul risque non gérable : il peut modifier le parcours ou différer le départ. ' +
        'Rien à préparer, sinon écouter les consignes de l\'organisation et ne pas s\'entêter sur une crête.' });
  }

  /* 2. le point le plus froid, et le palier de gants qui va avec */
  const paliers = (SAC.gants && SAC.gants.paliers) || [];
  let palier = paliers[0];
  if (froidPt.ressenti <= SEUILS.tresFroid) palier = paliers[3] || paliers[paliers.length - 1];
  else if (froidPt.ressenti <= SEUILS.froid) palier = paliers[1];
  if ((pluiePt.pluieProb || 0) >= SEUILS.pluie && froidPt.ressenti <= SEUILS.pluieFroide + 1) palier = paliers[2] || palier;

  const nuitFroide = heureDeNuit(froidPt.heure);
  out.push({ n: froidPt.ressenti <= SEUILS.froid ? 'att' : 'info', titre: 'Le point le plus froid',
    ou: ou(froidPt) + ' &#183; ' + froidPt.alt + ' m',
    txt: Math.round(froidPt.temp) + ' °C, ressenti ' + Math.round(froidPt.ressenti) + ' °C. ' +
      (nuitFroide
        ? 'C\'est de nuit, donc au moment où tu es le plus lent et le plus vidé : la chaleur produite baisse pile quand il en faudrait le plus. '
        : '') +
      (palier ? 'Palier de gants correspondant : <b>' + palier.config +
        '</b> <i>(' + palier.conditions + ')</i>. ' : '') +
      'La règle ne change pas : les gants AVANT d\'avoir froid, jamais quand tu as froid.' });

  /* 3. combien de temps sous cinq degres : ca dimensionne l'equipement */
  if (sousCinq.length >= 2) {
    const de = sousCinq[0], a = sousCinq[sousCinq.length - 1];
    out.push({ n: sousCinq.length >= SEUILS.sequence ? 'crit' : 'att',
      titre: sousCinq.length + ' points sous ' + SEUILS.froid + ' °C ressentis',
      ou: de.nom + ' &#183; ' + de.heure + '  →  ' + a.nom + ' &#183; ' + a.heure,
      txt: 'Ce n\'est plus un coup de froid ponctuel, c\'est une séquence. ' +
        (sousCinq.length >= SEUILS.sequence
          ? '🧤 <b>Les moufles Salomon sortent de la valise</b> : c\'est exactement le cas prévu pour elles, à trancher le 27 au soir. '
          : '') +
        'Les chauffe-mains ont été écartés : il n\'y a plus de rattrapage possible une fois les doigts froids. ' +
        '<b>Monter d\'un palier de gants AVANT la montée</b>, au ravito qui précède, pas au sommet.' });
  }
  if (sousZero.length) {
    out.push({ n: 'crit', titre: 'Sous zéro ressenti',
      ou: sousZero.map(ou).join(' &#183; '),
      txt: 'Les trois couches de gants, et la frontale contre le corps dès qu\'elle quitte la tête.' });
  }

  /* 4. le gel : ce qui casse a 2 degres, ce sont les barres et les batteries */
  if (gel.length) {
    out.push({ n: 'att', titre: 'Risque de gel',
      ou: gel.map(ou).join(' &#183; '),
      txt: '🧊 Une barre énergétique gèle à ces températures — c\'est arrivé en 2024 sur la TDS. ' +
        'Gels et barres en <b>poche intérieure</b>, jamais dans le filet extérieur du sac. ' +
        '🔋 Le froid tue les batteries : Swift RL allumée sur la tête, elle reste au chaud.' });
  }

  /* 5. la pluie, et son alliance avec le froid */
  const pp = pluiePt.pluieProb || 0;
  if (pp >= SEUILS.pluie) {
    out.push({ n: pp >= SEUILS.pluieForte ? 'crit' : 'att', titre: 'Pluie probable, ' + pp + ' % au plus fort',
      ou: ou(pluiePt),
      txt: 'Veste accessible <b>sans ouvrir le sac</b>. ' +
        '⚠️ Le traitement déperlant de la S/Lab est mort : le protocole Nikwax du week-end du 22-23 ' +
        'n\'est plus une option, c\'est ce qui décide si tu es sec ou trempé de l\'intérieur. ' +
        (pp >= SEUILS.pluieForte ? 'Sur-pantalon Scott aussi : à ce niveau de probabilité, il sort du sac.' : '') });
  }
  if (pluieFroid.length) {
    out.push({ n: 'crit', titre: 'Pluie ET froid en même temps',
      ou: pluieFroid.map(ou).join(' &#183; '),
      txt: 'C\'est la combinaison qui fait les abandons, pas le froid seul. ' +
        'Mouillé, tu perds ta chaleur quatre fois plus vite. ' +
        '<b>Veste AVANT la montée</b>, pas au sommet : au col il est déjà trop tard, tu es trempé de sueur.' });
  }

  /* 6. le vent : c'est lui qui fait le ressenti, pas le thermometre */
  const raf = ventPt.rafales || 0;
  if (raf >= SEUILS.rafales) {
    out.push({ n: raf >= SEUILS.rafalesFortes ? 'crit' : 'att', titre: 'Rafales à ' + Math.round(raf) + ' km/h',
      ou: ou(ventPt) + ' &#183; ' + ventPt.alt + ' m',
      txt: 'C\'est le vent qui creuse l\'écart entre la température et le ressenti. ' +
        'Veste au col même s\'il fait bon en montant, et capuche. ' +
        (ventPt.expose ? 'Ce point est le plus exposé de la course.' : '') });
  }

  /* 7. la neige, si le modele en met */
  if (neige.length) {
    const alt = Math.min(...neige.map(p => p.alt));
    out.push({ n: 'crit', titre: 'Neige annoncée',
      ou: neige.map(ou).join(' &#183; '),
      txt: 'À partir de ' + alt + ' m. Adhérence dégradée sur les blocs, ' +
        'et les mains mouillées deviennent le vrai sujet. Sur-gants Leki par-dessus tout le reste.' });
  }

  /* 8. la chaleur, si elle revient */
  if (chaudPt.temp >= SEUILS.chaud) {
    out.push({ n: 'att', titre: 'Chaleur, ' + Math.round(chaudPt.temp) + ' °C',
      ou: ou(chaudPt),
      txt: 'Flasque 2 en eau plate, sur la nuque et la casquette à chaque ravito. ' +
        'Le kit canicule reste actif : sac à 2 L.' });
  }

  /* 9. l'amplitude : c'est elle qui justifie le sac de Champex */
  const amp = Math.round(chaudPt.temp - froidPt.ressenti);
  if (amp >= SEUILS.amplitude) {
    out.push({ n: 'info', titre: amp + ' °C d\'amplitude sur la course',
      ou: 'de ' + Math.round(chaudPt.temp) + ' °C à ' + Math.round(froidPt.ressenti) + ' °C ressentis',
      txt: 'C\'est ce qui rend le sac de Champex décisif : tu y bascules d\'une tenue de jour à une tenue de nuit. ' +
        'Le long chaud n°2 sec et les chaussettes sèches y prennent tout leur sens.' });
  }

  /* 10. quand rien ne se declenche, le dire aussi */
  if (!out.some(c => c.n === 'crit' || c.n === 'att')) {
    out.push({ n: 'info', titre: 'Rien d\'alarmant dans cette prévision',
      txt: 'Pas de raison de sur-emporter. La liste réglementaire reste la liste réglementaire, ' +
        'mais les moufles peuvent rester en valise.' });
  }

  return out;
}

function traceMeteoPrevue() {
  const h = document.getElementById('meteoHote');
  if (!h) return;

  const jours = Math.ceil((DEPART - maintenant()) / 86400000);
  const jUtile = Math.round((dateDe(METEO.dateUtile) - minuit(maintenant())) / 86400000);

  const tete = '<div class="mp-tete">' +
    '<div><b>La météo du 28</b>' +
    '<small>Chaque point à son altitude, à l\'heure de passage du scénario ' +
      scenarioActif().id + '</small></div>' +
    '<button class="mp-maj" id="mpMaj">' + (meteoEnCours ? '…' : 'Actualiser') + '</button></div>';

  /* Le fond du sujet : ce qui reste vrai quelle que soit la prevision du jour.
     Replie, parce que la prevision passe devant. */
  const fond = (function () {
    const m = METEO.au20Aout;
    return '<details class="mp-fond"><summary>Le fond du sujet ' +
      '<span>ce qui reste vrai quelle que soit la prévision</span></summary>' +
      '<div class="mp-fc">' +
        '<div class="mt-c">' + METEO.conclusion + '</div>' +
        (m ? '<div class="fi-titre">Ce que disent les trois dernières éditions</div>' +
          '<table class="mt-h">' + m.historique.map(x =>
            '<tr><td>' + x.annee + '</td><td>' + x.conditions + '</td></tr>').join('') + '</table>' +
          '<div class="mt-ens">' + m.enseignement + '</div>' +
          '<div class="mt-at">' + m.atout + '</div>' +
          '<div class="mt-or">' + m.orage + '</div>' +
          '<div class="mt-p">' + m.gel + '</div>' +
          '<div class="mt-stop">' + m.consigne + '</div>' : '') +
      '</div></details>';
  })();

  /* Sans relevé : on retombe sur l'estimation de saison, en le disant. */
  if (!meteoPrevue || !meteoPrevue.points || !meteoPrevue.points.length) {
    h.innerHTML = tete +
      '<div class="mp-vide">' +
      (meteoEnCours ? 'Relevé en cours…'
       : (navigator.onLine ? 'Pas encore de relevé. Touche Actualiser.'
          : 'Hors ligne, et aucun relevé en mémoire. La prévision arrivera au prochain réseau.')) +
      '</div>' +
      '<div class="fi-titre">En attendant, l\'ordre de grandeur de saison</div>' +
      '<table class="mt-t">' + METEO.profilAltitude.map(x =>
        '<tr class="' + (x.critique ? 'crit' : '') + '"><td>' + x.lieu +
        '<small>' + x.alt + ' m · ' + x.heure + '</small></td>' +
        '<td>' + x.temp + '</td></tr>').join('') + '</table>' +
      '<div class="mp-leg">Ce ne sont pas des prévisions mais des normales. ' +
        'Dès qu\'un relevé arrive, il les remplace.</div>' +
      fond;
    brancheMeteo();
    return;
  }

  const jalons = jalonsHoraires(scenarioActif());
  const P = meteoPrevue.points.map(p => litPoint(p, jalons));
  const age = Math.round((Date.now() - meteoPrevue.releve) / 60000);
  const ageTxt = age < 60 ? 'il y a ' + age + ' min'
               : (age < 1440 ? 'il y a ' + Math.round(age / 60) + ' h'
                             : 'il y a ' + Math.round(age / 1440) + ' j');

  /* Le coup d'oeil : trois chiffres avant le tableau. */
  const tri = k => P.slice().sort((a, b) => a[k] - b[k]);
  const froidPt = tri('ressenti')[0];
  const chaudPt = tri('temp')[P.length - 1];
  const pluiePt = tri('pluieProb')[P.length - 1];
  const resume = '<div class="mp-res">' +
    '<div><i>le plus froid</i><b>' + Math.round(froidPt.ressenti) + '°</b>' +
      '<small>' + froidPt.nom + ' · ' + froidPt.heure + '</small></div>' +
    '<div><i>le plus chaud</i><b>' + Math.round(chaudPt.temp) + '°</b>' +
      '<small>' + chaudPt.nom + ' · ' + chaudPt.heure + '</small></div>' +
    '<div><i>pluie max</i><b>' + (pluiePt.pluieProb == null ? '·' : pluiePt.pluieProb + '%') + '</b>' +
      '<small>' + pluiePt.nom + ' · ' + pluiePt.heure + '</small></div>' +
    '</div>';

  const ligne = p => {
    const c = CODES_METEO[p.code] || { i: '·', t: '' };
    const froid = p.ressenti <= SEUILS.froid, tresFroid = p.ressenti <= SEUILS.tresFroid;
    return '<tr class="' + (tresFroid ? 'gel' : (froid ? 'froid' : '')) +
      (p.expose ? ' expose' : '') + '">' +
      '<td class="mp-n"><b>' + p.nom + '</b><small>' + p.alt + ' m &#183; ' +
        kmFmt(p.km) + ' km</small></td>' +
      '<td class="mp-h">' + p.heure + '</td>' +
      '<td class="mp-c" title="' + c.t + '">' + c.i + '</td>' +
      '<td class="mp-t"><b>' + Math.round(p.temp) + '°</b>' +
        '<small>ress. ' + Math.round(p.ressenti) + '°</small></td>' +
      '<td class="mp-p">' + (p.pluieProb == null ? '·' : p.pluieProb + '%') + '</td>' +
      '<td class="mp-v">' + Math.round(p.vent) + '<small>' + Math.round(p.rafales) + '</small></td>' +
      '</tr>';
  };

  const cons = conseilsMeteo(P);

  h.innerHTML = tete +
    (jours > 7 ? '<div class="mp-loin">⚠️ À ' + jours + ' jours, une prévision ne vaut rien. ' +
      'Elle est là pour l\'ordre de grandeur, pas pour décider. ' +
      (jUtile > 0 ? 'Le relevé qui compte, c\'est dans ' + jUtile + ' jours.' : '') + '</div>' : '') +
    resume +
    '<table class="mp"><tr>' +
      '<th>point</th><th>h</th><th></th><th>°C</th><th>pluie</th><th>vent<small>raf.</small></th></tr>' +
      P.map(ligne).join('') + '</table>' +
    '<div class="mp-leg">Le vent est en km/h, le petit chiffre est la rafale. ' +
      'Les lignes bleutées sont sous ' + SEUILS.froid + ' °C ressentis.</div>' +
    (cons.length ? '<div class="fi-titre">Ce que ça impose</div>' +
      cons.map(c => '<div class="mp-cons ' + c.n + '">' +
        '<div class="mp-ct"><b>' + c.titre + '</b>' +
        (c.ou ? '<i>' + c.ou + '</i>' : '') + '</div>' +
        '<p>' + c.txt + '</p></div>').join('') : '') +
    '<div class="mp-src">' + METEO_SOURCE.nom + ' &#183; relevé ' + ageTxt +
      (navigator.onLine ? '' : ' &#183; hors ligne, dernier relevé connu') + '</div>' +
    fond;

  brancheMeteo();
}

function brancheMeteo() {
  const b = document.getElementById('mpMaj');
  if (b) b.addEventListener('click', () => chargeMeteo(true));
}

/* ==================== ce qui s'est ferme du 18 au 20 ==================== */

/* Le verdict chaussures. Deux tests, dont un sous la pluie : c'est le second
   qui compte, parce qu'il a ete fait en conditions degradees. */
function traceVerdict() {
  const h = document.getElementById('verdictHote');
  if (!h) return;
  const V = VERDICT_CHAUSSURES;
  const test = (t, n) =>
    '<div class="vd-t"><div class="vd-th"><b>Test ' + n + '</b>' +
      '<span>' + dateDe(t.date).getDate() + ' ' + MOIS[dateDe(t.date).getMonth()] +
      ' &#183; ' + kmFmt(t.km) + ' km &#183; ' + t.dplus + ' m D+</span></div>' +
      '<div class="vd-c">' + (t.conditions || t.temp) + '</div>' +
      '<p>' + t.resultat + '</p>' +
      (t.detailCle ? '<div class="vd-cle">' + t.detailCle + '</div>' : '') +
      '<small>' + t.chaussettes + '</small></div>';

  h.innerHTML =
    '<div class="vd-tete"><i>dossier fermé</i><b>' + V.decision + '</b></div>' +
    test(V.test1, 1) + test(V.test2, 2) +
    '<div class="vd-lend"><b>Le lendemain, ' + dateDe(V.lendemain.date).getDate() + '</b>' +
      '<div>Bord externe : <b>' + V.lendemain.bordExterne + '</b></div>' +
      '<div>Peau : ' + V.lendemain.peau + '</div></div>' +
    '<div class="vd-profil">' + V.profilConfirme + '</div>' +
    '<div class="vd-note">' + V.noteImportante + '</div>' +
    '<div class="vd-red">' + V.redondanceChaussettes + '</div>';
}

/* La trousse. Deux lignes portent une action, elles ressortent. */
function traceTrousse() {
  const h = document.getElementById('trousseHote');
  if (!h) return;
  h.innerHTML =
    '<div class="tr-tete"><i>' + TROUSSE.statut + '</i><small>' + TROUSSE.rdv + '</small></div>' +
    TROUSSE.items.map(i =>
      '<div class="tr' + (i.cle ? ' cle' : '') + '"><b>' + i.nom + '</b>' +
      '<span>' + i.statut + '</span>' +
      (i.note ? '<p>' + i.note + '</p>' : '') +
      (i.aFaire ? '<div class="tr-af">' + i.aFaire + '</div>' : '') + '</div>').join('') +
    '<div class="fi-titre">Le suivi</div>' +
    '<div class="tr-s">' +
      '<div><span>Prise de sang</span>' + TROUSSE.suivi.priseDeSang + '</div>' +
      '<div><span>Ongles</span>' + TROUSSE.suivi.ongles + '</div>' +
      '<div><span>Pieds</span>' + TROUSSE.suivi.pieds + '</div>' +
      '<div><span>La suite</span>' + TROUSSE.suivi.prochainesEtapes + '</div>' +
    '</div>';
}

/* La veste et les lampes : deux dossiers materiel ouverts le 19. */
function traceVesteLampes() {
  const hv = document.getElementById('vesteHote');
  if (hv) {
    hv.innerHTML =
      '<div class="ve-tete"><b>' + VESTE.modele + '</b><small>' + VESTE.membrane + '</small></div>' +
      '<div class="ve-pb">' + VESTE.probleme + '</div>' +
      '<div class="ve-diag"><b>Ce qui se passe</b>' + VESTE.diagnostic + '</div>' +
      '<div class="ve-fc">' + VESTE.consequenceSecondaire + '</div>' +
      '<div class="fi-titre">Le protocole</div>' +
      '<div class="ve-p">' + VESTE.protocole.map(e =>
        '<div class="ve-e"><b>' + e.n + '</b><div>' + e.txt +
        (e.alerte ? '<em>' + e.alerte + '</em>' : '') + '</div></div>').join('') + '</div>' +
      '<div class="ve-quand">' + VESTE.quand + '</div>' +
      '<div class="ve-prod">' + VESTE.produit + '</div>';
  }

  const hl = document.getElementById('lampesHote');
  if (hl) {
    hl.innerHTML =
      '<div class="lp"><i>principale</i><b>' + LAMPES.principale.modele + '</b>' +
        '<small>' + LAMPES.principale.batterie + '</small>' +
        '<div class="lp-al">' + LAMPES.principale.alerte + '</div>' +
        '<p>' + LAMPES.principale.conseil + '</p></div>' +
      '<div class="lp"><i>secours</i><b>' + LAMPES.secours.modele + '</b>' +
        '<small>' + LAMPES.secours.prix + ' &#183; ' + LAMPES.secours.decision + '</small>' +
        '<p>' + LAMPES.secours.pourquoi + '</p></div>' +
      '<div class="fi-titre">Les rechanges</div>' +
      LAMPES.rechange.map(r =>
        '<div class="lp-r"><b>' + r.objet + '</b><span>' + r.statut + '</span>' +
        (r.note ? '<p>' + r.note + '</p>' : '') + '</div>').join('') +
      '<div class="lp-reg">' + LAMPES.reglementaire + '</div>' +
      '<div class="lp-froid">' + LAMPES.froid + '</div>';
  }
}

/* La balise. Le piege n'est pas de la perdre, c'est d'oublier de la rendre
   le samedi, apres vingt heures de course. */
function traceBalise() {
  const h = document.getElementById('baliseHote');
  if (!h) return;
  const R = BALISE.restitution;
  h.innerHTML =
    '<div class="ba-al"><b>' + R.quandPierre + '</b>' + BALISE.alerte + '</div>' +
    '<div class="ba-l"><span>Caution</span>' + BALISE.caution.montant + ' &#183; ' +
      BALISE.caution.systeme + ' &#183; ' + BALISE.caution.statut + '</div>' +
    '<div class="ba-l"><span>Retrait</span>' + BALISE.retrait + '</div>' +
    '<div class="ba-l"><span>Limite</span>' + R.dateLimite + '</div>' +
    '<div class="fi-titre">Où la rendre</div>' +
    R.ou.map(o => '<div class="ba-ou' + (o.malin ? ' malin' : '') + '"><b>' + o.lieu + '</b>' +
      (o.note ? '<small>' + o.note + '</small>' : '') + '</div>').join('') +
    '<div class="ba-int">' + R.interdit + '</div>' +
    '<div class="ba-s"><b>Si tu oublies</b>' + R.sanction + '. ' + R.secours + '</div>';
}

/* Les menus, de J-3 au jour J. Le piege est enonce en tete : ce n'est pas le
   volume qui monte, c'est la proportion. */
function traceMenus() {
  const h = document.getElementById('menusHote');
  if (!h) return;
  const auj = minuit(maintenant()).getTime();
  h.innerHTML =
    '<ul class="mn-pr">' + MENUS.principe.map(x => '<li>' + x + '</li>').join('') + '</ul>' +
    MENUS.jours.map(j => {
      const d = dateDe(j.date);
      const est = d.getTime() === auj;
      return '<div class="mn-j' + (est ? ' auj' : '') + '">' +
        '<div class="mn-jt"><b>' + j.label + '</b>' +
          (j.sous ? '<span>' + j.sous + '</span>' : '') + '</div>' +
        (j.alerte ? '<div class="mn-al">' + j.alerte + '</div>' : '') +
        j.repas.map(r => '<div class="mn-r"><b>' + r.moment + '</b>' +
          '<p>' + r.contenu + '</p>' +
          (r.note ? '<small>' + r.note + '</small>' : '') + '</div>').join('') +
        (j.interdits ? '<div class="mn-int"><b>Interdits</b>' +
          j.interdits.map(i => '<span>' + i + '</span>').join('') + '</div>' : '') +
        (j.hydratation ? '<div class="mn-hy">' + j.hydratation + '</div>' : '') +
        '</div>';
    }).join('') +
    '<div class="fi-titre">Le sac du train</div>' +
    '<div class="mn-sac"><b>' + MENUS.sacDuTrain.quand + '</b>' +
      '<ul>' + MENUS.sacDuTrain.contenu.map(x => '<li>' + x + '</li>').join('') + '</ul>' +
      '<div class="mn-regle">' + MENUS.sacDuTrain.regle + '</div></div>' +
    '<div class="fi-titre">Les courses</div>' +
    '<div class="mn-c"><b>Depuis la Belgique</b><ul>' +
      MENUS.courses.depuisLaBelgique.map(x => '<li>' + x + '</li>').join('') + '</ul></div>' +
    '<div class="mn-c"><b>À Chamonix le 27</b><ul>' +
      MENUS.courses.aChamonixLe27.map(x => '<li>' + x + '</li>').join('') + '</ul></div>' +
    '<div class="fi-titre">En voyage</div>' +
    '<ul class="mn-pr">' + MENUS.reglesVoyage.map(x => '<li>' + x + '</li>').join('') + '</ul>';
}

/* Les traces pour la montre. */
function traceTraces() {
  const h = document.getElementById('tracesHote');
  if (!h) return;
  h.innerHTML =
    '<div class="tc-pq">' + TRACES.pourquoi + '</div>' +
    TRACES.fichiers.map(f =>
      '<a class="tc-f' + (f.recommande ? ' reco' : '') + '" href="assets/' + f.nom +
      '" download><b>' + f.points + ' points</b><div>' + f.quoi +
      (f.recommande ? '<em>recommandé</em>' : '') + '</div><i>&#8681;</i></a>').join('') +
    '<div class="tc-ch">' + TRACES.chaquePoint + '</div>' +
    '<div class="fi-titre">Sur la Fenix</div>' +
    '<ol class="tc-i">' + TRACES.instructions.map(x => '<li>' + x + '</li>').join('') + '</ol>';
}

/* ==================== la recharge, et ce qu'on n'affichera pas ====================
   Le bloc de vigilance n'est pas decoratif. Il dit noir sur blanc ce que
   l'app refuse de faire, pour que ca reste vrai dans six mois. */

function traceRecharge() {
  const h = document.getElementById('rechargeHote');
  if (!h) return;
  h.innerHTML =
    '<div class="rc-regle">' + RECHARGE.regle + '</div>' +
    '<p class="rc-pq">' + RECHARGE.pourquoi + '</p>' +
    '<div class="rc-g">' + RECHARGE.schema.map(x =>
      '<div class="rc"><b>' + x.moment + '</b><span>' + x.contenu + '</span></div>').join('') + '</div>' +
    '<div class="fi-titre">Ce qui s\'arrête, et quand</div>' +
    RECHARGE.aArreter.map(x =>
      '<div class="rc-st"><div class="rc-sth"><b>' + x.quoi + '</b>' +
      '<i>' + x.quand + '</i></div>' +
      (x.pourquoi ? '<p>' + x.pourquoi + '</p>' : '') + '</div>').join('') +
    '<div class="rc-pr">' + RECHARGE.proteine + '</div>';
}

function traceVigilance() {
  const h = document.getElementById('vigilanceHote');
  if (!h) return;
  const V = VIGILANCE_NUTRITION;
  h.innerHTML =
    '<div class="vg-c">' + V.constat + '<small>' + V.frequence + '</small></div>' +
    '<div class="vg-i"><b>L\'inquiétude</b>' + V.inquietude + '</div>' +
    '<div class="vg-f"><b>' + V.fait.titre + '</b><p>' + V.fait.txt + '</p></div>' +
    '<div class="vg-l">' + V.cequiRendLeger + '</div>' +
    '<div class="vg-cs">' + V.consigne + '</div>';
}

/* La physio du jour. Une seule chose compte ici : distinguer un symptome
   mecanique d'un debut d'infection, a quatre jours du depart. */
function tracePhysio24() {
  const h = document.getElementById('physio24Hote');
  if (!h) return;
  const P = PHYSIO_24, S = P.symptomes;
  h.innerHTML =
    '<div class="p24-t">' + P.titre + '</div>' +
    '<div class="p24-g">' + P.lignes.map(l =>
      '<div class="p24' + (l.bon ? ' bon' : '') + '"><i>' + l.l + '</i><b>' + l.v + '</b>' +
      (l.n ? '<small>' + l.n + '</small>' : '') + '</div>').join('') + '</div>' +
    '<div class="p24-ch">' + P.charge + '</div>' +
    '<div class="p24-sy"><div class="p24-syh">' + S.quoi + '</div>' +
      '<p>' + S.analyse + '</p>' +
      '<div class="p24-pv">' + S.preuve + '</div>' +
      '<div class="p24-sv">' + S.surveillance + '</div></div>';
}

/* Les quatre cartes plastifiees, en entier. L'app porte le MEME contenu que
   le papier : si une carte se detrempe ou se perd, rien n'est perdu. Chaque
   carte a un recto et un verso, comme la vraie. */

const carteRecto = {
  pacing: r =>
    '<div class="ka-def"><table class="ka-p"><tr><th>point</th><th>km</th><th>reste</th>' +
      '<th>cible</th><th>barr.</th><th>marge</th></tr>' +
    r.lignes.map(l => '<tr class="' + (l.fort ? 'fort ' : '') +
      (l.alerte ? 'al ' : '') + (l.haut ? 'haut ' : '') + (l.dur ? 'dur' : '') + '">' +
      '<td class="ka-n">' + l.p + '</td><td>' + l.km + '</td>' +
      '<td class="ka-r">' + l.r + '</td><td class="ka-c">' + l.c + '</td>' +
      '<td class="ka-b">' + l.b + '</td><td class="ka-m">' + l.m + '</td></tr>').join('') +
    '</table></div>' +
    r.alertes.map(a => '<div class="ka-al">' + a + '</div>').join(''),

  plans: r =>
    '<div class="ka-t">' + r.titre + '</div>' +
    '<table class="ka-b2">' + r.planB.map(x =>
      '<tr class="' + (x.fort ? 'fort' : '') + '"><td>' + x.p + '</td>' +
      '<td class="ka-c">' + x.h + '</td><td class="ka-m">' + x.m + '</td></tr>').join('') + '</table>' +
    '<div class="ka-t rouge">' + r.survieTitre + '</div>' +
    '<div class="ka-sv">' + r.survie.map(x =>
      '<div><i>' + x.p + '</i><b>' + x.h + '</b></div>').join('') + '</div>' +
    '<div class="ka-cle"><b>' + r.cle.titre + '</b>' +
      '<div class="ka-ch">' + r.cle.chiffre + '</div>' +
      '<p>' + r.cle.txt + '</p></div>',

  protocole: r =>
    '<div class="ka-t">' + r.titre + '<small>' + r.sousTitre + '</small></div>' +
    r.etapes.map(e => '<div class="ka-e' + (e.cle ? ' cle' : '') + '">' +
      '<b>' + e.n + '</b><div>' + e.txt +
      (e.alerte ? '<em>' + e.alerte + '</em>' : '') + '</div></div>').join(''),

  trient: r =>
    '<div class="ka-t">' + r.titre + '</div>' +
    r.etapes.map(e => '<div class="ka-e' + (e.cle ? ' cle' : '') + '">' +
      '<b>' + e.n + '</b><div>' + e.txt + '</div></div>').join('') +
    '<div class="ka-mt">' + r.mental + '</div>' +
    '<div class="ka-t">' + r.cafeineTitre + '</div>' +
    '<table class="ka-caf">' + r.cafeine.map(c =>
      '<tr><td>' + c.n + '</td><td>' + c.ou +
      (c.note ? '<small>' + c.note + '</small>' : '') + '</td>' +
      '<td>' + c.quoi + '</td><td class="ka-mg">' + c.mg + '</td></tr>').join('') + '</table>' +
    r.cafeineRegles.map(x => '<div class="ka-al">' + x + '</div>').join('') +
    '<div class="ka-t">' + r.modesTitre + '</div>' +
    r.modes.map(m => '<div class="ka-md' + (m.fort ? ' fort' : '') + '">' +
      '<b>' + m.m + '</b><span>' + m.ou + '</span></div>').join('') +
    '<div class="ka-mn">' + r.modesNote + '</div>',

  regles: r =>
    '<div class="ka-t">' + r.titre + '</div>' +
    r.regles.map(x => '<div class="ka-rg' + (x.cle ? ' cle' : '') + '">' +
      '<b>' + x.n + '</b><div><span>' + x.t + '</span><small>' + x.s + '</small></div></div>').join('') +
    '<div class="ka-cle"><b>' + r.marge.titre + '</b>' +
      '<p>' + r.marge.txt + '</p>' +
      '<div class="ka-dv">' + r.marge.devise + '</div></div>',

  arbre: r =>
    '<div class="ka-t">' + r.titre + '</div>' +
    r.branches.map(b => '<div class="ka-br ' + b.c + '">' +
      '<b>' + b.t + '</b><div class="ka-ac">' + b.a + '</div>' +
      '<p>' + b.d + '</p></div>').join('') +
    '<div class="ka-sg">' + r.signal + '</div>' +
    '<div class="ka-t">' + r.chaussettes.titre + '</div>' +
    '<div class="ka-ck"><b>' + r.chaussettes.depart + '</b>' +
      '<div class="ka-ok">' + r.chaussettes.garde + '</div>' +
      '<div class="ka-no">' + r.chaussettes.change + '</div>' +
      '<small>' + r.chaussettes.ou + '</small></div>' +
    '<div class="ka-an"><b>' + r.analgesie.titre + '</b><p>' + r.analgesie.txt + '</p></div>',

  contacts: r =>
    '<div class="ka-t">' + r.titre + '</div>' +
    '<div class="ka-ec"><b>' + r.aEcrire.quoi + '</b>' +
      '<div class="ka-vide"></div><small>' + r.aEcrire.txt + '</small></div>' +
    '<div class="ka-pv">' + r.prive + '</div>' +
    '<div class="ka-al">' + r.codeNote + '</div>',

  arrivee: r =>
    '<div class="ka-t">' + r.titre + '</div>' +
    '<ul class="ka-ar">' + r.liste.map(x => '<li>' + x + '</li>').join('') + '</ul>' +
    '<div class="ka-bl"><b>' + r.balise.txt + '</b>' +
      '<div>' + r.balise.ou + ' &#183; <em>' + r.balise.enjeu + '</em></div>' +
      '<p>' + r.balise.note + '</p></div>'
};

const faceCarte = f => (carteRecto[f.type] || (() => ''))(f);

function traceCartes() {
  const h = document.getElementById('cartesHote');
  if (!h) return;
  h.innerHTML =
    '<div class="cx-n">' + CARTES.note + '</div>' +
    CARTES.liste.map(c =>
      '<details class="cx" data-cx="' + c.n + '">' +
        '<summary><b>' + c.n + '</b>' +
          '<div><span>' + c.titre + '</span><i>' + c.ou + '</i>' +
          '<em>' + c.sous + '</em></div></summary>' +
        '<p class="cx-pq">' + c.pourquoi + '</p>' +
        '<div class="cx-face"><div class="cx-lb">recto</div>' + faceCarte(c.recto) + '</div>' +
        '<div class="cx-face"><div class="cx-lb">verso</div>' + faceCarte(c.verso) + '</div>' +
      '</details>').join('') +
    '<div class="cx-r">' + CARTES.rappel + '</div>' +
    '<button class="dn-btn plein large" id="cxImp">Imprimer les 4 cartes</button>';

  const b = document.getElementById('cxImp');
  if (b) b.addEventListener('click', () => {
    // a l'impression, tout doit etre deplie : un <details> ferme ne s'imprime pas
    h.querySelectorAll('details').forEach(d => d.open = true);
    setTimeout(() => window.print(), 60);
  });
}

/* Le profil officiel UTMB. Il porte les pictogrammes de services par poste —
   repas chaud, assistance, sac de delestage — que notre profil vectoriel n'a
   pas. Il pese 370 Ko et se charge normalement : `loading="lazy"` ne se
   declenchait pas, la vue Trace etant masquee au moment ou le navigateur
   analyse la page. Le service worker le met en cache, donc il reste
   consultable hors ligne. */
function traceProfilOfficiel() {
  const h = document.getElementById('profilOffHote');
  if (!h) return;
  h.innerHTML =
    '<div class="po-n">Le profil publié par l\'UTMB, avec les pictogrammes de ' +
      'services à chaque poste. ' + PARCOURS.distanceOfficielle + ' km &#183; ' +
      PARCOURS.dplusOfficiel + ' m D+.</div>' +
    '<div class="po-cadre"><a class="po-i" href="assets/ccc_100km_profil.png" ' +
      'target="_blank" rel="noopener">' +
      '<img src="assets/ccc_100km_profil.png" alt="Profil officiel de la CCC 2026" ' +
      'decoding="async"></a></div>' +
    '<div class="po-a">Fais glisser vers la droite pour parcourir les 100 km. ' +
      'Touche l\'image pour l\'ouvrir en grand.</div>' +
    '<div class="po-s">' + PARCOURS.pointeLaSortie + '</div>';
}

/* ==================== la carte ====================
   Dessinee depuis la trace GPX reelle, en SVG, sans aucune tuile : elle
   s'affiche a plat de batterie et sans reseau, ce qui est exactement la
   situation du 28 a 3 h du matin au-dessus de Vallorcine.

   Le fond de carte en ligne est un BONUS, comme la meteo : coche par Pierre,
   charge seulement s'il y a du reseau, et son absence ne casse rien.

   Projection : Mercator spherique, en pixels-monde au zoom 18. Ce choix n'est
   pas cosmetique — c'est ce qui permet de poser les tuiles a leur place exacte
   sans une seule ligne de trigonometrie supplementaire, une tuile au zoom z
   mesurant simplement ECHELLE / 2^z. */

const Z_BASE = 18;
const ECHELLE = 256 * Math.pow(2, Z_BASE);
const CLE_CARTE = 'ccc-v2-carte';

const vueCarte = { x: 0, y: 0, w: 0, k: 1 };   // viewBox courante
let curseurKm = null;                          // null = pas de curseur pose
let fondEnLigne = false;

function mercBrut(lon, lat) {
  const s = Math.sin(lat * Math.PI / 180);
  return [
    (lon + 180) / 360 * ECHELLE,
    (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * ECHELLE
  ];
}

/* Au zoom 18, le Mont-Blanc tombe autour de x = 34 800 000. C'est AU-DELA de
   2^24, la limite ou un float32 cesse de representer les entiers exactement :
   le moteur perd des elements en route, et les cercles atterrissent a des
   milliers de pixels de leur place alors que le trace, lui, s'affiche.
   On ramene donc l'origine au coin de la course. Comme la meme constante est
   retiree au trace, aux pastilles ET aux tuiles, l'alignement est intact. */
const ORIGINE = mercBrut(TRACE.bornes.lonMin, TRACE.bornes.latMax);

function merc(lon, lat) {
  const [x, y] = mercBrut(lon, lat);
  return [x - ORIGINE[0], y - ORIGINE[1]];
}

/* Les points projetes une fois pour toutes : 911 sinus par rendu serait du
   gaspillage sur un telephone. */
let projete = null;
function projection() {
  if (projete) return projete;
  projete = TRACE.points.map(p => {
    const [x, y] = merc(p[0], p[1]);
    return { x, y, km: p[2], alt: p[3] };
  });
  return projete;
}

function cadreTrace() {
  const P = projection();
  const xs = P.map(p => p.x), ys = P.map(p => p.y);
  return { x0: Math.min(...xs), x1: Math.max(...xs),
           y0: Math.min(...ys), y1: Math.max(...ys) };
}

function recadre() {
  const c = cadreTrace();
  const marge = Math.max(c.x1 - c.x0, c.y1 - c.y0) * 0.08;
  vueCarte.x = c.x0 - marge;
  vueCarte.y = c.y0 - marge;
  vueCarte.w = (c.x1 - c.x0) + marge * 2;
  vueCarte.h = (c.y1 - c.y0) + marge * 2;
  // carre : le parcours est une boucle, aucune orientation ne merite d'etre
  // privilegiee, et un cadre carre survit a toutes les largeurs d'ecran
  const cote = Math.max(vueCarte.w, vueCarte.h);
  vueCarte.x -= (cote - vueCarte.w) / 2;
  vueCarte.y -= (cote - vueCarte.h) / 2;
  vueCarte.w = vueCarte.h = cote;
}

/* Le km le plus proche d'un point ecran : sert au tap sur la trace. */
function kmLePlusProche(x, y) {
  const P = projection();
  let best = 0, d2 = Infinity;
  for (const p of P) {
    const d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
    if (d < d2) { d2 = d; best = p.km; }
  }
  return best;
}

function pointAuKm(km) {
  const P = projection();
  for (let i = 1; i < P.length; i++) {
    if (km <= P[i].km) {
      const a = P[i - 1], b = P[i];
      const t = (km - a.km) / ((b.km - a.km) || 1);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t,
               alt: Math.round(a.alt + (b.alt - a.alt) * t) };
    }
  }
  return P[P.length - 1];
}

/* La trace coupee en segments jour et nuit selon le scenario actif. C'est ce
   qui transforme un trait en projection de course : on VOIT ou la nuit tombe. */
function segmentsJourNuit(jalons) {
  const P = projection();
  const seg = [];
  let cour = null;
  for (const p of P) {
    const h = heureAu(p.km, jalons).getHours();
    const nuit = h >= NUIT_DE || h < NUIT_A;
    if (!cour || cour.nuit !== nuit) {
      if (cour) cour.pts.push(p);          // on rejoint, sinon un trou apparait
      cour = { nuit, pts: [] };
      seg.push(cour);
    }
    cour.pts.push(p);
  }
  return seg.filter(s => s.pts.length > 1);
}

/* Le kilometre ou la nuit tombe pour de bon, selon le scenario actif. */
function kmDeLaNuit(jalons) {
  for (let k = 0; k <= TRACE.kmTotal; k += 0.5) {
    if (heureDeNuit(hhmm(heureAu(k, jalons)))) return k;
  }
  return TRACE.kmTotal;
}

const chemin = pts => pts.map((p, i) =>
  (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join('');

/* Les tuiles. On choisit le zoom qui donne des tuiles proches de 256 px reels,
   puis on ne pose que celles qui touchent la vue. Une quinzaine, pas mille. */
function tuiles() {
  if (!fondEnLigne || !navigator.onLine) return '';
  const z = Math.max(9, Math.min(14,
    Math.round(Z_BASE - Math.log2(vueCarte.w / 256))));
  const taille = ECHELLE / Math.pow(2, z);
  const n = Math.pow(2, z);
  const mx = vueCarte.x + ORIGINE[0], my = vueCarte.y + ORIGINE[1];
  const i0 = Math.max(0, Math.floor(mx / taille));
  const i1 = Math.min(n - 1, Math.floor((mx + vueCarte.w) / taille));
  const j0 = Math.max(0, Math.floor(my / taille));
  const j1 = Math.min(n - 1, Math.floor((my + vueCarte.h) / taille));
  if ((i1 - i0 + 1) * (j1 - j0 + 1) > 40) return '';   // garde-fou
  let out = '';
  for (let i = i0; i <= i1; i++) {
    for (let j = j0; j <= j1; j++) {
      const u = 'https://' + 'abc'[(i + j) % 3] + '.tile.opentopomap.org/' +
        z + '/' + i + '/' + j + '.png';
      out += '<image href="' + u + '" x="' + (i * taille - ORIGINE[0]).toFixed(1) +
        '" y="' + (j * taille - ORIGINE[1]).toFixed(1) +
        '" width="' + taille.toFixed(1) + '" height="' + taille.toFixed(1) +
        '" preserveAspectRatio="none"/>';
    }
  }
  return '<g class="ct-tuiles">' + out + '</g>';
}

function traceCarte() {
  const h = document.getElementById('carteHote');
  if (!h) return;
  if (!vueCarte.w) recadre();

  const jalons = jalonsHoraires(scenarioActif());
  const seg = segmentsJourNuit(jalons);
  const vb = [vueCarte.x, vueCarte.y, vueCarte.w, vueCarte.h]
    .map(v => v.toFixed(1)).join(' ');
  const ep = vueCarte.w / 150;          // epaisseur constante a l'ecran

  const bornes = METEO_POINTS.map(pt => {
    const [x, y] = merc(pt.lon, pt.lat);
    return { ...pt, x, y };
  });

  const cur = curseurKm == null ? null : pointAuKm(curseurKm);

  h.innerHTML =
    '<div class="ct-tete">' +
      '<div><b>La carte</b><small>' + kmFmt(TRACE.kmTotal) + ' km levés au GPS</small></div>' +
      '<div class="ct-b">' +
        '<button id="ctFond" class="' + (fondEnLigne ? 'on' : '') + '">Relief</button>' +
        '<button id="ctZoom">Tout voir</button>' +
      '</div></div>' +

    '<svg class="ct" id="ctSvg" viewBox="' + vb + '" preserveAspectRatio="xMidYMid meet">' +
      tuiles() +
      // l'ombre portee donne le relief que la trace seule n'a pas
      '<path d="' + chemin(projection()) + '" class="ct-ombre" ' +
        'stroke-width="' + (ep * 2.4) + '"/>' +
      seg.map(s => '<path d="' + chemin(s.pts) + '" class="ct-l ' +
        (s.nuit ? 'nuit' : 'jour') + '" stroke-width="' + ep + '"/>').join('') +
      bornes.map(b => '<g class="ct-pt t-' + b.type + '" data-km="' + b.km + '">' +
        '<circle cx="' + b.x.toFixed(1) + '" cy="' + b.y.toFixed(1) +
          '" r="' + (ep * 2.3).toFixed(1) + '" stroke-width="' + (ep * 0.9).toFixed(1) + '"/>' +
        '<circle cx="' + b.x.toFixed(1) + '" cy="' + b.y.toFixed(1) +
          '" r="' + (ep * 4.2).toFixed(1) + '" class="ct-tap"/>' +
        '</g>').join('') +
      (cur ? '<g class="ct-cur"><circle cx="' + cur.x.toFixed(1) + '" cy="' + cur.y.toFixed(1) +
        '" r="' + (ep * 3.2).toFixed(1) + '" class="ct-halo"/>' +
        '<circle cx="' + cur.x.toFixed(1) + '" cy="' + cur.y.toFixed(1) +
        '" r="' + (ep * 1.6).toFixed(1) + '"/></g>' : '') +
    '</svg>' +

    '<input type="range" class="ct-r" id="ctRange" min="0" max="' + TRACE.kmTotal +
      '" step="0.1" value="' + (curseurKm == null ? 0 : curseurKm) + '"' +
      ' style="--bascule:' + (kmDeLaNuit(jalons) / TRACE.kmTotal * 100).toFixed(1) + '%">' +
    '<div class="ct-info" id="ctInfo"></div>' +
    (fondEnLigne ? '<div class="ct-attr">Fond © OpenTopoMap · données © OpenStreetMap</div>' : '') +
    '<div class="ct-aide">Fais glisser le curseur : tu vois où tu seras, à quelle heure, ' +
      'et le temps qu\'il y fera. Touche un point pour t\'y poser.</div>';

  majInfoCarte();
  brancheCarte();
}

/* Ce que le curseur raconte : l'endroit, l'heure, l'altitude, et la meteo du
   point de passage le plus proche. C'est ca, la projection de course. */
function majInfoCarte() {
  const z = document.getElementById('ctInfo');
  if (!z) return;
  if (curseurKm == null) {
    z.innerHTML = '<div class="ct-vide">Le trait ambre est le jour, l\'indigo est la nuit.</div>';
    return;
  }
  const jalons = jalonsHoraires(scenarioActif());
  const quand = heureAu(curseurKm, jalons);
  const p = pointAuKm(curseurKm);

  // le point de passage le plus proche donne le nom et, s'il y en a une, la meteo
  let proche = METEO_POINTS[0], ec = Infinity;
  METEO_POINTS.forEach(x => {
    const d = Math.abs(x.km - curseurKm);
    if (d < ec) { ec = d; proche = x; }
  });

  let meteo = '';
  if (meteoPrevue && meteoPrevue.points && meteoPrevue.points.length) {
    const brut = meteoPrevue.points.find(x => x.nom === proche.nom);
    if (brut) {
      const l = litPoint(brut, jalons);
      const c = CODES_METEO[l.code] || { i: '·', t: '' };
      meteo = '<div class="ct-m">' + c.i + ' <b>' + Math.round(l.temp) + '°</b>' +
        '<span>ressenti ' + Math.round(l.ressenti) + '° · ' +
        (l.pluieProb == null ? '' : l.pluieProb + '% pluie · ') +
        'rafales ' + Math.round(l.rafales) + '</span></div>';
    }
  }

  z.innerHTML =
    '<div class="ct-h"><b>' + hhmm(quand) + '</b>' +
      '<i>' + (quand.getDate() === 28 ? 'vendredi' : 'samedi') + '</i></div>' +
    '<div class="ct-l2"><span>' + kmFmt(curseurKm) + ' km</span>' +
      '<span class="ct-reste">reste ' + kmFmt(kmRestant(curseurKm)) + ' km</span>' +
      '<span>' + p.alt + ' m</span>' +
      '<span>' + (ec < 1.2 ? proche.nom : 'vers ' + proche.nom) + '</span></div>' +
    meteo;
}

function brancheCarte() {
  const svg = document.getElementById('ctSvg');
  const r = document.getElementById('ctRange');
  if (r) r.addEventListener('input', () => {
    curseurKm = +r.value;
    const c = pointAuKm(curseurKm);
    majMarqueur(c);
    majInfoCarte();
  });

  const f = document.getElementById('ctFond');
  if (f) f.addEventListener('click', () => {
    fondEnLigne = !fondEnLigne;
    store.set('carte', fondEnLigne);
    traceCarte();
  });
  const z = document.getElementById('ctZoom');
  if (z) z.addEventListener('click', () => { recadre(); traceCarte(); });

  if (!svg) return;

  // toucher un point de passage : on s'y pose
  svg.querySelectorAll('[data-km]').forEach(g =>
    g.addEventListener('click', () => {
      curseurKm = +g.dataset.km;
      const rr = document.getElementById('ctRange');
      if (rr) rr.value = curseurKm;
      majMarqueur(pointAuKm(curseurKm));
      majInfoCarte();
    }));

  /* Deplacement et zoom. Un doigt fait glisser, deux doigts pincent. On agit
     sur la viewBox et rien d'autre : aucune bibliotheque, et le trait reste
     net a tous les niveaux puisque c'est du vectoriel.

     La regle qui gouverne les deux gestes est la meme : le point du terrain
     qui etait sous les doigts au depart doit rester sous les doigts. C'est ce
     qui fait qu'un zoom ne "saute" pas. */

  const CADRE = cadreTrace();
  const LARGE_MAX = Math.max(CADRE.x1 - CADRE.x0, CADRE.y1 - CADRE.y0) * 1.4;
  const LARGE_MIN = LARGE_MAX / 60;

  const doigts = new Map();
  let debut = null;

  const boite = () => {
    const b = svg.getBoundingClientRect();
    const cote = Math.min(b.width, b.height);
    return { gx: b.left + (b.width - cote) / 2, gy: b.top + (b.height - cote) / 2, cote };
  };
  const centre = () => {
    const v = [...doigts.values()];
    return { x: v.reduce((a, p) => a + p.cx, 0) / v.length,
             y: v.reduce((a, p) => a + p.cy, 0) / v.length };
  };
  const ecart = () => {
    const v = [...doigts.values()];
    return v.length < 2 ? 0 : Math.hypot(v[0].cx - v[1].cx, v[0].cy - v[1].cy);
  };

  const prend = e => {
    doigts.set(e.pointerId, { cx: e.clientX, cy: e.clientY });
    const b = boite();
    debut = { x: vueCarte.x, y: vueCarte.y, w: vueCarte.w,
              c: centre(), e: ecart(), b, bouge: false };
  };

  svg.addEventListener('pointerdown', e => {
    // On enregistre le doigt AVANT de tenter la capture : setPointerCapture
    // peut lever (id inconnu, pointeur deja relache), et le second doigt
    // n'etait alors jamais compte — le pincement retombait en simple
    // deplacement, sans zoom.
    prend(e);
    try { svg.setPointerCapture(e.pointerId); } catch (err) { /* sans capture, ca marche quand meme */ }
  });

  svg.addEventListener('pointermove', e => {
    if (!doigts.has(e.pointerId) || !debut) return;
    e.preventDefault();
    doigts.set(e.pointerId, { cx: e.clientX, cy: e.clientY });

    const c = centre();
    if (Math.hypot(c.x - debut.c.x, c.y - debut.c.y) > 4) debut.bouge = true;

    // largeur : le pincement la divise, un seul doigt la laisse tranquille
    let w = debut.w;
    const ec = ecart();
    if (doigts.size >= 2 && debut.e > 8 && ec > 8) {
      w = Math.max(LARGE_MIN, Math.min(LARGE_MAX, debut.w * debut.e / ec));
    }

    // le terrain qui etait sous les doigts y reste
    const { gx, gy, cote } = debut.b;
    const monde = {
      x: debut.x + (debut.c.x - gx) / cote * debut.w,
      y: debut.y + (debut.c.y - gy) / cote * debut.w
    };
    vueCarte.x = monde.x - (c.x - gx) / cote * w;
    vueCarte.y = monde.y - (c.y - gy) / cote * w;
    vueCarte.w = vueCarte.h = w;
    redessine();
  }, { passive: false });

  const lache = e => {
    doigts.delete(e.pointerId);
    if (!doigts.size) {
      // un appui franc sans deplacement pose le curseur sur la trace
      if (debut && !debut.bouge) {
        const { gx, gy, cote } = debut.b;
        const km = kmLePlusProche(
          vueCarte.x + (debut.c.x - gx) / cote * vueCarte.w,
          vueCarte.y + (debut.c.y - gy) / cote * vueCarte.w);
        curseurKm = km;
        const r2 = document.getElementById('ctRange');
        if (r2) r2.value = km;
        majMarqueur(pointAuKm(km));
        majInfoCarte();
      }
      debut = null;
      // Redessin complet une fois le doigt leve : les pastilles retrouvent leur
      // taille d'ecran, et les tuiles se reposent au bon zoom. Jamais pendant
      // le geste, ou le telephone ramerait.
      clearTimeout(svg._tuiles);
      svg._tuiles = setTimeout(traceCarte, 140);
    } else {
      prend(e);   // on repart proprement du geste restant
    }
  };
  svg.addEventListener('pointerup', lache);
  svg.addEventListener('pointercancel', lache);

  // molette sur le Mac : meme regle, le point sous le curseur ne bouge pas
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const b = boite();
    const w = Math.max(LARGE_MIN, Math.min(LARGE_MAX,
      vueCarte.w * (e.deltaY > 0 ? 1.12 : 1 / 1.12)));
    const mx = vueCarte.x + (e.clientX - b.gx) / b.cote * vueCarte.w;
    const my = vueCarte.y + (e.clientY - b.gy) / b.cote * vueCarte.w;
    vueCarte.x = mx - (e.clientX - b.gx) / b.cote * w;
    vueCarte.y = my - (e.clientY - b.gy) / b.cote * w;
    vueCarte.w = vueCarte.h = w;
    redessine();
    clearTimeout(svg._tuiles);
    svg._tuiles = setTimeout(traceCarte, 320);
  }, { passive: false });
}

/* Bouger le marqueur sans tout redessiner : le slider en emet des dizaines par
   seconde, et refaire 911 points a chaque fois ferait ramer le telephone. */
function majMarqueur(c) {
  const svg = document.getElementById('ctSvg');
  if (!svg) return;
  const ep = vueCarte.w / 150;
  let g = svg.querySelector('.ct-cur');
  if (!g) {
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'ct-cur');
    g.innerHTML = '<circle class="ct-halo"/><circle/>';
    svg.appendChild(g);
  }
  const cs = g.querySelectorAll('circle');
  cs[0].setAttribute('cx', c.x.toFixed(1)); cs[0].setAttribute('cy', c.y.toFixed(1));
  cs[0].setAttribute('r', (ep * 3.2).toFixed(1));
  cs[1].setAttribute('cx', c.x.toFixed(1)); cs[1].setAttribute('cy', c.y.toFixed(1));
  cs[1].setAttribute('r', (ep * 1.6).toFixed(1));
}

function redessine() {
  const svg = document.getElementById('ctSvg');
  if (svg) svg.setAttribute('viewBox',
    [vueCarte.x, vueCarte.y, vueCarte.w, vueCarte.h].map(v => v.toFixed(1)).join(' '));
}

/* ==================== ce qui s'est ferme du 21 au 23 ==================== */

/* Les sachets zip. Ce n'est pas du rangement : c'est ce qui remplace la
   lecture quand la frontale, le froid et la fatigue l'ont rendue impossible. */
function traceSachets() {
  const h = document.getElementById('sachetsHote');
  if (!h) return;
  h.innerHTML =
    '<div class="sh-pr">' + KITS.principe + '</div>' +
    '<div class="sh-g">' + KITS.pictos.map(p =>
      '<div class="sh' + (p.note ? ' cle' : '') + '">' +
        '<div class="sh-p">' + p.symbole + '</div>' +
        '<div class="sh-c"><b>' + p.nom + '</b><p>' + p.contenu + '</p>' +
        (p.note ? '<em>' + p.note + '</em>' : '') + '</div>' +
      '</div>').join('') + '</div>' +
    '<div class="sh-as">' + KITS.astuce + '</div>';
}

/* Ce qui a bouge depuis le plan. L'ancien reste affiche a cote du neuf :
   dans cinq jours Pierre ne se souviendra plus de ce qu'il avait prevu, et il
   doit pouvoir verifier qu'un ecart est une decision, pas un oubli. */
function traceChangements() {
  const h = document.getElementById('changeHote');
  if (!h) return;
  const C = CHANGEMENTS;
  h.innerHTML =
    C.lignes.map(l =>
      '<div class="chg ' + l.sens + '">' +
        '<div class="chg-o">' + l.objet + '</div>' +
        '<div class="chg-d"><s>' + l.avant + '</s><b>' + l.apres + '</b></div>' +
        (l.pourquoi ? '<p>' + l.pourquoi + '</p>' : '') +
      '</div>').join('') +
    (C.reserve ? '<div class="chg-res"><b>' + C.reserve.sujet + '</b>' +
      '<p>' + C.reserve.quoi + '</p>' +
      '<div class="chg-q">' + C.reserve.quand + '</div></div>' : '');
}

/* L'attention. Ce bloc explique pourquoi l'app est faite comme elle est
   faite, et surtout ou se situe le vrai risque du 28. */
function traceCognitif() {
  const h = document.getElementById('cognitifHote');
  if (!h) return;
  const G = GESTION_COGNITIVE;
  h.innerHTML =
    '<div class="cg-c">' + G.constat + '</div>' +
    '<div class="fi-titre">Pourquoi maintenant</div>' +
    G.causes.map(c => '<div class="cg-l"><i>' + c.icone + '</i><p>' + c.txt + '</p></div>').join('') +
    '<div class="cg-cc">' + G.conclusion + '</div>' +
    '<div class="fi-titre">Ce que l\'app en fait</div>' +
    G.implications.map(i => '<div class="cg-i"><i>' + i.icone + '</i><p>' + i.txt + '</p></div>').join('') +
    '<div class="cg-r"><div class="cg-rh">' + G.risqueJourJ.quoi + '</div>' +
      '<p>' + G.risqueJourJ.pourquoi + '</p>' +
      '<em>' + G.risqueJourJ.precedent + '</em></div>';
}

/* La Fenix. Ecrire « mettre une alarme » ne servirait a rien : le piege est
   qu'une alarme d'horloge NE SE REPETE PAS. D'ou les chemins mot pour mot. */
function traceMontre() {
  const h = document.getElementById('montreHote');
  if (!h) return;
  const reste = MONTRE.resteAFaire || [];
  h.innerHTML =
    '<div class="mo-tete"><i>' + MONTRE.statut + '</i><b>' + MONTRE.modele + '</b></div>' +

    MONTRE.reglages.map(r =>
      '<div class="mo' + (r.critique ? ' cle' : '') + (r.fait ? ' fait' : '') + '">' +
        '<div class="mo-h"><b>' + (r.fait ? '&#10003;' : r.n) + '</b>' +
          '<span>' + r.titre + '</span>' +
          (r.valeur ? '<i class="mo-v">' + r.valeur + '</i>' : '') + '</div>' +
        '<div class="mo-c">' + r.chemin + '</div>' +
        (r.pourquoi ? '<p>' + r.pourquoi + '</p>' : '') +
      '</div>').join('') +

    /* Le reste-a-faire est coche par Pierre et survit aux mises a jour : il
       passe par le meme stockage que toutes les autres cases de l'app. */
    (reste.length ? '<div class="fi-titre">Ce qu\'il reste à faire</div>' +
      '<div class="ck-liste carte-l">' + reste.map((x, i) => {
        const id = 'mo' + i;
        return '<button class="sk' + (x.critique ? ' sk-reglementaire' : ' sk-perso') +
          (coche(id) ? ' ok' : '') + '" data-mo="' + id + '">' +
          '<i class="ck-box"></i><span class="sk-t">' + x.txt +
          (x.pourquoi ? '<small>' + x.pourquoi + '</small>' : '') + '</span></button>';
      }).join('') + '</div>' : '');

  h.querySelectorAll('[data-mo]').forEach(b =>
    b.addEventListener('click', () => { basculeCoche(b.dataset.mo); traceMontre(); }));
}

/* La prise de sang. La conclusion d'abord : c'est elle qui change quelque
   chose, pas la liste des valeurs. */
function traceSang() {
  const h = document.getElementById('sangHote');
  if (!h) return;
  const P = PRISE_DE_SANG;
  const d = dateDe(P.date);
  h.innerHTML =
    '<div class="sg-cc"><b>' + P.conclusion.titre + '</b><p>' + P.conclusion.txt + '</p></div>' +
    '<div class="sg-d">Prélèvement du ' + d.getDate() + ' ' + MOIS[d.getMonth()] + '</div>' +
    '<ul class="sg-ok">' + P.rassurant.map(x => '<li>' + x + '</li>').join('') + '</ul>' +
    '<div class="fi-titre">À surveiller, après la course</div>' +
    P.aSurveiller.map(x => '<div class="sg-s"><b>' + x.valeur + '</b><p>' + x.note + '</p></div>').join('') +
    '<div class="sg-pr">' + P.aProgrammer + '</div>';
}

/* Physio de la semaine. Le readiness a 28 du jeudi ne veut pas dire fatigue :
   il ne mesure que la duree. */
function tracePhysio() {
  const h = document.getElementById('physioHote');
  if (!h) return;
  h.innerHTML =
    '<table class="py"><tr><th></th><th>sommeil</th><th>FC</th><th>VFC</th><th>BB</th><th>prêt</th></tr>' +
    PHYSIO.jours.map(j =>
      '<tr class="' + (j.bon ? 'bon' : (j.mauvais ? 'bof' : '')) + '">' +
      '<td>' + j.j + '</td><td>' + j.sommeil + '</td><td>' + j.fc + '</td>' +
      '<td>' + j.vfc + '</td><td>' + j.bb + '</td><td><b>' + j.readiness + '</b></td></tr>' +
      (j.note ? '<tr class="py-n"><td colspan="6">' + j.note + '</td></tr>' : '')).join('') +
    '</table>' +
    '<div class="py-ch">' + PHYSIO.charge + '</div>' +
    '<div class="py-l">' + PHYSIO.lecture + '</div>' +
    '<div class="py-c"><b>Pourquoi</b>' + PHYSIO.causes + '</div>' +
    '<ul class="py-f">' + PHYSIO.correctifs.map(x => '<li>' + x + '</li>').join('') + '</ul>';
}

/* ---- le dossier chaussettes ----
   Deux modeles, une decision au 27. L'ecran doit montrer les deux colonnes de
   la bifurcation, sinon le jour J on hesite. */
function traceChaussettes() {
  const hote = document.getElementById('chaussHote');
  if (!hote || !SAC.chaussettes) return;
  const C = SAC.chaussettes;

  const paires = n => n + (n > 1 ? ' paires' : ' paire');
  const NOMS = { auxPieds: 'aux pieds', sacDeCourse: 'sac de course',
                 sacChampex: 'sac de Champex', valise: 'valise' };

  hote.innerHTML =
    '<div class="ch-verdict"><i>' + C.statut + '</i><b>' + C.decision + '</b></div>' +

    '<div class="ch-duo">' +
      '<div class="ch ok"><i>au départ</i><b>' + C.depart.modele + '</b>' +
        '<small>' + C.depart.ref + '</small>' +
        '<p>' + C.depart.preuve + '</p></div>' +
      '<div class="ch sec"><i>secours</i><b>' + C.secours.modele + '</b>' +
        '<small>' + paires(C.secours.paires) + ' &#183; ' + C.secours.ref + '</small>' +
        '<p>' + C.secours.preuve + '</p></div>' +
    '</div>' +

    '<div class="fi-titre">Le jour J</div>' +
    '<div class="ch-r oui">' + Object.keys(C.repartitionJourJ).map(k =>
      '<div class="ch-rl"><span>' + (NOMS[k] || k) + '</span>' +
      C.repartitionJourJ[k] + '</div>').join('') + '</div>' +

    /* Les deux signaux se ressemblent sous la fatigue. C'est la seule chose
       qui reste a decider en course, donc elle passe en gros. */
    '<div class="fi-titre">En course, le seul arbitrage qui reste</div>' +
    '<div class="ch-reg"><b>' + C.regleEnCourse.quand + '</b>' +
      '<small>' + C.regleEnCourse.ou + '</small></div>' +
    '<div class="ch-sig rouge">' + C.regleEnCourse.signalRouge + '</div>' +
    '<div class="ch-sig verte">' + C.regleEnCourse.signalOk + '</div>' +

    '<ul class="ch-af">' + C.aFaire.map(x => '<li>' + x + '</li>').join('') + '</ul>';
}

/* ---- gants et telephone ---- */
function traceGants() {
  const g = SAC.gants;
  document.getElementById('gantsHote').innerHTML =
    '<div class="gt-r">' + g.regleUnique + '</div>' +
    '<div class="gt-m">' + g.mode + '</div>' +
    g.paliers.map((x, i) => '<div class="gt"><b>' + (i + 1) + '</b><div><b>' + x.conditions + '</b>' +
      '<small>' + x.config + '</small></div></div>').join('') +
    '<div class="gt-res"><span>Réserve</span>' + g.reserve.objet + ' &#183; ' + g.reserve.ou +
      '<small>' + g.reserve.decision + '</small></div>' +
    '<div class="gt-reg"><span>Réglementaire</span>' + g.reglementaire.note + '</div>';

  const t = SAC.telephone;
  document.getElementById('telHote').innerHTML =
    '<div class="tl-int">' + t.interdit + '</div>' +
    '<div class="tl-d">' + t.diagnostic + '</div>' +
    '<div class="ck-liste carte-l">' + t.protocole.map(x =>
      '<button class="sk sk-perso' + (coche(x.id) ? ' ok' : '') + '" data-sac="' + x.id + '">' +
      '<i class="ck-box"></i><span class="sk-t">' + x.txt +
      (x.detail ? '<small>' + x.detail + '</small>' : '') + '</span></button>').join('') + '</div>' +
    '<div class="gt-res"><span>Les deux longs chauds</span>' + SAC.longsChauds.principe +
      '<small>' + SAC.longsChauds.consequence + '</small></div>';

  document.querySelectorAll('#telHote [data-sac]').forEach(b =>
    b.addEventListener('click', () => { basculeCoche(b.dataset.sac); traceGants(); }));
}

/* ---- stock et cafeine ---- */
function traceStock() {
  const st = NUT.stock;
  document.getElementById('stockHote').innerHTML =
    '<div class="st-h"><div><span>unités</span><b>' + st.totalUnites + '</b></div>' +
      '<div><span>glucides</span><b>' + st.totalGlucidesG + ' g</b></div>' +
      '<div><span>statut</span><b class="ok">fermé</b></div></div>' +
    '<div class="st-l">' + st.items.map(x =>
      '<div class="st"><b>' + x.qte + '</b><div class="st-c"><b>' + x.nom + '</b>' +
      '<small>' + x.glucides + ' g' + (x.cafeine ? ' · ☕ ' + x.cafeine + ' mg' : '') +
      (x.note ? ' · ' + x.note : '') + '</small></div></div>').join('') + '</div>' +
    '<div class="st-ss"><b>' + NUT.sucreSale.principe + '</b>' +
      '<div class="st-trou">' + NUT.sucreSale.trou + '</div>' +
      '<p>' + NUT.sucreSale.action + '</p><p>' + NUT.sucreSale.action2 + '</p></div>' +
    '<div class="fi-titre">Répartition</div>' +
    [NUT.repartition.depart, NUT.repartition.champex].map(r =>
      '<div class="nu-ch"><b>' + r.label + '</b><ul class="nu-ul">' +
      r.contenu.map(c => '<li>' + c + '</li>').join('') + '</ul></div>').join('') +
    '<details class="nu-det"><summary>Ce que le document officiel corrige</summary>' +
      NUT.corrections.map(c => '<div class="cor"><b>' + c.apres + '</b>' +
        '<p>' + c.consequence + '</p>' +
        (c.aVerifier ? '<small>' + c.aVerifier + '</small>' : '') + '</div>').join('') +
      '<p class="nu-src">' + NUT.meta.sourceRavitos + '</p></details>';

  document.getElementById('cafHote').innerHTML =
    '<div class="st-h"><div><span>total</span><b>' + NUT.cafeineTotal + '</b></div></div>' +
    NUT.cafeine.map(c => '<div class="nu-cf' + (c.n === 'R' ? ' res' : '') + '"><b>' + c.n + '</b>' +
      '<div class="nu-cf-c"><b>' + c.ou + '</b><small>' + c.produit + (c.mg ? ' · ' + c.mg + ' mg' : '') +
      '<br>' + c.pourquoi + '</small></div><i>' + c.quand + '</i></div>').join('') +
    '<div class="st-r">' + NUT.cafeineRegles.map(r => '<p>' + r + '</p>').join('') + '</div>';
}

/* ---- pourquoi tu peux le faire ---- */
function ouvreConfiance() {
  const c = CONFIANCE;
  ouvreFeuille(c.titre,
    '<div class="cf-ref">' + c.reference + '</div>' +
    '<table class="cf-t"><tr><th></th><th>Wildstrubel</th><th>CCC</th></tr>' +
    c.comparaison.map(x => '<tr class="' + (x.cle ? 'cle' : '') + '"><td>' + x.quoi + '</td>' +
      '<td>' + x.wild + '</td><td>' + x.ccc + '</td></tr>').join('') + '</table>' +
    c.messages.map(m => '<div class="cf-m"><b>' + m.n + ' &#183; ' + m.titre + '</b><p>' + m.txt + '</p></div>').join('') +
    '<div class="cf-v"><b>' + c.vigilance.titre + '</b><p>' + c.vigilance.txt + '</p>' +
    '<p class="cc">' + c.vigilance.conclusion + '</p></div>');
}

/* ==================== le sac : checklist materiel ====================
   Source : sac-data.js. Deux axes de lecture, trois niveaux de criticite,
   kits conditionnels, et les verifications traitees a part. */

let coches = store.get('check', {}) || {};
let sacMode = store.get('sacMode', 'jour');
let fRouge = store.get('sacRouge', false);
let fReste = store.get('sacReste', false);
let kitsActifs = store.get('kits', null);
if (!kitsActifs) {
  kitsActifs = {};
  SAC.kits.forEach(k => { kitsActifs[k.id] = !!k.defautActif; });
  store.set('kits', kitsActifs);
}

const coche = id => coches[id] === true;
function basculeCoche(id) { coches[id] = !coche(id); store.set('check', coches); }

// les items des kits actifs comptent comme des items reglementaires du sac
function itemsKits() {
  const out = [];
  SAC.kits.forEach(k => {
    if (!kitsActifs[k.id]) return;
    k.items.forEach(i => out.push(Object.assign({}, i, {
      zone: 'sac', phase: 'verif', kit: k.label
    })));
  });
  return out;
}
const tousItems = () => SAC.items.concat(itemsKits());

// 6. la progression exclut le confort, sinon 100 % ne veut rien dire
function avancement(liste) {
  const compte = liste.filter(i => i.crit !== 'confort');
  const f = compte.filter(i => coche(i.id)).length;
  return { f, t: compte.length, pct: compte.length ? Math.round((f / compte.length) * 100) : 100 };
}

const PUCE = { reglementaire: '🔴', perso: '🟠', confort: '⚪' };

// anneau de progression : a zero, le bout arrondi laisserait un point parasite
function anneau(pct) {
  const arc = pct > 0
    ? '<circle class="fg" cx="18" cy="18" r="15.5" pathLength="100" stroke-dasharray="' +
      pct.toFixed(1) + ' 100"/>'
    : '';
  return '<svg class="ck-ring" viewBox="0 0 36 36" aria-hidden="true">' +
    '<circle class="bg" cx="18" cy="18" r="15.5" pathLength="100"/>' + arc + '</svg>';
}

function ligneItem(i) {
  if (fRouge && i.crit !== 'reglementaire') return '';
  if (fReste && coche(i.id)) return '';
  return '<button class="sk sk-' + i.crit + (coche(i.id) ? ' ok' : '') + '" data-sac="' + i.id + '">' +
    '<i class="ck-box"></i><span class="sk-t">' + i.txt +
    (i.kit ? ' <em class="sk-kit">' + i.kit + '</em>' : '') +
    (i.detail ? '<small>' + i.detail + '</small>' : '') + '</span></button>';
}

function bloc(titre, sous, items, extra) {
  const lignes = items.map(ligneItem).join('');
  if (!lignes) return '';
  const a = avancement(items);
  return '<div class="ck-grp' + (a.f === a.t ? ' fini' : '') + '">' +
    '<div class="ck-grp-tete">' + anneau(a.pct) +
      '<div class="ck-grp-nom">' + titre + (sous ? '<small>' + sous + '</small>' : '') + '</div>' +
      '<div class="ck-grp-cpt">' + a.f + '/' + a.t + '</div></div>' +
    (extra || '') +
    '<div class="ck-liste">' + lignes + '</div></div>';
}

function traceSac() {
  const tous = tousItems();
  const a = avancement(tous);
  const rouges = tous.filter(i => i.crit === 'reglementaire');
  const ar = avancement(rouges);

  document.getElementById('sacTete').innerHTML =
    '<div class="ck-pct"><b>' + a.pct + '</b><i>%</i><span>prêt</span></div>' +
    '<div class="ck-piste"><i style="width:' + a.pct + '%"></i></div>' +
    '<div class="ck-compte">' + a.f + ' / ' + a.t + ' hors confort &#183; ' +
      '<b class="sk-rouge">' + ar.f + '/' + ar.t + ' réglementaires</b></div>' +
    '<div class="sk-leg">🔴 contrôlable, DSQ si absent &#183; 🟠 critique pour toi &#183; ⚪ confort</div>';

  let h = '';
  if (sacMode === 'jour') {
    SAC.meta.phases.forEach(p => {
      const d = dateDe(p.date);
      const items = tous.filter(i => i.phase === p.id);
      h += bloc(p.label + ' &#183; ' + d.getDate() + ' ' + MOIS[d.getMonth()], p.note, items);
    });
  } else {
    SAC.meta.zones.forEach(z => {
      const items = tous.filter(i => i.zone === z.id);
      // 8. les interdits remontent en tete du sac d'allegement
      const extra = z.id === 'allegement'
        ? '<div class="sk-non"><span>' + SAC.interdits.allegement.titre + '</span>' +
          SAC.interdits.allegement.items.map(x => '<b>' + x + '</b>').join(' &#183; ') +
          '<p>' + SAC.interdits.allegement.note + '</p></div>'
        : (z.id === 'bagage'
          ? '<div class="sk-non info"><span>' + SAC.interdits.retour.titre + '</span><p>' +
            SAC.interdits.retour.note + '</p></div>' : '');
      h += bloc(z.label, z.sub, items, extra);
    });
  }
  if (!h) h = '<div class="vide">Rien à afficher avec ces filtres.</div>';
  document.getElementById('sacHote').innerHTML = h;

  document.querySelectorAll('#sacHote [data-sac]').forEach(b =>
    b.addEventListener('click', () => { basculeCoche(b.dataset.sac); traceSac(); majEtat(); }));

  document.querySelectorAll('#sacMode button').forEach(b =>
    b.classList.toggle('on', b.dataset.mode === sacMode));
  document.getElementById('fRouge').classList.toggle('on', fRouge);
  document.getElementById('fReste').classList.toggle('on', fReste);
  traceKits();
}

// 5. les kits conditionnels
function traceKits() {
  document.getElementById('kitsHote').innerHTML =
    '<details class="carte kits"' + '><summary>Kits conditionnels &#183; ' +
      SAC.kits.filter(k => kitsActifs[k.id]).length + ' actif(s)</summary>' +
      '<p class="kits-r">' + SAC.meta.reglement2026 + '</p>' +
      SAC.kits.map(k => '<div class="kit">' +
        '<button class="kit-t' + (kitsActifs[k.id] ? ' on' : '') + '" data-kit="' + k.id + '">' +
          '<i></i>' + k.label + '</button>' +
        (k.pourquoi ? '<p>' + k.pourquoi + '</p>' : '') +
        '<ul>' + k.items.map(i => '<li>' + i.txt + '</li>').join('') + '</ul>' +
      '</div>').join('') +
    '</details>';
  document.querySelectorAll('#kitsHote [data-kit]').forEach(b =>
    b.addEventListener('click', e => {
      e.preventDefault();
      kitsActifs[b.dataset.kit] = !kitsActifs[b.dataset.kit];
      store.set('kits', kitsActifs); traceSac(); majEtat();
    }));
}

// 4. les verifications sont des ACTIONS, pas des rangements
function traceVerifs() {
  const v = SAC.verifications;
  v.forEach(x => { if (x.fait && coches[x.id] === undefined) coches[x.id] = true; });
  const f = v.filter(x => coche(x.id)).length;

  document.getElementById('verifIntro').innerHTML =
    '<div class="ck-pct"><b>' + f + '</b><i>/ ' + v.length + '</i><span>faites</span></div>' +
    '<div class="vf-i">Ce ne sont pas des objets à ranger mais des gestes à faire. ' +
    'Cocher « gobelet » sans l\'avoir mesuré, c\'est le piège.</div>';

  document.getElementById('verifsHote').innerHTML = v.map(x => {
    const d = dateDe(x.quand);
    return '<button class="vf' + (coche(x.id) ? ' ok' : '') + ' vf-' + x.crit + '" data-vf2="' + x.id + '">' +
      '<div class="vf-l">🔍</div><div class="vf-c"><b>' + x.txt + '</b>' +
      '<small>' + x.pourquoi + '</small>' +
      '<em>' + PUCE[x.crit] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()] + '</em></div>' +
      '<i class="ck-box"></i></button>';
  }).join('');

  document.querySelectorAll('#verifsHote [data-vf2]').forEach(b =>
    b.addEventListener('click', () => { basculeCoche(b.dataset.vf2); traceVerifs(); majEtat(); }));

  document.getElementById('attHote').innerHTML = SAC.enAttente.length
    ? SAC.enAttente.map(a => {
        const d = dateDe(a.resoudreLe);
        const ec = Math.round((d - minuit(maintenant())) / 86400000);
        return '<div class="att"><i class="att-p"></i><div class="att-c">' + a.txt +
          '<small>Via ' + a.via + '</small></div>' +
          '<span class="att-q">' + (ec <= 0 ? 'à faire' : 'dans ' + ec + ' j') + '</span></div>';
      }).join('')
    : '<div class="att-vide"><i>&#10003;</i><div><b>Plus rien à trancher</b>' +
      '<small>Chaussures, chaussettes, textile, gants, lampes, nutrition, veste, ' +
      'matériel, médical : tous les dossiers sont fermés. Il ne reste que de ' +
      'l\'exécution.</small></div></div>';
}


/* ============================ accueil ============================ */

const blocCd = (val, unite) => '<div class="cd-bloc"><b>' + val + '</b><i>' + unite + '</i></div>';
const sep = '<div class="cd-sep"></div>';

let dernierCompte = '';

function majCompte() {
  const now = maintenant();
  const carte = document.getElementById('cdCarte');
  const oeil = document.getElementById('cdOeil');
  const grille = document.getElementById('cdGrille');
  const sous = document.getElementById('cdSous');

  let etiq, corps, dessous;

  if (now < DEPART) {
    const reste = DEPART - now;
    const j = Math.floor(reste / 86400000);
    const h = Math.floor(reste / 3600000) % 24;
    const m = Math.floor(reste / 60000) % 60;
    etiq = 'Départ dans';
    corps = blocCd(j, 'j') + sep + blocCd(String(h).padStart(2, '0'), 'h') + sep +
            blocCd(String(m).padStart(2, '0'), 'min');
    dessous = DEPART.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) +
              ' &#183; <b>' + hhmm(DEPART) + '</b> &#183; Courmayeur';
    carte.classList.remove('encours');
  } else {
    const ecoule = now - DEPART;
    const h = Math.floor(ecoule / 3600000);
    const m = Math.floor(ecoule / 60000) % 60;
    etiq = now > FIN ? 'Course terminée' : 'En course depuis';
    corps = blocCd(h, 'h') + sep + blocCd(String(m).padStart(2, '0'), 'min');
    dessous = 'il est <b>' + hhmm(now) + '</b> &#183; barrière finale <b>' + hhmm(FIN) + '</b>';
    carte.classList.add('encours');
  }

  const simu = store.get('simu', 0);
  if (simu) dessous += '<br><span class="cd-simu">horloge simulée</span>';

  const signature = etiq + corps + dessous;
  if (signature === dernierCompte) return;
  dernierCompte = signature;
  oeil.textContent = etiq;
  grille.innerHTML = corps;
  sous.innerHTML = dessous;
}

/* ---- ou j'en suis ---- */

function majEtat() {
  const hote = document.getElementById('etatHote');
  if (!hote) return;
  const now = maintenant();
  const j0 = minuit(now);

  // 3. « pret a X % » : les taches de l'affutage, plus les points a verifier
  const tk = toutesTaches();
  const totalTk = tk.length + AFFUTAGE.aVerifier.length;
  const faitsTk = tk.filter(t => tacheFaite(t.id)).length +
                  AFFUTAGE.aVerifier.filter(v => prepa.verif[v.id]).length;
  const pct = totalTk ? Math.round((faitsTk / totalTk) * 100) : 0;

  const mat = avancement(tousItems());
  const trous = AFFUTAGE.inconnues.filter(i => !prepa.inconnues[i.id] && !i.reponse).length;
  const jours = Math.max(0, Math.ceil((DEPART - now) / 86400000));

  const cls = p => p >= 90 ? 'ok' : (p >= 50 ? 'tiede' : '');
  let h = '<div class="et">' +
    '<div><span>jours</span><b>' + jours + '</b></div>' +
    '<div><span>prêt</span><b class="' + cls(pct) + '">' + pct + '<i>%</i></b></div>' +
    '<div><span>trous</span><b class="' + (trous ? 'tiede' : 'ok') + '">' + trous + '</b></div></div>' +
    '<div class="et-piste"><i style="width:' + pct + '%"></i></div>';

  // 7. le volume des deux semaines
  const s2 = j0 >= dateDe('2026-08-24');
  h += '<div class="et-sem">' +
    '<div class="' + (s2 ? '' : 'on') + '"><span>semaine 1 &#183; 17 au 23</span><b>' +
      AFFUTAGE.meta.volumeS1Km + ' km</b></div>' +
    '<div class="' + (s2 ? 'on' : '') + '"><span>semaine 2 &#183; 24 au 28</span><b>' +
      AFFUTAGE.meta.volumeS2Km + ' km</b></div></div>';

  h += '<div class="et-reste">' +
    '<b>' + (totalTk - faitsTk) + ' tâches</b> de prépa restantes &#183; ' +
    'matériel à <b>' + mat.pct + ' %</b> (' + (mat.t - mat.f) + ' items hors confort).' +
    '<br>' + AFFUTAGE.meta.meteoSemaine + '</div>';

  hote.innerHTML = h;
}

const MOIS = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
const JSEM = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];

const minuit = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
// Date locale en AAAA-MM-JJ. toISOString() repasse en UTC et perd un jour a l'est de Greenwich.
const isoLocal = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
                      '-' + String(d.getDate()).padStart(2, '0');

/* ==================== affutage : source de verite ====================
   Les donnees viennent de prepa-data.js, l'agenda PRO de Pierre.
   Rien n'est invente ici, on met en forme. */

let prepa = store.get('prepa', null) || {};
if (!prepa.taches) prepa.taches = {};
if (!prepa.inconnues) prepa.inconnues = {};
if (!prepa.verif) prepa.verif = {};
const sauvePrepa = () => store.set('prepa', prepa);

const dateDe = s => new Date(s + 'T00:00:00');
const jourAuj = () => AFFUTAGE.jours.find(j => dateDe(j.date).getTime() === minuit(maintenant()).getTime());
const jourCle = () => AFFUTAGE.jours.find(j => j.date === AFFUTAGE.meta.seanceCle);

const toutesTaches = () => AFFUTAGE.jours.reduce((a, j) => a.concat(j.taches || []), []);
const tacheFaite = id => prepa.taches[id] === true;

/* ---- 1. timeline horizontale J-11 -> J-0 ---- */

function traceTimelineH() {
  const j0 = minuit(maintenant());
  document.getElementById('tlhHote').innerHTML = AFFUTAGE.jours.map(j => {
    const d = dateDe(j.date);
    const ecart = Math.round((d - j0) / 86400000);
    const t = (j.taches || []);
    const reste = t.filter(x => !tacheFaite(x.id)).length;
    return '<button class="tlh-j t-' + j.type + (ecart < 0 ? ' passe' : '') +
      (ecart === 0 ? ' auj' : '') + (j.date === AFFUTAGE.meta.seanceCle ? ' cle' : '') +
      '" data-jour="' + j.date + '">' +
      '<i>' + j.j + '</i><b>' + d.getDate() + '</b><span>' + JSEM[d.getDay()] + '</span>' +
      (reste ? '<em>' + reste + '</em>' : '') + '</button>';
  }).join('');
  document.querySelectorAll('#tlhHote [data-jour]').forEach(b =>
    b.addEventListener('click', () => majJour(b.dataset.jour)));
}

/* ---- 2. la carte du jour ---- */

let jourAffiche = null;

function majJour(date) {
  const j = date ? AFFUTAGE.jours.find(x => x.date === date) : (jourAuj() || AFFUTAGE.jours[0]);
  if (!j) return;
  jourAffiche = j.date;
  const d = dateDe(j.date);
  const estAuj = d.getTime() === minuit(maintenant()).getTime();
  const s = j.seance || {};

  let h = '<div class="carte jr t-' + j.type + '">' +
    '<div class="jr-oeil"><span>' + (estAuj ? "Aujourd'hui" : j.jour + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()]) +
      '</span><i>' + j.j + '</i></div>' +
    '<div class="jr-titre">' + j.titre + '</div>';

  if (s.contenu) {
    h += '<div class="jr-seance">' +
      (s.heure ? '<b class="h">' + s.heure + '</b>' : '') +
      '<div class="jr-sc"><b>' + s.contenu + '</b>' +
      '<div class="jr-tags">' +
        (s.fcMax ? '<span class="pastille chaud">FC max ' + s.fcMax + '</span>' : '') +
        (s.distanceKm ? '<span class="pastille">' + s.distanceKm + ' km</span>' : '') +
        (s.dplus ? '<span class="pastille">+' + s.dplus + ' m</span>' : '') +
      '</div>' +
      (s.config ? '<p class="jr-config">' + s.config + '</p>' : '') +
      '</div></div>';
  }

  if (j.rdv) h += '<div class="jr-rdv"><b>' + j.rdv.heure + '</b><div>' + j.rdv.quoi +
    (j.rdv.ou ? '<small>' + j.rdv.ou + '</small>' : '') + '</div></div>';

  if (j.trajet) h += '<div class="jr-liste"><span>Trajet</span>' + j.trajet.map(t =>
    '<div class="jr-h"><b>' + t.h + '</b><p>' + t.quoi + '</p></div>').join('') + '</div>';

  if (j.matin) h += '<div class="jr-liste"><span>Le matin</span>' + j.matin.map(t =>
    '<div class="jr-h"><b>' + t.h + '</b><p>' + t.quoi + '</p></div>').join('') + '</div>';

  if (j.consignes) h += '<div class="jr-consignes">' + j.consignes.map(c => '<p>' + c + '</p>').join('') + '</div>';

  if (j.consignesRdv) h += '<div class="jr-liste"><span>À dire et à ne pas faire</span>' +
    j.consignesRdv.map(c => '<p class="jr-cr">' + c + '</p>').join('') + '</div>';

  if (j.aNoter) h += '<div class="jr-liste"><span>À noter pendant et après</span>' +
    j.aNoter.map(c => '<p class="jr-cr">&#9744; ' + c + '</p>').join('') + '</div>';

  if (j.branche) h += '<div class="jr-branche"><b>Si ' + j.branche.si + '</b><p>' + j.branche.alors + '</p>' +
    '<b class="non">Sinon</b><p>' + j.branche.sinon + '</p></div>';

  if (j.taches && j.taches.length) h += '<div class="jr-taches"><span>À faire</span>' +
    j.taches.map(t => '<button class="tk' + (tacheFaite(t.id) ? ' ok' : '') +
      (t.priorite === 'critique' ? ' crit' : '') + '" data-tk="' + t.id + '">' +
      '<i class="ck-box"></i><span>' + t.txt + '</span></button>').join('') + '</div>';

  if (j.note) h += '<div class="jr-note">' + j.note + '</div>';

  h += '</div>';

  document.getElementById('jourHote').innerHTML = h;
  document.querySelectorAll('#jourHote [data-tk]').forEach(b =>
    b.addEventListener('click', () => {
      prepa.taches[b.dataset.tk] = !tacheFaite(b.dataset.tk);
      sauvePrepa(); majJour(jourAffiche); traceTimelineH(); majEtat();
    }));
  traceTimelineH();
}

/* ---- 6. la seance cle, mise en avant tant qu'elle n'est pas passee ---- */

function traceCle() {
  const j = jourCle();
  const hote = document.getElementById('cleHote');
  if (!j || minuit(maintenant()) > dateDe(j.date)) { hote.innerHTML = ''; return; }
  const d = dateDe(j.date);
  const ecart = Math.round((d - minuit(maintenant())) / 86400000);
  hote.innerHTML = '<button class="cle-b" data-jour="' + j.date + '">' +
    '<span>Séance clé &#183; ' + (ecart === 0 ? "aujourd'hui" : 'dans ' + ecart + ' j') + '</span>' +
    '<b>' + j.titre + '</b><p>' + j.note + '</p></button>';
  hote.querySelector('[data-jour]').addEventListener('click', () => {
    majJour(j.date);
    document.getElementById('jourHote').scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
}

/* ---- 5. les trous ouverts ---- */

function traceInconnues() {
  const j0 = minuit(maintenant());
  document.getElementById('inconnuesHote').innerHTML = AFFUTAGE.inconnues.map(i => {
    const d = dateDe(i.resoudreLe);
    const ecart = Math.round((d - j0) / 86400000);
    // la reponse du 20/08 comble le champ quand Pierre n'a rien saisi lui-meme
    const val = prepa.inconnues[i.id] || i.reponse || '';
    return '<div class="inc' + (val ? ' ok' : '') + '">' +
      '<div class="inc-h"><b>' + i.label + '</b>' +
      '<span class="pastille ' + (val ? 'ok' : (ecart <= 0 ? 'chaud' : 'tiede')) + '">' +
        (val ? (i.resoluLe ? 'réglé le ' + dateDe(i.resoluLe).getDate() : 'réglé')
             : (ecart === 0 ? "aujourd'hui" : (ecart < 0 ? 'en retard' : 'dans ' + ecart + ' j'))) +
      '</span></div>' +
      '<small>Via ' + i.via + ' &#183; impacte ' + i.impacte.join(', ') + '</small>' +
      (val ? '<div class="inc-val"><b>' + val + '</b><button data-eff="' + i.id + '">modifier</button></div>'
           : '<div class="inc-saisie"><input type="text" data-inc="' + i.id + '" placeholder="La réponse, dès que tu l\'as"><button data-ok="' + i.id + '">Noter</button></div>') +
      '</div>';
  }).join('');

  const hote = document.getElementById('inconnuesHote');
  hote.querySelectorAll('[data-ok]').forEach(b => b.addEventListener('click', () => {
    const inp = hote.querySelector('[data-inc="' + b.dataset.ok + '"]');
    const v = (inp.value || '').trim();
    if (!v) { inp.focus(); return; }
    prepa.inconnues[b.dataset.ok] = v; sauvePrepa(); traceInconnues(); majEtat();
  }));
  const m = AFFUTAGE.rdvMedecin, dm = dateDe(m.date);
  hote.insertAdjacentHTML('beforeend',
    '<details class="rdv"><summary><b>Le RDV du 20 — fait, tout est fermé</b>' +
      '<span>' + dm.getDate() + ' ' + MOIS[dm.getMonth()] + ' au ' + m.moment + ' &#183; ' + m.medecin + '</span></summary>' +
    m.sujets.map(x => '<div class="rdv-s' + (x.nouveau ? ' neuf' : '') + '"><b>' + x.n + '</b>' +
      '<div><b>' + x.titre + (x.nouveau ? ' <i>nouveau</i>' : '') + '</b><p>' + x.detail + '</p></div></div>').join('') +
    '</details>');

  hote.querySelectorAll('[data-eff]').forEach(b => b.addEventListener('click', () => {
    delete prepa.inconnues[b.dataset.eff]; sauvePrepa(); traceInconnues(); majEtat();
  }));
}

function traceVerif() {
  document.getElementById('verifHote').innerHTML = AFFUTAGE.aVerifier.map(v =>
    '<button class="tk' + (prepa.verif[v.id] ? ' ok' : '') + '" data-vf="' + v.id + '">' +
    '<i class="ck-box"></i><span>' + v.txt + '</span></button>').join('');
  document.querySelectorAll('#verifHote [data-vf]').forEach(b =>
    b.addEventListener('click', () => {
      prepa.verif[b.dataset.vf] = !prepa.verif[b.dataset.vf];
      sauvePrepa(); traceVerif(); majEtat();
    }));
}

/* ---- le contrat nutrition ---- */

// Le contrat en deux colonnes plutot qu'en prose : ce qui entre, ce qui sort.
const OUI = ['Riz', 'Pommes de terre', 'Pain gris', 'Poulet, dinde', 'Œufs', 'Skyr',
             'Légumes', 'Fruits entiers'];
const NON = ['Industriel', 'Glaces, biscuits', 'Sodas', 'Friture'];

function traceContrat() {
  const c = AFFUTAGE.contratNutrition;
  const d1 = dateDe(c.du), d2 = dateDe(c.au), now = minuit(maintenant());
  const actif = now >= d1 && now <= d2;

  return document.getElementById('contratHote').innerHTML =
    '<div class="ct-etat ' + (actif ? 'on' : '') + '">' +
      (actif ? 'En vigueur' : (now < d1 ? 'À partir du ' + d1.getDate() + ' août' : 'Terminé, place à la recharge')) +
      ' &#183; ' + d1.getDate() + ' au ' + d2.getDate() + ' août</div>' +
    '<div class="ct-p">Maintenance propre, zéro excédent.<b>Pas de déficit.</b></div>' +

    '<div class="ct-cols">' +
      '<div class="oui"><span>Ça entre</span><ul>' + OUI.map(x => '<li>' + x + '</li>').join('') + '</ul></div>' +
      '<div class="non"><span>Ça n\'entre pas</span><ul>' + NON.map(x => '<li>' + x + '</li>').join('') + '</ul></div>' +
    '</div>' +

    '<div class="ct-tuiles">' +
      '<div><b>2 à 2,5 L</b><span>par jour, constant</span></div>' +
      '<div><b>À ta faim</b><span>aux repas, sans compter</span></div>' +
      '<div><b>Skyr le soir</b><span>le verrou anti-craquage</span></div>' +
    '</div>' +

    '<div class="ct-garde"><b>Si tu as faim entre les repas, tu manges.</b> ' +
      'Sur une semaine d\'affûtage, la faim signale qu\'on est passé sous la maintenance. ' +
      '« Propre » est l\'objectif, « moins » ne l\'est pas.</div>' +

    '<details class="nu-det"><summary>Les trois exceptions et la pesée</summary>' +
      c.exceptions.map(e => '<p class="ct-ex">' + e + '</p>').join('') +
      '<p class="ct-ex"><b>Balance</b> ' + c.mesure + '</p>' +
    '</details>';
}


/* ---- tous les points de passage ---- */

const RAVITO_LBL = {
  complet: { l: 'Ravito complet', c: 'teal' },
  base:    { l: 'Base vie', c: 'teal' },
  eau:     { l: 'Eau seulement', c: 'tiede' },
  controle:{ l: 'Point de contrôle', c: 'tiede' },
  arrivee: { l: 'Arrivée', c: 'ok' }
};

function traceRavitos() {
  const plan = scenarioActif();
  // on fusionne les 9 postes et les 6 reperes, tout ce qui compte entre deux ravitos
  const tout = SECTIONS.map((s, i) => ({
    km: s.cumKm, nom: s.nom, poste: true, s, i,
    alt: Math.round(altAt(s.cumKm) / 5) * 5
  })).concat(REPERES.map(r => ({ km: r.km, nom: r.nom, poste: false, r, alt: r.alt })))
    .sort((a, b) => a.km - b.km);

  return document.getElementById('ravitosHote').innerHTML = tout.map(x => {
    if (!x.poste) {
      return '<div class="rv rv-rep"><div class="rv-km">' + kmFmt(x.km) +
        '<small>reste ' + kmFmt(kmRestant(x.km)) + '</small></div>' +
        '<div class="rv-c"><b>' + x.nom + '</b>' +
        '<span class="rv-t">' + x.r.t + ' &#183; ' + x.alt + ' m</span>' +
        '<p>' + x.r.r + '</p></div></div>';
    }
    const s = x.s, a = plan.rows[x.i], rl = RAVITO_LBL[s.ravito] || RAVITO_LBL.complet;
    return '<div class="rv rv-poste' + (s.arret === 'grand' ? ' grand' : '') + '">' +
      '<div class="rv-km">' + kmFmt(x.km) +
        '<small>reste ' + kmFmt(kmRestant(x.km)) + '</small></div>' +
      '<div class="rv-c">' +
        '<div class="rv-h"><b>' + court(s.nom) + '</b><i>' + (a.horloge || a.max) + '</i></div>' +
        '<div class="rv-tags"><span class="pastille ' + rl.c + '">' + rl.l + '</span>' +
          (s.assist ? '<span class="pastille teal">Assistance équipe</span>' :
            (s.ravito === 'complet' || s.ravito === 'base' ? '<span class="pastille">Sans assistance</span>' : '')) +
          (s.arretMin ? '<span class="pastille">' + s.arretMin + ' min sur place</span>' : '') +
        '</div>' +
        '<p>' + s.consigne + '</p>' +
        (s.todo ? '<ul class="rv-todo">' + s.todo.map(t => '<li>' + t + '</li>').join('') + '</ul>' : '') +
      '</div></div>';
  }).join('');
}

document.querySelectorAll('.gros button').forEach(b => {
  b.addEventListener('click', () => montre(b.dataset.va));
});

/* ============================ demarrage ============================ */

function init() {
  appliqueTheme();
  migre(idsConnusCheck());
  document.documentElement.dataset.course = '0';
  majCompte();
  traceTimelineH();
  majJour();
  traceCle();
  traceInconnues();
  traceVerif();
  traceContrat();
  setInterval(() => { majCompte(); if (etat.vue === 'course') majCourse(); }, 1000);

  document.getElementById('profilHote').innerHTML = traceProfil();

  const tr = document.getElementById('pfTrace');
  const len = tr.getTotalLength();
  tr.style.setProperty('--len', len);

  brancheScrub();
  litProfil(0);

  document.querySelectorAll('.pf-pt-hit').forEach(c => {
    c.addEventListener('click', () => {
      const i = +c.dataset.i;
      placeCurseur(SECTIONS[i].cumKm);
      ouvreFiche(i);
    });
  });

  traceCrete();
  traceSwitch();
  majScenario();

  document.getElementById('nutriHote').innerHTML = traceNutrition();
  traceAlertes();
  traceBilan();
  traceSectionsNut();
  document.getElementById('feuille-course').innerHTML = traceFeuilleCourse();
  traceSac();
  traceVerifs();
  traceGants();
  traceChaussettes();
  traceVerdict();
  traceTrousse();
  traceVesteLampes();
  traceBalise();
  traceMenus();
  traceTraces();
  tracePhysio();
  traceSachets();
  traceChangements();
  traceCognitif();
  traceMontre();
  traceSang();
  traceRecharge();
  traceVigilance();
  tracePhysio24();
  traceCartes();
  traceProfilOfficiel();
  traceVoyage();
  traceCarb();
  fondEnLigne = !!store.get('carte', false);
  traceCarte();
  const cacheMeteo = litMeteoCache();
  meteoPrevue = (cacheMeteo && cacheMeteo.signature === SIGNATURE_POINTS) ? cacheMeteo : null;
  traceMeteoPrevue();
  chargeMeteo(false);
  traceStock();
  traceJournal();
  traceCoffre();
  majCourse(true);

  traceRavitos();
  majEtat();   // « Ou j'en suis » etait vide au chargement : il n'etait rempli qu'apres une coche

  // Le jour J, l'app s'ouvre sur Courir. Le reste du temps, sur Préparer.
  const now = maintenant();
  if (now >= DEPART && now <= FIN) changePartie('course');
  else {
    const memorisee = store.get('vue-' + etat.partie, null);
    const valide = PARTIES[etat.partie].some(x => x[0] === memorisee);
    montre(valide ? memorisee : vueParDefaut(etat.partie));
  }

  // sous-titre de l'onglet Preparer : le nombre de jours restants
  const jours = Math.max(0, Math.ceil((DEPART - now) / 86400000));
  document.getElementById('sousPrepa').textContent = jours > 0 ? 'J-' + jours : 'jour J';
}

init();

/* ==================== mises a jour ====================
   Le service worker sert le cache d'abord : sans rien de plus, une nouvelle
   version n'apparait qu'au deuxieme lancement, et Pierre voit l'ancienne app
   sans savoir pourquoi. On lui dit, et on lui donne le bouton. */

function bandeauMaj(sw) {
  if (document.getElementById('majBandeau')) return;
  const b = document.createElement('div');
  b.id = 'majBandeau';
  b.className = 'maj';
  b.innerHTML = '<div><b>Nouvelle version prête</b>' +
    '<small>Le carnet a été mis à jour. Recharge pour la voir.</small></div>' +
    '<button id="majGo">Recharger</button>';
  document.body.appendChild(b);
  requestAnimationFrame(() => b.classList.add('on'));
  document.getElementById('majGo').addEventListener('click', () => {
    if (sw) sw.postMessage({ action: 'prendreLaMain' });
    location.reload();
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      // une version deja en attente : on previent tout de suite
      if (reg.waiting && navigator.serviceWorker.controller) bandeauMaj(reg.waiting);

      reg.addEventListener('updatefound', () => {
        const neuf = reg.installing;
        if (!neuf) return;
        neuf.addEventListener('statechange', () => {
          if (neuf.state === 'installed' && navigator.serviceWorker.controller) bandeauMaj(neuf);
        });
      });

      // on cherche une mise a jour a chaque ouverture et au retour d'arriere-plan
      reg.update().catch(() => {});
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) reg.update().catch(() => {});
      });
    }).catch(() => { /* file:// ou refus */ });
  });
}

// Poignee de mise au point, utilisable depuis la console.
window.CCC = {
  /* Poignee de mise au point du coffre : elle ne dechiffre rien, elle permet
     seulement de dessiner l'ecran ouvert avec un contenu quelconque pour le
     verifier en preview. Aucune donnee n'est lue ni ecrite sur le disque. */
  coffreEssai(objet) {
    coffre = objet || null;
    traceCoffre();
    return coffre ? 'coffre peint' : 'coffre referme';
  },
  /* Charge les pieces jointes sans passer par prive-data.js : sert a verifier
     le rendu en preview quand seul prive-docs.js est en place. */
  async docsEssai(phrase, sel, tours) {
    const b = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));
    const base = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(phrase), 'PBKDF2', false, ['deriveKey']);
    const k = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b(sel), iterations: tours || 1000000, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    docsCharges = false;
    await chargeDocs(k);
    return docs ? Object.keys(docs) : 'aucune piece';
  },
  async coffreDepuis(bloc, phrase) {
    const b = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));
    const base = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(phrase), 'PBKDF2', false, ['deriveKey']);
    const k = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b(bloc.kdf.sel), iterations: bloc.kdf.tours, hash: bloc.kdf.hash },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const brut = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b(bloc.chiffre.iv) }, k, b(bloc.chiffre.donnees));
    return JSON.parse(new TextDecoder().decode(brut));
  },
  simuler(quand) {
    const r = simuler(quand);
    dernierCompte = '';
    majCompte(); traceTimelineH(); majJour(); traceCle(); traceInconnues(); traceContrat(); majEtat();
    if (!store.get('theme', null)) appliqueTheme();
    return r;
  },
  maintenant
};
