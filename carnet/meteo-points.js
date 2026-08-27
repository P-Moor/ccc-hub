/**
 * meteo-points.js — les 15 points ou la meteo compte
 * ---------------------------------------------------------------------------
 * Depuis le 24/08 ces points sont ceux du GPX OFFICIEL UTMB, copies tels quels
 * depuis parcours-data.js. Plus aucune coordonnee n'est saisie a la main :
 * c'est ce qui avait produit l'erreur du Grand Col Ferret, lu six kilometres
 * apres le col pendant trois versions.
 *
 * L'ALTITUDE est la donnee decisive : Open-Meteo recale son modele dessus, et
 * sans elle on lirait la meteo de la vallee. Au Grand Col Ferret, l'ecart
 * entre 2 527 m et le fond de vallee depasse 6 °C.
 *
 * `km` sert a retrouver l'heure de passage par interpolation sur le scenario
 * actif : la prevision est donc lue a la BONNE HEURE, au BON ENDROIT.
 *
 * Toute modification ici perime automatiquement le cache de previsions :
 * app.js compare une signature `km:alt` avant de reutiliser un releve.
 */

export const METEO_POINTS = [
  { nom: "Courmayeur",           km: 0.0,    lat: 45.79284, lon: 6.97157, alt: 1221, type: "depart" },
  { nom: "Tête de la Tronche",   km: 9.4,    lat: 45.82285, lon: 7.01944, alt: 2543, type: "sommet", expose: true },
  { nom: "Refuge Bertone",       km: 13.6,   lat: 45.80922, lon: 6.97865, alt: 1982, type: "ravito" },
  { nom: "Refuge Bonatti",       km: 21.2,   lat: 45.84678, lon: 7.03331, alt: 2027, type: "sommet" },
  { nom: "Arnouvaz",             km: 26.3,   lat: 45.87133, lon: 7.05394, alt: 1777, type: "ravito" },
  { nom: "Grand Col Ferret",     km: 30.9,   lat: 45.88899, lon: 7.07790, alt: 2527, type: "sommet", expose: true },
  { nom: "La Fouly",             km: 40.7,   lat: 45.93566, lon: 7.09845, alt: 1604, type: "ravito" },
  { nom: "Champex-Lac",          km: 54.2,   lat: 46.02559, lon: 7.12246, alt: 1472, type: "base" },
  { nom: "Plan de l'Au",         km: 59.1,   lat: 46.04983, lon: 7.07972, alt: 1340, type: "pointage" },
  { nom: "Martigny",             km: 69.2,   lat: 46.08589, lon: 7.05736, alt: 507,  type: "ravito" },
  { nom: "Trient",               km: 79.3,   lat: 46.05547, lon: 6.99494, alt: 1304, type: "ravito" },
  { nom: "Les Tseppes",          km: 83.1,   lat: 46.04747, lon: 6.97971, alt: 1936, type: "sommet", expose: true },
  { nom: "Vallorcine",           km: 90.4,   lat: 46.03242, lon: 6.93236, alt: 1260, type: "ravito" },
  { nom: "La Flégère",           km: 101.6,  lat: 45.96089, lon: 6.88719, alt: 1882, type: "ravito", expose: true },
  { nom: "Chamonix",             km: 108.8,  lat: 45.92360, lon: 6.86912, alt: 1035, type: "arrivee" },
];

/** Source : gratuite, sans clé, et elle accepte l'altitude par point. */
export const METEO_SOURCE = {
  nom: "Open-Meteo",
  base: "https://api.open-meteo.com/v1/forecast",
  champs: "temperature_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m,weather_code",
  note: "Modèle ICON/AROME recalé sur l'altitude de chaque point. Sans le paramètre elevation, on lirait la météo du fond de vallée."
};

/** Les codes WMO, traduits en une image et un mot. */
export const CODES_METEO = {
  0:  { i: "☀️", t: "ciel clair" },
  1:  { i: "🌤️", t: "peu nuageux" },
  2:  { i: "⛅", t: "partiellement couvert" },
  3:  { i: "☁️", t: "couvert" },
  45: { i: "🌫️", t: "brouillard" },
  48: { i: "🌫️", t: "brouillard givrant" },
  51: { i: "🌦️", t: "bruine faible" },
  53: { i: "🌦️", t: "bruine" },
  55: { i: "🌧️", t: "bruine forte" },
  56: { i: "🌧️", t: "bruine verglaçante" },
  57: { i: "🌧️", t: "bruine verglaçante forte" },
  61: { i: "🌧️", t: "pluie faible" },
  63: { i: "🌧️", t: "pluie" },
  65: { i: "🌧️", t: "pluie forte" },
  66: { i: "🌧️", t: "pluie verglaçante" },
  67: { i: "🌧️", t: "pluie verglaçante forte" },
  71: { i: "🌨️", t: "neige faible" },
  73: { i: "🌨️", t: "neige" },
  75: { i: "❄️", t: "neige forte" },
  77: { i: "🌨️", t: "grains de neige" },
  80: { i: "🌦️", t: "averses faibles" },
  81: { i: "🌧️", t: "averses" },
  82: { i: "⛈️", t: "averses violentes" },
  85: { i: "🌨️", t: "averses de neige" },
  86: { i: "❄️", t: "averses de neige fortes" },
  95: { i: "⛈️", t: "ORAGE" },
  96: { i: "⛈️", t: "ORAGE avec grêle" },
  99: { i: "⛈️", t: "ORAGE violent avec grêle" }
};

/** Les seuils, au meme endroit.
 *  Ce fichier ne porte plus les phrases : elles sont dans l'app, parce
 *  qu'elles dependent d'OU et de QUAND le seuil est franchi, pas seulement du
 *  fait qu'il le soit. Ici on garde les NOMBRES, pour n'avoir qu'un endroit a
 *  corriger si un avis change. */
export const SEUILS = {
  froid:        5,    // °C ressentis : les gants sortent
  tresFroid:    0,    // °C ressentis : les trois couches
  gel:          2,    // °C reels : les barres durcissent, les batteries tombent
  chaud:        25,   // °C reels : eau sur la nuque
  pluie:        50,   // % : la veste devient accessible sans ouvrir le sac
  pluieForte:   70,   // % : le sur-pantalon sort aussi
  pluieFroide:  7,    // °C ressentis sous lesquels la pluie devient le sujet
  rafales:      50,   // km/h : veste au col
  rafalesFortes:80,   // km/h : capuche serree, on ne discute plus
  sequence:     3,    // nombre de points sous `froid` qui fait sortir les moufles
  amplitude:    12,   // °C d'ecart jour/nuit qui rend le sac de Champex decisif
  orage:        95    // code WMO a partir duquel c'est un orage
};

export default METEO_POINTS;
