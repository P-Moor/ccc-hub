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
 */

export const METEO_POINTS = [
  { nom: "Courmayeur",         km: 0,     lat: 45.789, lon: 6.969, alt: 1221, type: "depart" },
  { nom: "Tête de la Tronche", km: 9.5,   lat: 45.823185, lon: 7.019110, alt: 2556, type: "sommet" },
  { nom: "Refuge Bertone",     km: 13.7,  lat: 45.809150, lon: 6.978740, alt: 1980, type: "ravito" },
  { nom: "Arnouvaz",           km: 26.5,  lat: 45.871450, lon: 7.053940, alt: 1777, type: "ravito" },
  { nom: "Grand Col Ferret",   km: 37.0,  lat: 45.911040, lon: 7.097720, alt: 2529, type: "sommet", expose: true },
  { nom: "La Fouly",           km: 40.9,  lat: 45.935190, lon: 7.098440, alt: 1602, type: "ravito" },
  { nom: "Champex-Lac",        km: 54.6,  lat: 46.022590, lon: 7.120050, alt: 1408, type: "base" },
  { nom: "Bovine",             km: 66.0,  lat: 46.057480, lon: 7.039530, alt: 2044, type: "sommet" },
  { nom: "Trient",             km: 71.2,  lat: 46.054890, lon: 6.997100, alt: 1340, type: "ravito" },
  { nom: "Vallorcine",         km: 83.2,  lat: 46.030880, lon: 6.930970, alt: 1266, type: "ravito" },
  { nom: "Tête aux Vents",     km: 90.0,  lat: 45.982530, lon: 6.916930, alt: 1886, type: "sommet", expose: true },
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

/** Ce que l'app doit dire selon la lecture, pas seulement les chiffres. */
export const SEUILS = {
  froid:      { valeur: 5,  txt: "Sous 5 °C ressentis : gants AVANT d'avoir froid, pas après." },
  tresFroid:  { valeur: 0,  txt: "🥶 Sous 0 °C ressentis : les trois couches de gants, et la frontale contre le corps." },
  chaud:      { valeur: 25, txt: "Au-dessus de 25 °C : eau sur la nuque et la casquette à chaque ravito." },
  pluie:      { valeur: 50, txt: "Plus d'une chance sur deux de pluie : veste accessible sans ouvrir le sac." },
  rafales:    { valeur: 50, txt: "Rafales au-delà de 50 km/h : veste au col, même s'il fait bon en montant." },
  orage:      { txt: "⛈️ ORAGE annoncé. C'est le seul risque non gérable : il peut modifier le parcours ou différer le départ." }
};

export default METEO_POINTS;
