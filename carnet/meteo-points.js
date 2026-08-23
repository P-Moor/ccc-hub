/**
 * meteo-points.js — les 13 points où la météo compte vraiment
 * ---------------------------------------------------------------------------
 * Coordonnées tirées du GPX officiel, les mêmes que celles des fichiers de
 * `assets/`. L'ALTITUDE est la donnée décisive : Open-Meteo recale son modèle
 * dessus, et sans elle on lirait la météo de la vallée. Au Grand Col Ferret,
 * l'écart entre 2 529 m et le fond de vallée dépasse 6 °C.
 *
 * `km` sert à retrouver l'heure de passage prévue par interpolation sur le
 * scénario actif : la prévision est donc lue à la BONNE HEURE, au BON ENDROIT.
 *
 * ⚠️ Corrigé le 23/08. Les 13 points sont désormais posés SUR LA TRACE GPX,
 * vérifiés un par un contre `trace.js`. Deux sommets étaient mal placés :
 *   Grand Col Ferret  km 37,0 à 1 944 m  →  km 30,9 à 2 529 m
 *     Le point tombait dans la descente vers La Fouly, six kilomètres après le
 *     col. La météo du point le plus exposé de la course était lue 40 minutes
 *     trop tard et 585 m trop bas, soit environ 4 °C d'écart.
 *   Tête aux Vents    km 90,0 à 1 886 m  →  km 89,3 à 1 710 m
 *     L'altitude déclarée ne correspondait à aucun point de la trace. Celle-ci
 *     est le sommet réel de la montée depuis Vallorcine dans ce GPX.
 *
 * Toute modification ici périme automatiquement le cache de prévisions :
 * app.js compare une signature `km:alt` avant de réutiliser un relevé.
 */

export const METEO_POINTS = [
  { nom: "Courmayeur",         km: 0.0,     lat: 45.792840, lon: 6.971570, alt: 1221, type: "depart" },
  { nom: "Tête de la Tronche", km: 9.3,   lat: 45.821750, lon: 7.019480, alt: 2556, type: "sommet" },
  { nom: "Refuge Bertone",     km: 13.7,  lat: 45.809150, lon: 6.978740, alt: 1980, type: "ravito" },
  { nom: "Arnouvaz",           km: 26.5,  lat: 45.871450, lon: 7.053940, alt: 1777, type: "ravito" },
  { nom: "Grand Col Ferret",   km: 30.9,  lat: 45.887620, lon: 7.077690, alt: 2529, type: "sommet", expose: true },
  { nom: "La Fouly",           km: 40.9,  lat: 45.935190, lon: 7.098440, alt: 1602, type: "ravito" },
  { nom: "Champex-Lac",        km: 54.6,  lat: 46.022590, lon: 7.120050, alt: 1408, type: "base" },
  { nom: "Bovine",             km: 65.6,  lat: 46.057280, lon: 7.043760, alt: 2045, type: "sommet" },
  { nom: "Trient",             km: 71.2,  lat: 46.054890, lon: 6.997100, alt: 1340, type: "ravito" },
  { nom: "Vallorcine",         km: 83.2,  lat: 46.030880, lon: 6.930970, alt: 1266, type: "ravito" },
  { nom: "Tête aux Vents",     km: 89.3,  lat: 45.987650, lon: 6.917730, alt: 1710, type: "sommet", expose: true },
  { nom: "La Flégère",         km: 94.6,  lat: 45.959530, lon: 6.886410, alt: 1852, type: "ravito" },
  { nom: "Chamonix",           km: 101.5, lat: 45.923600, lon: 6.869120, alt: 1035, type: "arrivee" }
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
