/**
 * maj23-data.js — ce qui s'est ferme du 21 au 23 aout
 * ---------------------------------------------------------------------------
 * A J-5, l'app change de nature : elle ne sert plus a PREPARER mais a PILOTER.
 * Plus aucune decision n'est ouverte. Ce fichier porte les quatre blocs qui
 * accompagnent ce basculement :
 *
 *   CHANGEMENTS      ce qui a bouge par rapport au plan, et pourquoi
 *   GESTION_COGNITIVE  pourquoi l'app doit etre une bequille, pas un confort
 *   MONTRE           les chemins de menu exacts de la Fenix 8
 *   PRISE_DE_SANG    les resultats du 20/08
 *
 * La reference du laboratoire et le prescripteur ne sont PAS ici : ce fichier
 * est public. Ils sont dans le coffre.
 */

/* ==================== ce qui a bouge depuis le plan ====================
   Chaque ligne est un ecart assume, pas un oubli. On garde l'ancien a cote du
   neuf : dans cinq jours Pierre ne se souviendra plus de ce qu'il avait prevu,
   et il doit pouvoir verifier qu'un changement est bien une decision. */

export const CHANGEMENTS = {
  date: "2026-08-23",
  lignes: [
    { objet: "🔦 Lampe de secours", avant: "Simond HL900",
      apres: "2ᵉ Petzl Swift RL — 99 €, plus la batterie de rechange déjà commandée",
      pourquoi: "Marque connue, mêmes réglages, batteries interchangeables. Un seul geste à connaître au lieu de deux.",
      sens: "gain" },
    { objet: "🔥 Chauffe-mains", avant: "2 paires TerraTherm 12 h",
      apres: "❌ ÉCARTÉS",
      pourquoi: "Introuvables en magasin fin août, c'est hors saison. Le froid aux mains se traite avec les quatre paliers de gants, et les moufles si la prévision l'impose.",
      sens: "perte" },
    { objet: "🍠 Baouw gel + purée", avant: "Dans le sac de Champex",
      apres: "❌ ÉCARTÉS — le salé se prend aux ravitos",
      pourquoi: "Choix de Pierre. Voir la réserve ci-dessous : il y a un trou de 3 h 05 sans ravito après Champex.",
      sens: "perte" },
    { objet: "🥄 Poudre Boost en mini-ziplocks", avant: "Pré-dosés à la maison",
      apres: "🔄 Préparés sur place",
      pourquoi: "Plus simple à transporter, et ça évite la poudre éventrée dans la valise.",
      sens: "neutre" },
    { objet: "🩹 Bande élastique", avant: "À acheter",
      apres: "✅ Leukoplast Elastomull haft — 6 cm × 4 m, cohésive",
      pourquoi: "Cohésive : elle tient sur elle-même. Pas de sparadrap à trouver avec les doigts froids.",
      sens: "gain" },
    { objet: "🥣 Bol", avant: "À acheter",
      apres: "✅ Sea to Summit Frontier 400 ml, 53 g, plus un spork",
      sens: "gain" },
    { objet: "🧥 Veste S/Lab", avant: "Déperlant mort",
      apres: "✅ Nikwax Tech Wash + TX.Direct faits",
      pourquoi: "⚠️ Séchage à l'air uniquement — l'étiquette de cette veste interdit le sèche-linge.",
      sens: "gain" }
  ],
  /* Une objection du coach que Pierre a ecartee. Elle est notee ici parce
     qu'elle redeviendra pertinente a un moment precis, et a un seul. */
  reserve: {
    sujet: "🍠 La purée Baouw patate douce",
    quoi: "Écartée par Pierre, mais c'était la seule option SALÉE pour Champex → Trient : 16,5 km, 3 h 05, aucun ravito.",
    quand: "À se reposer une fois, au moment de boucler le sac de Champex. Une fois, et sans insister."
  }
};

/* ==================== l'attention, et pourquoi elle lache ====================
   Ce bloc n'est pas du confort. Il explique POURQUOI l'app est faite comme
   elle est faite, et ou se situe le vrai risque du 28. */

export const GESTION_COGNITIVE = {
  constat: "Symptômes attentionnels nettement plus marqués depuis le 20/08 : commencer une tâche, en démarrer une autre, oublier la première.",
  causes: [
    { icone: "🏃", txt: "Perte du régulateur principal. Le volume est passé de ~40 km/semaine à 14, TSB +214. L'activité physique intense régule les circuits dopaminergiques : l'affûtage retire la béquille au moment où il en faudrait le plus." },
    { icone: "😰", txt: "Le stress dégrade les fonctions exécutives — planification, mémoire de travail, inhibition. C'est exactement ce qui lâche." },
    { icone: "😴", txt: "Trois nuits fragmentées d'affilée, du 21 au 23." }
  ],
  conclusion: "Ce n'est PAS une aggravation. C'est le fonctionnement habituel, moins bien compensé : les trois béquilles — sport, sommeil, calme — sont affaiblies en même temps, et elles le sont pour de bonnes raisons.",
  implications: [
    { icone: "📋", txt: "L'app est une PROTHÈSE, pas un confort. Les listes doivent être exhaustives et cochables." },
    { icone: "✅", txt: "Une tâche à la fois, jusqu'au bout. La vue « par jour » sert exactement à ça." },
    { icone: "🎫", txt: "Les cartes plastifiées sont essentielles : au ravito, l'attention est au plus bas — bruit, monde, fatigue, froid." },
    { icone: "⏰", txt: "L'alarme vibreur de nutrition est LE dispositif critique du 28." },
    { icone: "⛔", txt: "L'app ne doit jamais réafficher comme ouvert un sujet déjà clos." }
  ],
  risqueJourJ: {
    quoi: "🔴 LA NUTRITION",
    pourquoi: "C'est la seule chose qui demande une attention répétée toutes les 30 min pendant 20 h.",
    precedent: "Déjà vécu le 15/08 : dès que l'attention est partie sur la navigation, la nutrition a sauté."
  }
};

/* ==================== la Fenix, chemins de menu exacts ====================
   Ecrire « mettre une alarme » ne sert a rien : le piege est qu'une alarme
   d'horloge NE SE REPETE PAS. Il faut une alerte d'ACTIVITE, et elle se cache
   a quatre niveaux de profondeur. D'ou les chemins mot pour mot. */

export const MONTRE = {
  modele: "Garmin Fenix 8",
  reglages: [
    { n: 1, titre: "Alarme nutrition", critique: true,
      chemin: "Maintenir MENU → Activités et applis → Trail → Paramètres → Alertes → Ajouter → Temps → RÉCURRENT → 30:00 → VIBRATION SEULE",
      piege: "⚠️ Une alarme d'horloge classique ne se répète pas. Il FAUT une alerte d'activité, sinon elle ne sonne qu'une fois.",
      pourquoi: "C'est le seul dispositif qui tient la nutrition quand l'attention part ailleurs." },
    { n: 2, titre: "Alerte fréquence cardiaque",
      chemin: "Même menu → Alertes → Ajouter → Fréquence cardiaque → Haute → 145",
      pourquoi: "Le garde-fou des trois premières heures, quand on part toujours trop vite." },
    { n: 3, titre: "Écran « prochain objectif »",
      chemin: "Trail → Paramètres → Écrans de données → Ajouter → 3 champs : Distance au point suivant · ETA au point suivant · Heure du jour",
      pourquoi: "🎯 Un écran, une question. Trois champs, pas plus : au-delà, on ne lit plus, on regarde." },
    { n: 4, titre: "Trace GPX et waypoints", echeance: "2026-08-25",
      chemin: "Garmin Connect → Entraînement → Parcours → Importer CCC_2026_RAVITOS_SOMMETS.gpx → vérifier les 13 points → Envoyer à la montre",
      pourquoi: "Les 13 points sont ceux de la météo et du plan de course. Même repères partout." },
    { n: 5, titre: "Charge", critique: true, echeance: "2026-08-27",
      chemin: "Swift RL branchée le 27 DANS LA JOURNÉE · montre à 100 % le 27 au soir",
      piege: "🔴 La Swift RL demande SIX HEURES de charge complète. Lancée le soir, elle n'est pas prête au matin." }
  ]
};

/* ==================== la prise de sang du 20 aout ====================
   Tout est rassurant, et c'est le point important : la question de fond
   (polyarthrite) est tranchee. Les trois lignes a surveiller ne changent rien
   au 28, elles se traitent apres. */

export const PRISE_DE_SANG = {
  date: "2026-08-20",
  conclusion: {
    titre: "🎯 Polyarthrite rhumatoïde écartée",
    txt: "Pas de connectivite, pas d'inflammation systémique. Deux conséquences : le Raynaud est probablement PRIMAIRE, et le pied est un problème LOCAL et MÉCANIQUE."
  },
  rassurant: [
    "✅ Anticorps anti-nucléaires : NÉGATIF",
    "✅ Facteur rhumatoïde : < 3,5 — norme < 14",
    "✅ Anti-CCP : < 0,50 — norme < 7",
    "✅ CRP < 5 : zéro inflammation",
    "✅ Fer 76 · Ferritine 267 : aucune carence martiale",
    "✅ Rein, thyroïde, sodium, potassium : normaux",
    "✅ Hémoglobine 16,5"
  ],
  aSurveiller: [
    { valeur: "Acide urique 7,5 mg/dL",
      note: "Dans la norme du labo, mais AU-DESSUS de la cible thérapeutique sous allopurinol, qui est < 6. Crise le 10/08. À réévaluer après la course, pas avant." },
    { valeur: "Bilirubine totale 2,7 · directe 0,7",
      note: "Élevée, mais toutes les enzymes hépatiques sont normales — TGO 26, TGP 28, GGT 29, PAL 53. Tableau souvent bénin. À faire commenter par la médecin." },
    { valeur: "Plaquettes 160",
      note: "Très légèrement sous la norme de 166. Banal chez un sportif d'endurance." }
  ],
  aProgrammer: "🆕 Imagerie des mains PRESCRITE. RDV à prendre APRÈS le 28, idéalement autour du 4-5/09 pour grouper avec le chirurgien et l'IRM du pied."
};

export default { CHANGEMENTS, GESTION_COGNITIVE, MONTRE, PRISE_DE_SANG };
