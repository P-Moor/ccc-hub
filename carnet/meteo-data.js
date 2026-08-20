/**
 * meteo-data.js — Ce qu'on sait, et ce qu'on ne sait pas encore
 */

export const METEO = {
  avertissement: "🔴 À plus de 7 jours, une prévision ne vaut rien. Le 17/08, l'écart entre modèles pour le 28 était de 11 °C sur le maximum. NE RIEN CONSTRUIRE DESSUS.",
  quandRegarder: "Le 25 ou le 26 août. Météo France Chamonix affiche un indice de confiance — le lire.",
  dateUtile: "2026-08-25",
  tendance: "Fin août plus frais que mi-août. Nuits 6-9 °C en vallée.",

  /* Mise a jour du 20/08 : les tendances se degradent, mais a huit jours ce
     sont des tendances, pas des previsions. */
  au20Aout: {
    constat: "Températures en baisse, pluie possible, risque d'orages, ambiance plus fraîche en altitude.",
    nuance: "⚠️ La presse trail parle d'une ALTERNANCE de périodes calmes et de passages instables, PAS d'une semaine entière sous la pluie. Et à huit jours, ce sont des TENDANCES.",
    historique: [
      { annee: 2023, conditions: "Neige, pluie, températures négatives au-dessus de 1 800 m" },
      { annee: 2024, conditions: "Froid glacial, barres énergétiques gelées sur la TDS et la MCC" },
      { annee: 2025, conditions: "Pluie persistante trois jours non-stop. Ressenti proche de 0 °C au Grand Col Ferret. 9 à 19 °C en vallée." }
    ],
    enseignement: "🔑 Trois éditions d'affilée avec froid, pluie ou neige en altitude. Ce n'est pas un accident, c'est le RÉGIME NORMAL de la fin août à 2 500 m.",
    atout: "✅ Tu viens de faire ta répétition sous la pluie battante, le 19, dans ta config exacte, avec un excellent résultat. C'est un avantage, pas un handicap.",
    orage: "⛈️ L'ORAGE est le seul risque non gérable : il peut modifier le parcours ou différer le départ. Le Grand Col Ferret, 2 529 m vers 16h, est le point le plus exposé.",
    gel: "🧊 Une barre énergétique peut GELER en altitude. Garder les gels en poche intérieure, pas dans le filet extérieur du sac.",
    quandRegarder: "📅 MARDI 25. Météo France Chamonix avec son indice de confiance · meteoblue · chamonix-meteo.com, le meilleur site local.",
    consigne: "⛔ NE PLUS CONSULTER d'ici là. Regarder la météo six fois par jour à J-8, c'est se ronger sans rien apprendre."
  },

  /* Mise a jour du 20/08 : les tendances se degradent, mais ce sont des
     tendances a huit jours, pas des previsions. */
  au20Aout: {
    constat: "Températures en baisse, pluie possible, risque d'orages, ambiance plus fraîche en altitude.",
    nuance: "⚠️ La presse trail parle d'une ALTERNANCE de périodes calmes et de passages instables, PAS d'une semaine entière sous la pluie. Et à huit jours, ce sont des TENDANCES.",
    historique: [
      { annee: 2023, conditions: "Neige, pluie, températures négatives au-dessus de 1 800 m" },
      { annee: 2024, conditions: "Froid glacial, barres énergétiques gelées sur la TDS et la MCC" },
      { annee: 2025, conditions: "Pluie persistante trois jours non-stop. Ressenti proche de 0 °C au Grand Col Ferret. 9 à 19 °C en vallée." }
    ],
    enseignement: "🔑 Trois éditions d'affilée avec froid, pluie ou neige en altitude. Ce n'est pas un accident, c'est le RÉGIME NORMAL de la fin août à 2 500 m. Ne pas compter sur le beau temps.",
    atout: "✅ Tu viens de faire ta répétition sous la pluie battante, le 19, dans ta config exacte, avec un excellent résultat. C'est un avantage, pas un handicap.",
    seulRisqueNonGerable: "⛈️ L'ORAGE : il peut modifier le parcours ou différer le départ. Le Grand Col Ferret, 2 529 m vers 16h, est le point le plus exposé de la journée.",
    detailPratique: "🧊 Une barre énergétique peut GELER en altitude. Garder les gels en poche intérieure, pas dans le filet extérieur du sac.",
    quandRegarder: "📅 MARDI 25. Météo France Chamonix avec son indice de confiance · meteoblue · chamonix-meteo.com, le meilleur site local.",
    consigne: "⛔ NE PLUS CONSULTER d'ici là. Regarder la météo six fois par jour à J-8, c'est se ronger sans rien apprendre. Les modèles vont changer trois fois."
  },
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
