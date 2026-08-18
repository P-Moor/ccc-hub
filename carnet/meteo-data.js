/**
 * meteo-data.js — Ce qu'on sait, et ce qu'on ne sait pas encore
 */

export const METEO = {
  avertissement: "🔴 À plus de 7 jours, une prévision ne vaut rien. Le 17/08, l'écart entre modèles pour le 28 était de 11 °C sur le maximum. NE RIEN CONSTRUIRE DESSUS.",
  quandRegarder: "Le 25 ou le 26 août. Météo France Chamonix affiche un indice de confiance — le lire.",
  dateUtile: "2026-08-25",
  tendance: "Fin août plus frais que mi-août. Nuits 6-9 °C en vallée.",
  profilAltitude: [
    { lieu:"Courmayeur",       alt:1221, heure:"09:15",  temp:"10-16 °C" },
    { lieu:"Grand Col Ferret", alt:2529, heure:"~16:00", temp:"2-7 °C + vent" },
    { lieu:"Champex",          alt:1408, heure:"19:24",  temp:"8-13 °C" },
    { lieu:"Bovine",           alt:2044, heure:"~21:30", temp:"4-9 °C" },
    { lieu:"Catogne",          alt:2070, heure:"~00:30", temp:"1-5 °C" },
    { lieu:"Tête aux Vents",   alt:1886, heure:"~03:30", temp:"0-4 °C", critique:true },
    { lieu:"Chamonix",         alt:1035, heure:"05:30",  temp:"6-10 °C" }
  ],
  conclusion: "🥶 Le vrai risque thermique n'est pas la chaleur du jour — c'est le FROID DE NUIT EN ALTITUDE, à l'heure la plus froide, après 18 h d'effort, trempé de sueur, en mouvement lent. Mais garder l'acclimatation chaleur (11 h de jour, montée de la Tronche plein sud).",
  aRegarderAussi: "La PLUIE — change tout (veste, sur-pantalon, sur-gants, adhérence sur les blocs de la Tête aux Vents). À vérifier le 25."
};

export default METEO;
