// CCC 4330 &#183; carnet de course v2
// Socle : preferences, theme jour/nuit, navigation, profil interactif.

import { RACE, SECTIONS, SCENARIOS, REGLES, CHECKLIST, EN_ATTENTE, NUTRITION } from './data.js';
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

function montre(nom) {
  etat.vue = nom;
  document.querySelectorAll('.vue').forEach(v => v.classList.toggle('actif', v.id === 'v-' + nom));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('actif', t.dataset.vue === nom));
  window.scrollTo(0, 0);
}

document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => montre(t.dataset.vue));
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

function traceMarge() {
  const plan = scenarioActif();
  const marges = SECTIONS.map((s, i) => versMin(margeDe(plan, i)));
  const max = Math.max(...marges);
  const h = 46;
  const bars = SECTIONS.map((s, i) => {
    const x = px(s.cumKm), v = marges[i] / max;
    const bh = Math.max(3, v * h);
    return '<rect x="' + (x - 8).toFixed(1) + '" y="' + (h - bh).toFixed(1) + '" width="16" height="' + bh.toFixed(1) +
           '" rx="2.5" fill="url(#gradMarge)" opacity="' + (0.45 + v * 0.55).toFixed(2) + '"/>';
  }).join('');
  return '<svg viewBox="0 0 ' + VB_W + ' ' + (h + 2) + '" style="display:block;width:100%;height:auto" role="img" aria-label="Marge sur les barrieres horaires">' +
    '<defs><linearGradient id="gradMarge" x1="0" y1="1" x2="0" y2="0">' +
      '<stop offset="0%" stop-color="var(--alerte)"/><stop offset="55%" stop-color="var(--jour)"/><stop offset="100%" stop-color="var(--ok)"/>' +
    '</linearGradient></defs>' + bars + '</svg>';
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

document.getElementById('btnRegles').addEventListener('click', () => {
  ouvreFeuille('Les 5 règles', htmlRegles());
});

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
  document.getElementById('margeLegende').innerHTML =
    '<span>' + court(SECTIONS[0].nom) + ' ' + margeDe(s, 0) + '</span>' +
    '<span>' + court(SECTIONS[SECTIONS.length - 1].nom) + ' ' + margeDe(s, SECTIONS.length - 1) + '</span>';

  litProfil(kmCourant);
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

/* ============================ nutrition ============================ */

function traceNutrition() {
  return '<div class="nu-cible"><b>' + NUTRITION.cible + '</b><span>' + NUTRITION.regle + '</span></div>' +
    '<div class="nu-bloc"><span>Boisson</span><p>' + NUTRITION.boisson + '</p></div>' +
    '<div class="nu-bloc"><span>Caféine</span><ul class="nu-caf">' +
      NUTRITION.cafeine.map(c =>
        '<li><b>' + c.quoi + '</b><i>' + c.ou + '</i></li>').join('') +
    '</ul></div>' +
    '<div class="nu-bloc"><span>Portage</span><p><b>Au départ</b> ' + NUTRITION.portage.depart +
      '<br><b>À Champex</b> ' + NUTRITION.portage.champex + '</p></div>';
}

/* ============================ checklists ============================ */

const TOTAL_ITEMS = CHECKLIST.reduce((n, g) => n + g.items.length, 0);

// { id: true } des items coches
let coches = store.get('check', {}) || {};
let filtreReste = store.get('ckReste', false);

const estCoche = id => coches[id] === true;
const faits = g => g.items.filter(i => estCoche(i.id)).length;

function anneau(pct) {
  // a zero, le bout arrondi laisserait un point parasite : on n'affiche rien
  const arc = pct > 0
    ? '<circle class="fg" cx="18" cy="18" r="15.5" pathLength="100" stroke-dasharray="' +
      pct.toFixed(1) + ' 100"/>'
    : '';
  return '<svg class="ck-ring" viewBox="0 0 36 36" aria-hidden="true">' +
    '<circle class="bg" cx="18" cy="18" r="15.5" pathLength="100"/>' + arc + '</svg>';
}

function traceChecklist() {
  return CHECKLIST.map(g => {
    const n = faits(g), tot = g.items.length;
    const pct = tot ? (n / tot) * 100 : 0;
    const fini = n === tot;

    const visibles = filtreReste ? g.items.filter(i => !estCoche(i.id)) : g.items;
    const liste = visibles.length
      ? visibles.map(i =>
          '<button class="ck-item' + (estCoche(i.id) ? ' ok' : '') + '" data-ck="' + i.id + '">' +
          '<i class="ck-box"></i><span class="ck-txt">' + i.l +
          (i.s ? '<small>' + i.s + '</small>' : '') + '</span></button>').join('')
      : '<div class="ck-vide">Ce groupe est bouclé.</div>';

    return '<div class="ck-grp' + (fini ? ' fini' : '') + '">' +
      '<div class="ck-grp-tete">' + anneau(pct) +
        '<div class="ck-grp-nom">' + g.t + (g.s ? '<small>' + g.s + '</small>' : '') + '</div>' +
        '<div class="ck-grp-cpt">' + n + '/' + tot + '</div>' +
      '</div><div class="ck-liste">' + liste + '</div></div>';
  }).join('');
}

function traceAttente() {
  return EN_ATTENTE.map(a =>
    '<div class="att"><i class="att-p"></i><div class="att-c">' + a.l +
    (a.s ? '<small>' + a.s + '</small>' : '') + '</div>' +
    '<span class="att-q">' + a.quand + '</span></div>').join('');
}

function majChecklist() {
  const n = CHECKLIST.reduce((s, g) => s + faits(g), 0);
  const pct = TOTAL_ITEMS ? Math.round((n / TOTAL_ITEMS) * 100) : 0;

  document.getElementById('ckPct').textContent = pct;
  document.getElementById('ckJauge').style.width = pct + '%';
  document.getElementById('ckCompte').textContent = n + ' / ' + TOTAL_ITEMS + ' items';
  document.getElementById('ckResume').innerHTML =
    n === TOTAL_ITEMS ? 'tout est coché' : 'prêt à ' + pct + ' % &#183; ' + (TOTAL_ITEMS - n) + ' restants';

  document.getElementById('ckGroupes').innerHTML = traceChecklist();
  document.querySelectorAll('#ckGroupes button[data-ck]').forEach(b => {
    b.addEventListener('click', () => basculeItem(b.dataset.ck));
  });

  const f = document.getElementById('ckFiltre');
  f.classList.toggle('on', filtreReste);
}

function basculeItem(id) {
  coches[id] = !estCoche(id);
  store.set('check', coches);
  majChecklist();
}

document.getElementById('ckFiltre').addEventListener('click', () => {
  filtreReste = !filtreReste;
  store.set('ckReste', filtreReste);
  majChecklist();
});

/* ============================ accueil ============================ */

const bloc = (val, unite) => '<div class="cd-bloc"><b>' + val + '</b><i>' + unite + '</i></div>';
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
    corps = bloc(j, 'j') + sep + bloc(String(h).padStart(2, '0'), 'h') + sep +
            bloc(String(m).padStart(2, '0'), 'min');
    dessous = DEPART.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) +
              ' &#183; <b>' + hhmm(DEPART) + '</b> &#183; Courmayeur';
    carte.classList.remove('encours');
  } else {
    const ecoule = now - DEPART;
    const h = Math.floor(ecoule / 3600000);
    const m = Math.floor(ecoule / 60000) % 60;
    etiq = now > FIN ? 'Course terminée' : 'En course depuis';
    corps = bloc(h, 'h') + sep + bloc(String(m).padStart(2, '0'), 'min');
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

function majRegleDuJour() {
  const now = maintenant();
  const jour = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const r = REGLES[jour % REGLES.length];
  document.getElementById('regleDuJour').innerHTML =
    '<div class="regle"><b>' + r.n + '</b><p>' + r.t + '</p></div>';
}

document.querySelectorAll('.gros button').forEach(b => {
  b.addEventListener('click', () => montre(b.dataset.va));
});

/* ============================ demarrage ============================ */

function init() {
  appliqueTheme();
  majCompte();
  majRegleDuJour();
  setInterval(majCompte, 1000);

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
  document.getElementById('ckAttente').innerHTML = traceAttente();
  majChecklist();
}

init();

// Service worker : tout le carnet doit repondre en mode avion.
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
    majCompte(); majRegleDuJour();
    if (!store.get('theme', null)) appliqueTheme();
    return r;
  },
  maintenant
};
