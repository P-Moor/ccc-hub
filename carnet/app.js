// CCC 4330 &#183; carnet de course v2
// Socle : preferences, theme jour/nuit, navigation, profil interactif.

import { RACE, SECTIONS, SCENARIOS, REGLES,
         PANIC, ALERTES, NAAK, NAAK_SOURCE, REPERES } from './data.js';
import { AFFUTAGE } from './prepa-data.js';
import { NUTRITION as NUT } from './nutrition-data.js';
import { SAC } from './sac-data.js';
import { VOYAGE } from './voyage-data.js';
import { PROFIL, altAt } from './profil.js';

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

const SCHEMA = 1;
const CLE_JOURNAL = 'ccc-journal-v1';

const CLES_ETAT = [
  'check', 'prepa', 'course', 'kits', 'scenario', 'theme',
  'sacMode', 'sacRouge', 'sacReste', 'voyMode',
  'partie', 'vue-prepa', 'vue-course', 'simu', 'schema', 'orphelins'
];

// Archive les identifiants qui n'existent plus dans les donnees, au lieu de
// les jeter. Si un fichier de donnees part en vrille, l'etat est recuperable.
function archiveOrphelins(idsConnus) {
  const etat = store.get('check', {}) || {};
  const orph = store.get('orphelins', {}) || {};
  let n = 0;
  Object.keys(etat).forEach(id => {
    if (!idsConnus.has(id)) { orph[id] = etat[id]; delete etat[id]; n++; }
  });
  if (n) { store.set('check', etat); store.set('orphelins', orph); }
  return n;
}

function migre(idsConnus) {
  const v = store.get('schema', 0);
  const n = archiveOrphelins(idsConnus);
  if (v !== SCHEMA) store.set('schema', SCHEMA);
  return { de: v, vers: SCHEMA, archives: n };
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
  if (meta) meta.setAttribute('content', t === 'nuit' ? '#05070C' : '#1E2430');
}

document.getElementById('btnTheme').addEventListener('click', () => {
  const actuel = document.documentElement.dataset.theme;
  store.set('theme', actuel === 'nuit' ? 'jour' : 'nuit');
  appliqueTheme();
});

/* ============================ navigation ============================ */

// L'app a deux moities : preparer jusqu'au 28, et courir le 28.
const PARTIES = {
  prepa: [
    ['aujourdhui', "Aujourd'hui", '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M3 11h18"/><path d="M9 16l1.8 1.8L14.5 14"/>'],
    ['sac', 'Le sac', '<path d="M8 8V6.5a4 4 0 0 1 8 0V8"/><rect x="4" y="8" width="16" height="13" rx="3"/><path d="M9 13h6"/>'],
    ['listes', 'Vérifs', '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/><path d="M8 10.5l1.8 1.8L13.5 8.5"/>'],
    ['nutrition', 'Nutrition', '<path d="M10 3v6l-4.6 9.2A2 2 0 0 0 7.2 21h9.6a2 2 0 0 0 1.8-2.8L14 9V3"/><path d="M9 3h6"/>'],
    ['voyage', 'Voyage', '<path d="M4 17V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10"/><path d="M4 13h16"/><circle cx="8" cy="17" r="1.6"/><circle cx="16" cy="17" r="1.6"/><path d="M9 4V2h6v2"/>']
  ],
  course: [
    ['profil', 'Tracé', '<path d="M2 18l6-9 4 5 3-4 7 8z"/>'],
    ['deroule', 'Pacing', '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><path d="M6 8v8"/><path d="M11 6h9"/><path d="M11 18h9"/>'],
    ['ravitos', 'Ravitos', '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/>'],
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

  const axe = [0, 25, 50, 75, 101.5].map(k =>
    '<text class="pf-axe-txt" x="' + px(k).toFixed(1) + '" y="' + (VB_H - 4) +
    '" text-anchor="' + (k === 0 ? 'start' : (k > 100 ? 'end' : 'middle')) + '">' +
    (k === 101.5 ? '101,5 km' : k) + '</text>').join('');

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
  NUT.listeAchat.trakks.concat(NUT.listeAchat.maison).forEach(i => e.add(i.id));
  VOYAGE.aller.surMoiDansLeTrain.forEach(i => e.add(i.id));
  VOYAGE.documentsHorsLigne.forEach(i => e.add(i.id));
  VOYAGE.retour.aFaire.forEach(i => e.add(i.id));
  return e;
}

function ouvreDonnees() {
  const c = compteEtat();
  const json = exporteEtat();
  const nom = 'carnet-ccc-' + new Date().toISOString().slice(0, 10) + '.json';
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
    '<div class="dn-msg" id="dnMsg"></div>');

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
const SCEN_COURT = { A: 'cible 20h15', B: 'pied ~23h', C: 'survie' };

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
      (s.arretMin ? ' &#183; ' + s.arretMin + ' min sur place' : '') + '</small></div>' +
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
        '<div><span>marge</span><b class="ok">' + dureeTxt(b[8] - fin) + '</b></div>' +
      '</div><div class="co-consigne"><span>Fini</span>C\'est fait. 101,5 km et 6 062 m de D+.</div></div>';
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
    '<p>' + NUT.cafeine.filter(c => c.n !== 'R').map(c => '<b>Café ' + c.n + '</b> ' + c.ou + ' ' + c.quand).join(' &#183; ') + '</p>' +
    '<p><b>Départ</b> ' + NUT.portage.sacDepart.contenu.join(' &#183; ') + '<br><b>Champex</b> ' + NUT.portage.sacChampex.contenu.slice(0,3).join(' &#183; ') + '</p>' +
    '<p class="fc-menu">' + NAAK.map(p => p.n.replace('Ultra Energy ', '').replace('Energy ', '') +
      ' ' + p.g + ' g').join(' &#183; ') + '</p></div>';

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
      (s.arret === 'grand' ? 4 : 2.8) + '" fill="#fff" stroke="#1E2430" stroke-width="1.6"/>' +
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
        '101,5 km &#183; 6 062 m D+ &#183; barrière finale <b>' + hhmm(FIN) + '</b> &#183; cible 20h15</div>' +
    '</div>' + tableau +
    '<div class="fc-verso">' + profil +
      '<div class="fc-colonnes">' + regles + nutri + '</div>' + panic + '</div>';
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
    [NUT.portage.sacDepart, NUT.portage.sacChampex].map(s =>
      '<div class="nu-ch"><b>' + s.label + '</b><ul class="nu-ul">' +
      s.contenu.map(c => '<li>' + c + '</li>').join('') + '</ul></div>').join('') +
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
      ? '<b>' + Math.abs(ecart) + ' g de moins</b> que la cible sur les 20h15, soit environ ' +
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

/* 5. la liste d'achat, cochable */
const listeAchatTout = () => NUT.listeAchat.trakks.concat(NUT.listeAchat.maison);
const achatFait = id => coches[id] === true;

function traceAchat() {
  const tout = listeAchatTout();
  const n = tout.filter(i => achatFait(i.id)).length;
  const pct = tout.length ? Math.round((n / tout.length) * 100) : 0;

  const groupe = (t, s, items) => {
    const f = items.filter(i => achatFait(i.id)).length;
    return '<div class="ck-grp' + (f === items.length ? ' fini' : '') + '">' +
      '<div class="ck-grp-tete">' + anneau(items.length ? (f / items.length) * 100 : 0) +
        '<div class="ck-grp-nom">' + t + '<small>' + s + '</small></div>' +
        '<div class="ck-grp-cpt">' + f + '/' + items.length + '</div></div>' +
      '<div class="ck-liste">' + items.map(i =>
        '<button class="ck-item' + (achatFait(i.id) ? ' ok' : '') + '" data-ck="' + i.id + '">' +
        '<i class="ck-box"></i><span class="ck-txt">' + i.txt +
        (i.detail ? '<small>' + i.detail + '</small>' : '') + '</span></button>').join('') +
      '</div></div>';
  };

  document.getElementById('achatHote').innerHTML =
    '<div class="carte ck-tete"><div class="ck-pct"><b>' + pct + '</b><i>%</i><span>acheté</span></div>' +
      '<div class="ck-piste"><i style="width:' + pct + '%"></i></div>' +
      '<div class="ck-compte">' + n + ' / ' + tout.length + ' lignes &#183; ' + NUT.listeAchat.budget + '</div></div>' +
    '<div class="ach-regle">' + NUT.listeAchat.regle + '</div>' +
    groupe('Chez TraKKs', 'Rocourt, lundi 17', NUT.listeAchat.trakks) +
    groupe('Déjà en stock, à préparer', 'À la maison', NUT.listeAchat.maison) +
    '<details class="carte nu-det"><summary>Ce que le document officiel corrige</summary>' +
      NUT.corrections.map(c => '<div class="cor"><b>' + c.apres + '</b>' +
        '<p>' + c.consequence + '</p>' +
        (c.aVerifier ? '<small>' + c.aVerifier + '</small>' : '') + '</div>').join('') +
      '<p class="nu-src">' + NUT.meta.sourceRavitos + '</p>' +
    '</details>';

  document.querySelectorAll('#achatHote [data-ck]').forEach(b =>
    b.addEventListener('click', () => {
      coches[b.dataset.ck] = !achatFait(b.dataset.ck);
      store.set('check', coches);
      traceAchat();
    }));
}

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
    h = '<div class="al al-crit"><div class="al-i">📅</div><div><b>Trois dates qui ne collent pas</b>' +
      '<p>' + VOYAGE.retour.alerte + '</p></div></div>' +
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

  document.getElementById('attHote').innerHTML = SAC.enAttente.map(a => {
    const d = dateDe(a.resoudreLe);
    const ec = Math.round((d - minuit(maintenant())) / 86400000);
    return '<div class="att"><i class="att-p"></i><div class="att-c">' + a.txt +
      '<small>Via ' + a.via + '</small></div>' +
      '<span class="att-q">' + (ec <= 0 ? 'à faire' : 'dans ' + ec + ' j') + '</span></div>';
  }).join('');
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
  const trous = AFFUTAGE.inconnues.filter(i => !prepa.inconnues[i.id]).length;
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
    const val = prepa.inconnues[i.id];
    return '<div class="inc' + (val ? ' ok' : '') + '">' +
      '<div class="inc-h"><b>' + i.label + '</b>' +
      '<span class="pastille ' + (val ? 'ok' : (ecart <= 0 ? 'chaud' : 'tiede')) + '">' +
        (val ? 'réglé' : (ecart === 0 ? "aujourd'hui" : (ecart < 0 ? 'en retard' : 'dans ' + ecart + ' j'))) +
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
      return '<div class="rv rv-rep"><div class="rv-km">' + kmFmt(x.km) + '</div>' +
        '<div class="rv-c"><b>' + x.nom + '</b>' +
        '<span class="rv-t">' + x.r.t + ' &#183; ' + x.alt + ' m</span>' +
        '<p>' + x.r.r + '</p></div></div>';
    }
    const s = x.s, a = plan.rows[x.i], rl = RAVITO_LBL[s.ravito] || RAVITO_LBL.complet;
    return '<div class="rv rv-poste' + (s.arret === 'grand' ? ' grand' : '') + '">' +
      '<div class="rv-km">' + kmFmt(x.km) + '</div>' +
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

  traceSwitch();
  majScenario();

  document.getElementById('nutriHote').innerHTML = traceNutrition();
  traceAlertes();
  traceBilan();
  traceSectionsNut();
  traceAchat();
  document.getElementById('feuille-course').innerHTML = traceFeuilleCourse();
  traceSac();
  traceVerifs();
  traceVoyage();
  majCourse(true);

  traceRavitos();

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

// Service worker : tout le carnet doit repondre hors ligne.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* file:// ou refus */ });
  });
}

// Poignee de mise au point, utilisable depuis la console.
window.CCC = {
  simuler(quand) {
    const r = simuler(quand);
    dernierCompte = '';
    majCompte(); traceTimelineH(); majJour(); traceCle(); traceInconnues(); traceContrat(); majEtat();
    if (!store.get('theme', null)) appliqueTheme();
    return r;
  },
  maintenant
};
