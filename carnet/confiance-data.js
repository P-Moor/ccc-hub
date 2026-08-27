/**
 * confiance-data.js — Pourquoi tu peux le faire
 * Source : WILDSTRUBEL_vs_CCC.md. A consulter avant le depart et dans le doute.
 */

export const CONFIANCE = {
  titre: "Pourquoi tu peux le faire",
  reference: "Wildstrubel · 20 septembre 2025",

  comparaison: [
    { quoi: "km-effort",          wild: "85,2",  ccc: "162,1" },
    { quoi: "Temps total",        wild: "9h07",  ccc: "~22h25" },
    { quoi: "Allure / km-effort", wild: "6:25",  ccc: "7:29", cle: true },
    { quoi: "FC moyenne",         wild: "150 = 90 % du seuil", ccc: "~132 = 78 %", cle: true }
  ],

  messages: [
    {
      n: 1, titre: "Plus gros, mais beaucoup plus lent",
      txt: "La CCC est 1,9× plus grosse que Wildstrubel, mais tu as 2,2× plus de temps. Ça fait 17 % plus lent par km-effort, et 18 battements plus bas. À 150 de moyenne, tu ne pouvais effectivement pas recommencer. À 132, c'est une autre activité physiologique."
    },
    {
      n: 2, titre: "Le mur d'Iffigenalp, avec une épaule luxée",
      txt: "1 239 m de D+ en 6 km à 20,4 % de pente, VAM 535 m/h — avec une épaule luxée depuis 48 h, le bras gauche qui compense, le bâton droit tenu bas, et le sac jamais enlevé aux ravitos sauf un arrêt. La montée de la Tronche fait 14,4 % et la consigne est 450-480 m/h. La difficulté n'est pas de la monter, c'est de la monter lentement."
    },
    {
      n: 3, titre: "Tu as accéléré sur la fin",
      txt: "Les 5 derniers kilomètres : 7:09 puis 5:45, 5:35, 4:49, et un sprint à 433 W, FC 181. Tu n'étais pas vidé. Ton pacing avait tenu."
    }
  ],

  vigilance: {
    titre: "Le point de vigilance",
    txt: "À Wildstrubel, 46 min d'arrêts sur 9h07 : 8,5 %. Le plan CCC prévoit 1h21 sur 22h25 : 6,0 %. Le budget planifié reste plus serré que ton comportement réel — le parcours modifié n'y change rien.",
    conclusion: "C'est le scénario B — 1h42 d'arrêts, arrivée 08:15, 3h44 de marge. Ne pas chercher à rattraper aux jambes ce qui est pris aux ravitos."
  }
};

export default CONFIANCE;
