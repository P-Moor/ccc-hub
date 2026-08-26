/**
 * parcours-data.js — les 15 points officiels de la CCC 2026
 * ---------------------------------------------------------------------------
 * SOURCE DE VERITE du parcours depuis le 24/08. Elle remplace les 9 reperes
 * bricoles a partir d'un GPX tiers : l'UTMB a publie `ccc_100km_universal.gpx`
 * avec les 15 points integres et leurs distances encodees dans le fichier.
 *
 * Ce qui a change en passant a l'officiel :
 *   100,9 km au lieu de 101,5   ·   6 050 m D+ au lieu de 6 062
 *   trois sommets qui n'avaient pas de nom en ont un : Bonatti, La Giete,
 *   Les Tseppes. Ce n'est pas cosmetique — Les Tseppes, c'est 17 % de pente
 *   moyenne a 23 h, et on ne se prepare pas a une bosse anonyme.
 *
 * `dplus` et `dminus` sont CALCULES sur le trace officiel, segment par
 * segment, bruit altimetrique filtre a 2,5 m. Ils retombent a un ou deux
 * metres pres sur ce qu'annonce l'UTMB pour chaque montee.
 *
 * ⚠️ L'UTMB pointe la SORTIE des ravitos de Champex et de Vallorcine, pas
 * l'entree. Le temps d'arret y est donc DEJA compris dans le chrono : inutile
 * de le rajouter, ce serait le compter deux fois.
 *
 * Regenerer la partie geometrique : scratchpad/gen_officiel.py
 */

export const PARCOURS = {
  source: "GPX officiel UTMB · ccc_100km_universal.gpx",
  distanceOfficielle: 100.9,
  dplusOfficiel: 6050,
  dmoinsOfficiel: 6199,
  pointeLaSortie: "⚠️ L'UTMB pointe la SORTIE de Champex et de Vallorcine, pas l'entrée. Le temps d'arrêt est déjà compris dans le chrono.",

  points: [
    { nom: "Courmayeur", km: 0.0, alt: 1221, type: "depart",
      lat: 45.79284, lon: 6.97157, segKm: 0.0, dplus: 0, dminus: 0,
      cible: "09:15" },

    { nom: "Tête de la Tronche", km: 9.4, alt: 2543, type: "sommet",
      lat: 45.82285, lon: 7.01944, segKm: 9.4, dplus: 1418, dminus: 95,
      note: "Sommet de la montée 1 · +1 418 m sur 9,4 km · VAM 450-480" },

    { nom: "Refuge Bertone", km: 13.6, alt: 1982, type: "ravito",
      lat: 45.80922, lon: 6.97865, segKm: 4.2, dplus: 18, dminus: 581,
      cible: "12:37", barriere: "13:45", marge: "1h08", mode: "express" },

    { nom: "Refuge Bonatti", km: 21.2, alt: 2027, type: "sommet",
      lat: 45.84678, lon: 7.03331, segKm: 7.5, dplus: 323, dminus: 277,
      note: "🆕 Balcon roulant — manger en marchant" },

    { nom: "Arnouvaz", km: 26.3, alt: 1777, type: "ravito",
      lat: 45.87133, lon: 7.05394, segKm: 5.2, dplus: 149, dminus: 396,
      cible: "14:28", barriere: "16:30", marge: "2h01", mode: "moyen" },

    { nom: "Grand Col Ferret", km: 30.9, alt: 2527, type: "sommet",
      lat: 45.88899, lon: 7.07790, segKm: 4.5, dplus: 761, dminus: 9, expose: true,
      note: "Toit de la course · +762 m sur 4,5 km · vent · veste à portée" },

    { nom: "La Fouly", km: 40.7, alt: 1604, type: "ravito",
      lat: 45.93566, lon: 7.09845, segKm: 9.9, dplus: 104, dminus: 1028,
      cible: "17:06", barriere: "20:15", marge: "3h08", mode: "moyen" },

    { nom: "Champex-Lac", km: 54.9, alt: 1472, type: "basedevie",
      lat: 46.02559, lon: 7.12246, segKm: 14.2, dplus: 599, dminus: 731,
      cible: "19:24", barriere: "23:15", marge: "3h50", mode: "grand",
      sortie: true },

    { nom: "Plan de l'Au", km: 59.8, alt: 1340, type: "pointage",
      lat: 46.04983, lon: 7.07972, segKm: 4.9, dplus: 74, dminus: 208,
      cible: "20:24", barriere: "00:15", marge: "3h50",
      alerte: "⚠️ POINTAGE SEUL — PAS DE RAVITO" },

    { nom: "La Giète", km: 66.3, alt: 1885, type: "sommet",
      lat: 46.05500, lon: 7.03364, segKm: 6.5, dplus: 731, dminus: 184,
      note: "🆕 Le vrai nom du sommet après Bovine · +731 m sur 6,5 km · de nuit" },

    { nom: "Trient", km: 71.5, alt: 1304, type: "ravito",
      lat: 46.05547, lon: 6.99494, segKm: 5.2, dplus: 41, dminus: 623,
      cible: "22:51", barriere: "04:00", marge: "5h08", mode: "grand" },

    { nom: "Les Tseppes", km: 75.2, alt: 1936, type: "sommet",
      lat: 46.04747, lon: 6.97971, segKm: 3.8, dplus: 647, dminus: 16, dur: true,
      note: "🆕 +647 m sur 3,8 km = 17 % — LA PENTE LA PLUS RAIDE DE LA COURSE, à 23 h" },

    { nom: "Vallorcine", km: 82.5, alt: 1260, type: "ravito",
      lat: 46.03242, lon: 6.93236, segKm: 7.3, dplus: 161, dminus: 837,
      cible: "01:40", barriere: "07:15", marge: "5h34", mode: "moyen",
      sortie: true },

    { nom: "La Flégère", km: 93.7, alt: 1882, type: "ravito",
      lat: 45.96089, lon: 6.88719, segKm: 11.2, dplus: 966, dminus: 342, expose: true,
      cible: "04:35", barriere: "10:45", marge: "6h09", mode: "liquide",
      note: "Montée depuis Vallorcine : +967 m sur 11,2 km — la plus LONGUE de la course" },

    { nom: "Chamonix", km: 100.9, alt: 1035, type: "arrivee",
      lat: 45.92360, lon: 6.86912, segKm: 7.2, dplus: 21, dminus: 866,
      cible: "05:30", barriere: "12:00", marge: "6h30" }
  ]
};

/** Ce qu'il reste. A 3 h du matin, « il reste 7,2 km » vaut mieux qu'une
 *  soustraction mentale. */
export function kmRestant(km) {
  return Math.max(0, Math.round((PARCOURS.distanceOfficielle - km) * 10) / 10);
}

export default PARCOURS;
