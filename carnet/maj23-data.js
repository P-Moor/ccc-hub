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
  statut: "✅ CONFIGURÉE le 23/08",
  reglages: [
    { n: 1, titre: "Alerte Temps 30:00", fait: true, critique: true,
      chemin: "Trail → Paramètres → Alertes → Ajouter → Temps → Récurrent",
      valeur: "30:00 · vibration seule",
      pourquoi: "🔴 LE dispositif critique du 28 : manger ET boire. Une alarme d'horloge ne se répète pas, il faut une alerte d'activité." },
    { n: 2, titre: "Alerte fréquence cardiaque", fait: true,
      chemin: "Trail → Paramètres → Alertes → Fréquence cardiaque",
      valeur: "145 bpm · Haute",
      pourquoi: "Le plafond des 15 premiers kilomètres, quand on part toujours trop vite." },
    { n: 3, titre: "Ascension automatique", fait: true,
      chemin: "Trail → Paramètres → Ascension automatique → État",
      valeur: "DÉSACTIVÉ",
      pourquoi: "Elle faisait basculer l'écran toute seule — source d'agacement identifiée, et d'agacement on n'a pas besoin au km 70." },
    { n: 4, titre: "ClimbPro", fait: true,
      chemin: "Trail → Paramètres → ClimbPro",
      valeur: "État = Lors de la navigation · Champ = Vitesse verticale",
      pourquoi: "Le profil des montées reste disponible, mais on va le chercher : il ne s'impose plus." }
  ],
  /* Ce qui reste, et pourquoi ca compte. Le 2 est une consequence directe du
     reglage 3 : en coupant l'ascension automatique, on a perdu l'ecran qui
     portait la vitesse verticale. */
  resteAFaire: [
    { txt: "🏷️ Désactiver les ALERTES DE SEGMENT", critique: true,
      pourquoi: "Elles ont contribué à la dérive jusqu'à FC 179 le 22/08 : on court après un chrono qui n'a rien à faire là." },
    { txt: "📊 Ajouter VITESSE VERTICALE à un écran de données actif",
      pourquoi: "Elle a disparu en désactivant l'ascension automatique. Sans elle, plus de contrôle de la VAM dans les montées." },
    { txt: "🗺️ Importer le GPX officiel dans Garmin Connect et vérifier les 15 points",
      pourquoi: "assets/ccc_100km_universal.gpx — le même que celui de la carte de l'app." },
    { txt: "🔌 Charger la Swift RL le 27 DANS LA JOURNÉE", critique: true,
      pourquoi: "Six heures de charge complète. Lancée le soir, elle n'est pas prête au matin." }
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


/* ==================== la recharge, revue le 24 ====================
   Constat du 24 : 200 g de riz, 135 g de poulet et un bol de soupe d'un coup
   donnent une sensation de lourdeur, alors que la QUANTITE est correcte. Ce
   n'est donc pas un probleme de volume total mais de repartition. */

export const RECHARGE = {
  regle: "🔴 FRACTIONNER PLUTÔT QU'AUGMENTER. Même quantité de glucides, répartie sur 5 prises.",
  pourquoi: "Un gros repas donne une sensation de lourdeur sans mieux remplir les réserves. Et Pierre a un enjeu de confort digestif au départ.",
  schema: [
    { moment: "Petit-déj", contenu: "Porridge ou pain + miel · banane" },
    { moment: "~10h30",    contenu: "Pain d'épices · compote" },
    { moment: "Midi",      contenu: "FÉCULENT EN BASE + protéine maigre" },
    { moment: "~16h",      contenu: "Banane · barre · pain" },
    { moment: "Soir",      contenu: "Riz ou pâtes + poulet ou dinde" }
  ],
  aArreter: [
    { quoi: "🍲 La SOUPE", quand: "à partir du 25",
      pourquoi: "Beaucoup de volume, très peu de glucides. Elle prend la place des féculents." },
    { quoi: "🥚 Les ŒUFS", quand: "à partir du 27",
      pourquoi: "Gras, vidange gastrique lente." },
    { quoi: "🌶️ L'épicé, sriracha comprise", quand: "à partir du 27" }
  ],
  proteine: "Poulet ou dinde uniquement, du 24 au 28."
};

/* ==================== ce que l'app ne fera pas ====================
   Pierre requalifie regulierement en « craquage » des prises alimentaires
   normales et adaptees. Une app qui compterait les calories transformerait une
   inquietude legitime en obsession, cinq jours avant un 100 km. Ce bloc existe
   pour que ce soit ecrit noir sur blanc, et tenu. */

export const VIGILANCE_NUTRITION = {
  constat: "Pierre requalifie régulièrement en « craquage » des prises alimentaires normales et adaptées : Coca de récupération, skyr post-effort, Aquarius, pain d'épices, cookies maison.",
  frequence: "Au moins 5 fois entre le 15 et le 24 août.",
  inquietude: "Arriver ballonné au départ. C'est une inquiétude légitime, mais mal ciblée.",
  fait: {
    titre: "🔴 La recharge glucidique FIXE DE L'EAU",
    txt: "Environ 3 g d'eau par gramme de glycogène stocké. La sensation de rétention est le SIGNE QUE ÇA MARCHE, pas un problème à corriger."
  },
  cequiRendLeger: "La descente progressive en fibres du 25 au 28. PAS la restriction. Un coureur qui restreint a faim le 27, mange trop au dîner de J-1, et arrive ballonné le 28 — exactement ce qu'il voulait éviter.",
  consigne: "⛔ Cette app n'affichera JAMAIS de compteur, de pesée ni de bilan de repas. Elle affiche le PLAN, pas une note."
};

export const PHYSIO_24 = {
  date: "2026-08-24",
  titre: "🔥 Le meilleur profil du dossier, au moment d'entrer dans la semaine de course",
  lignes: [
    { l: "Sommeil", v: "6h48 · score 83 GOOD", n: "20 min d'éveil seulement — première nuit non fragmentée depuis 4 jours", bon: true },
    { l: "Profond", v: "53 min", n: "Faible. C'est ce qui explique la sensation groggy au réveil." },
    { l: "FC de repos", v: "41", bon: true },
    { l: "VFC", v: "88 ms · BALANCED", n: "baseline 63", bon: true },
    { l: "Body Battery", v: "93", bon: true },
    { l: "Readiness", v: "75 · HIGH", bon: true },
    { l: "Stress nocturne", v: "9", bon: true },
    { l: "SpO₂", v: "99 %", bon: true }
  ],
  charge: "ACWR 0,7 · TSB +203 · MAINTAINING — le point culminant de l'affûtage.",
  symptomes: {
    quoi: "🤒 Gorge sèche qui gratte depuis le 23, nez qui coule légèrement depuis le 24, par 9-10 °C après une période de canicule.",
    analyse: "Probablement une rhinite vasomotrice — une réaction mécanique au froid — plus l'irritation qui suit un sommeil profond bouche ouverte.",
    preuve: "AUCUN signe infectieux dans les données : FC de repos au plus bas à 41, VFC excellente à 88, stress nocturne à 9. Une infection ferait exactement l'inverse.",
    surveillance: "➡️ Le signal qui changerait tout : FC de repos +5 bpm, VFC effondrée, fatigue inhabituelle. À regarder chaque matin, sans plus."
  }
};

export default { CHANGEMENTS, GESTION_COGNITIVE, MONTRE, PRISE_DE_SANG,
                 RECHARGE, VIGILANCE_NUTRITION, PHYSIO_24 };
