// CCC 4330 &#183; carnet de course v2
// Socle : preferences, theme jour/nuit, navigation, profil interactif.

import { RACE, SECTIONS, SCENARIOS, REGLES, CHECKLIST, EN_ATTENTE, NUTRITION,
         PANIC, ALERTES, ECHEANCES, NAAK } from './data.js';
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
  // pilote le mode 3h du matin : typo XXL et fond noir sur l'onglet course
  document.documentElement.dataset.course = nom === 'course' ? '1' : '0';
  document.querySelectorAll('.vue').forEach(v => v.classList.toggle('actif', v.id === 'v-' + nom));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('actif', t.dataset.vue === nom));
  window.scrollTo(0, 0);
  if (nom === 'course') majCourse(true);
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
    '<p><b>' + NUTRITION.cible + '</b><br>' + NUTRITION.regle + '</p>' +
    '<p>' + NUTRITION.cafeine.map(c => '<b>' + c.quoi + '</b> ' + c.ou).join(' &#183; ') + '</p>' +
    '<p><b>Départ</b> ' + NUTRITION.portage.depart + '<br><b>Champex</b> ' + NUTRITION.portage.champex + '</p>' +
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
  return '<div class="nu-cible"><b>' + NUTRITION.cible + '</b><span>' + NUTRITION.regle + '</span></div>' +
    '<div class="nu-bloc"><span>Boisson</span><p>' + NUTRITION.boisson + '</p></div>' +
    '<div class="nu-bloc"><span>Caféine</span><ul class="nu-caf">' +
      NUTRITION.cafeine.map(c =>
        '<li><b>' + c.quoi + '</b><i>' + c.ou + '</i></li>').join('') +
    '</ul></div>' +
    '<div class="nu-bloc"><span>Portage</span><p><b>Au départ</b> ' + NUTRITION.portage.depart +
      '<br><b>À Champex</b> ' + NUTRITION.portage.champex + '</p></div>' +
    '<div class="nu-bloc"><span>Ce que vaut un Näak</span><table class="nu-tab">' +
      '<tr><th></th><th>gluc</th><th>kcal</th></tr>' +
      NAAK.map(p => '<tr><td><b>' + p.n + '</b><small>' + p.u + ' &#183; ' + p.note + '</small></td>' +
        '<td>' + p.g + ' g</td><td>' + p.kcal + '</td></tr>').join('') +
    '</table></div>';
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

  if (document.getElementById('etatHote')) majEtat();
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

/* ---- ou j'en suis ---- */

function majEtat() {
  const now = maintenant();
  const n = CHECKLIST.reduce((s, g) => s + faits(g), 0);
  const pct = TOTAL_ITEMS ? Math.round((n / TOTAL_ITEMS) * 100) : 0;
  const jours = Math.max(0, Math.ceil((DEPART - now) / 86400000));

  // les groupes ou il reste le plus a faire
  const restants = CHECKLIST
    .map(g => ({ t: g.t, r: g.items.length - faits(g) }))
    .filter(g => g.r > 0)
    .sort((a, b) => b.r - a.r);

  const cls = pct >= 90 ? 'ok' : (pct >= 50 ? 'tiede' : '');
  let h = '<div class="et">' +
    '<div><span>jours</span><b>' + jours + '</b></div>' +
    '<div><span>matériel</span><b class="' + cls + '">' + pct + '<i>%</i></b></div>' +
    '<div><span>en attente</span><b class="' + (EN_ATTENTE.length ? 'tiede' : 'ok') + '">' +
      EN_ATTENTE.length + '</b></div></div>' +
    '<div class="et-piste"><i style="width:' + pct + '%"></i></div>';

  h += '<div class="et-reste">';
  if (!restants.length) h += 'Tout est coché. Il ne reste qu\'à partir.';
  else h += '<b>' + (TOTAL_ITEMS - n) + ' items</b> à cocher, surtout dans ' +
    restants.slice(0, 2).map(g => g.t.toLowerCase() + ' (' + g.r + ')').join(' et ') + '.';
  if (EN_ATTENTE.length) h += '<br>Non tranché : ' + EN_ATTENTE.map(a => a.l).join(' &#183; ') + '.';
  h += '</div>';

  document.getElementById('etatHote').innerHTML = h;
}

const MOIS = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

function majEcheances() {
  const now = maintenant();
  const jour0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let suivanteVue = false;

  document.getElementById('echeancesHote').innerHTML = ECHEANCES.map(e => {
    const d = new Date(e.d + 'T00:00:00');
    const j = Math.round((d - jour0) / 86400000);
    const passe = j < 0;
    const suivante = !passe && !suivanteVue;
    if (suivante) suivanteVue = true;
    const quand = passe ? 'passé' : (j === 0 ? "aujourd'hui" : (j === 1 ? 'demain' : 'dans ' + j + ' j'));
    return '<div class="ech' + (passe ? ' passe' : '') + (suivante ? ' suivante' : '') + '">' +
      '<div class="j"><b>' + d.getDate() + '</b><i>' + MOIS[d.getMonth()] + '</i></div>' +
      '<div class="c"><b>' + e.t + '</b><small>' + e.s + '</small></div>' +
      '<div class="d">' + quand + '</div></div>';
  }).join('');
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
  document.documentElement.dataset.course = '0';
  majCompte();
  majRegleDuJour();
  majEcheances();
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
  document.getElementById('feuille-course').innerHTML = traceFeuilleCourse();
  document.getElementById('ckAttente').innerHTML = traceAttente();
  majChecklist();
  majCourse(true);

  // Le jour J, l'app s'ouvre sur le mode course. Le reste de l'annee, sur l'accueil.
  const now = maintenant();
  montre(now >= DEPART && now <= FIN ? 'course' : 'accueil');
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
