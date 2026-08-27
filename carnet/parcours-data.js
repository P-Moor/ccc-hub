/**
 * parcours-data.js — les 15 points officiels de la CCC 2026
 * ---------------------------------------------------------------------------
 * ⚠️ PARCOURS MODIFIE LE 27/08. SMS UTMB de 16h05 : « parcours modifie sur 2
 * secteurs suisses ». Deux zones divergent de l'ancienne trace :
 *   km 44,6 → 45,7   variante mineure apres La Fouly
 *   km 59,5 → 75,3   BOVINE SUPPRIME. Descente sur Martigny (507 m, le point
 *                    bas de la course) puis remontee complete sur Trient.
 *
 *   100,9 km → 108,8 km       6 050 m → 6 400 m D+       ~20h15 → ~22h25
 *
 * ⛔ PIEGE DU FICHIER GPX : ses metadonnees internes annoncent encore
 * distance=100000 et elevationgain=6100. L'organisation ne les a PAS mises a
 * jour. Seuls la trace et les waypoints font foi.
 *
 * `dplus` et `dminus` sont CALCULES sur la nouvelle trace officielle, segment
 * par segment, bruit altimetrique filtre a 2,5 m — le seuil qui fait retomber
 * le total sur les 6 400 m annonces. Controle de coherence : les segments non
 * touches par la modification redonnent EXACTEMENT les valeurs d'avant
 * (Tronche 1418, Ferret 761, Tseppes 647, Flegere 966). Seul le secteur
 * modifie bouge, ce qui est la preuve que la regeneration est saine.
 *
 * ⚠️ L'UTMB pointe la SORTIE des ravitos de Champex et de Vallorcine, pas
 * l'entree. Le temps d'arret y est donc DEJA compris dans le chrono.
 *
 * ⛔ CE QUE LE DOCUMENT DU 27/08 DIT DE TRAVERS, ET QUI COMPTE :
 * il annonce que la modification « elargit toutes les marges sauf Bertone ».
 * C'est faux sur le dernier tiers. L'organisation n'a deplace QU'UNE barriere,
 * celle de Trient (04:00 → 06:00), et ajoute Martigny. Vallorcine, La Flegere
 * et Chamonix gardent leur horaire A LA MINUTE PRES. Comme Pierre y arrive
 * 2h10 plus tard, sa marge y RETRECIT de 2h10 :
 *      Vallorcine   5h35 → 3h25
 *      La Flegere   6h10 → 4h00
 *      Chamonix     6h30 → 4h20
 * Cela reste confortable, mais le sens de la variation est l'inverse de ce
 * qu'il a lu. `margeAvant` porte l'ancienne valeur pour que l'app puisse le
 * montrer plutot que de le laisser croire.
 *
 * Regenerer la partie geometrique : scratchpad/gen_maj27.py
 */

export const PARCOURS = {
  source: "GPX officiel UTMB modifié · CCC_2026_MODIFIE.gpx · 27/08/2026",
  version: "2026-08-27-parcours-modifie",
  distanceOfficielle: 108.8,
  dplusOfficiel: 6400,
  dmoinsOfficiel: 6585,
  ancienneDistance: 100.9,
  tempsEstime: "~22h25",
  pointeLaSortie: "⚠️ L'UTMB pointe la SORTIE de Champex et de Vallorcine, pas l'entrée. Le temps d'arrêt est déjà compris dans le chrono.",
  modification: "27/08 · Bovine supprimé, remplacé par Martigny (507 m) : +7,9 km et +350 m D+ sur le terrain le plus roulant du parcours.",

  points: [
    { nom: "Courmayeur", km: 0.0, alt: 1221, type: "depart",
      lat: 45.79284, lon: 6.97157, segKm: 0.0, dplus: 0, dminus: 0,
      dpc: 0, cible: "09:15" },

    { nom: "Tête de la Tronche", km: 9.4, alt: 2543, type: "sommet",
      lat: 45.82285, lon: 7.01944, segKm: 9.4, dplus: 1418, dminus: 95,
      dpc: 1418, cible: "11:45",
      note: "Sommet de la montée 1 · +1 418 m sur 9,4 km · VAM 450-480" },

    { nom: "Refuge Bertone", km: 13.6, alt: 1982, type: "ravito",
      lat: 45.80922, lon: 6.97865, segKm: 4.2, dplus: 18, dminus: 581,
      dpc: 1436, cible: "12:37", barriere: "13:45", marge: "1h08",
      margeAvant: "1h08", mode: "express",
      note: "🔴 LE POINT LE PLUS SERRÉ DE LA COURSE, avant comme après la modification." },

    { nom: "Refuge Bonatti", km: 21.2, alt: 2027, type: "sommet",
      lat: 45.84678, lon: 7.03331, segKm: 7.5, dplus: 321, dminus: 277,
      dpc: 1757, cible: "13:45",
      note: "Balcon roulant — manger en marchant" },

    { nom: "Arnouvaz", km: 26.3, alt: 1777, type: "ravito",
      lat: 45.87133, lon: 7.05394, segKm: 5.2, dplus: 148, dminus: 396,
      dpc: 1905, cible: "14:28", barriere: "16:30", marge: "2h02",
      margeAvant: "2h02", mode: "moyen" },

    { nom: "Grand Col Ferret", km: 30.9, alt: 2527, type: "sommet",
      lat: 45.88899, lon: 7.07790, segKm: 4.5, dplus: 761, dminus: 9, expose: true,
      dpc: 2666, cible: "15:55",
      note: "Toit de la course · +761 m sur 4,5 km · vent · veste à portée" },

    { nom: "La Fouly", km: 40.7, alt: 1604, type: "ravito",
      lat: 45.93566, lon: 7.09845, segKm: 9.9, dplus: 104, dminus: 1028,
      dpc: 2770, cible: "17:06", barriere: "20:15", marge: "3h09",
      margeAvant: "3h09", mode: "moyen" },

    { nom: "Champex-Lac", km: 54.2, alt: 1472, type: "basedevie",
      lat: 46.02559, lon: 7.12246, segKm: 13.5, dplus: 516, dminus: 648,
      dpc: 3286, cible: "19:24", barriere: "23:15", marge: "3h51",
      margeAvant: "3h50", mode: "grand", sortie: true,
      note: "Dernier point avant 15 km sans ravito, de nuit. Bascules : haut sec, gants secs, frontale sur la tête." },

    { nom: "Plan de l'Au", km: 59.1, alt: 1340, type: "pointage",
      lat: 46.04983, lon: 7.07972, segKm: 4.9, dplus: 74, dminus: 208,
      dpc: 3360, cible: "20:24", barriere: "00:15", marge: "3h51",
      margeAvant: "3h50",
      alerte: "⚠️ POINTAGE SEUL — PAS DE RAVITO" },

    { nom: "Martigny", km: 69.2, alt: 507, type: "ravito",
      lat: 46.08589, lon: 7.05736, segKm: 10.1, dplus: 163, dminus: 996,
      dpc: 3523, cible: "22:00", barriere: "02:15", marge: "4h15",
      mode: "moyen", nouveau: true,
      note: "🆕 LE POINT BAS DE LA COURSE — 507 m. Altitude basse = plus chaud la nuit.",
      alerte: "❓ Services exacts à confirmer sur place. Si liquide seulement, emporter du salé depuis Champex." },

    { nom: "Trient", km: 79.3, alt: 1304, type: "ravito",
      lat: 46.05547, lon: 6.99494, segKm: 10.1, dplus: 1082, dminus: 286,
      dpc: 4605, cible: "01:00", barriere: "06:00", marge: "5h00",
      margeAvant: "5h09", mode: "grand",
      note: "🆕 Remontée de +1 082 m sur 10,1 km depuis Martigny = 10,7 % de moyenne. Marche efficace aux bâtons, pas de l'escalade." },

    { nom: "Les Tseppes", km: 83.1, alt: 1936, type: "sommet",
      lat: 46.04747, lon: 6.97971, segKm: 3.8, dplus: 647, dminus: 16, dur: true,
      dpc: 5252, cible: "02:20",
      note: "+647 m sur 3,8 km = 17 % — LA PENTE LA PLUS RAIDE DE LA COURSE" },

    { nom: "Vallorcine", km: 90.4, alt: 1260, type: "ravito",
      lat: 46.03242, lon: 6.93236, segKm: 7.3, dplus: 160, dminus: 837,
      dpc: 5412, cible: "03:50", barriere: "07:15", marge: "3h25",
      margeAvant: "5h35", margeRetrecie: true, mode: "moyen", sortie: true,
      note: "⚠️ Barrière INCHANGÉE par l'organisation alors que tu y arrives 2h10 plus tard : ta marge passe de 5h35 à 3h25." },

    { nom: "La Flégère", km: 101.6, alt: 1882, type: "ravito",
      lat: 45.96089, lon: 6.88719, segKm: 11.2, dplus: 966, dminus: 342, expose: true,
      dpc: 6378, cible: "06:45", barriere: "10:45", marge: "4h00",
      margeAvant: "6h10", margeRetrecie: true, mode: "liquide",
      note: "Montée depuis Vallorcine : +966 m sur 11,2 km — la plus LONGUE de la course. Barrière inchangée : marge 6h10 → 4h00." },

    { nom: "Chamonix", km: 108.8, alt: 1035, type: "arrivee",
      lat: 45.92360, lon: 6.86912, segKm: 7.2, dplus: 21, dminus: 866,
      dpc: 6399, cible: "07:40", barriere: "12:00", marge: "4h20",
      margeAvant: "6h30", margeRetrecie: true,
      note: "Heure limite finale INCHANGÉE à 12:00 samedi. Ta marge passe de 6h30 à 4h20." }
  ]
};

/** Ce qu'il reste. A 3 h du matin, « il reste 7,2 km » vaut mieux qu'une
 *  soustraction mentale. */
export function kmRestant(km) {
  return Math.max(0, Math.round((PARCOURS.distanceOfficielle - km) * 10) / 10);
}

/** Les points dont la marge a fondu avec le nouveau parcours. Sert a
 *  l'affichage : la difference doit se voir, pas se deviner. */
export function margesRetrecies() {
  return PARCOURS.points.filter(function (p) { return p.margeRetrecie; });
}

export default PARCOURS;
