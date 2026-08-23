/**
 * maj20-data.js — ce qui s'est joué du 18 au 20 août
 * ---------------------------------------------------------------------------
 * Les trois inconnues de la semaine sont fermées : chaussures, colchicine,
 * caféine. Et trois dossiers neufs se sont ouverts : la veste qui ne déperle
 * plus, les lampes, et la balise à rendre le samedi.
 *
 * Source : MAJ_CLAUDE_CODE_20AOUT.md, fourni par Pierre le 20/08.
 */

/* ==================== chaussures : dossier fermé ==================== */

export const VERDICT_CHAUSSURES = {
  statut: "FERMÉ",
  decision: "S/Lab Ultra Glide Reveal 44⅔ — validée pour la CCC",
  test1: {
    date: "2026-08-15", km: 25.4, dplus: 1195, temp: "jusqu'à 30,8 °C",
    resultat: "brûlure quasi nulle",
    chaussettes: "Sidas Trail Protect"
  },
  test2: {
    date: "2026-08-19", km: 13.0, dplus: 395,
    conditions: "PLUIE BATTANTE, pieds trempés 1h20",
    resultat: "zéro brûlure, léger échauffement sur les 100 derniers mètres seulement",
    chaussettes: "BV Sport",
    detailCle: "A dû RESSERRER le laçage après la 2ᵉ descente : le pied ne gonflait PAS dans la chaussure. C'est l'inverse du scénario redouté."
  },
  lendemain: {
    date: "2026-08-20",
    bordExterne: "ZÉRO — revenu à la normale",
    peau: "intacte, aucune ampoule, durillon en reconstitution"
  },
  profilConfirme: "Douleur déclenchée par la charge répétée, RÉSOLUTIVE EN UNE NUIT. Constaté trois fois : 15/08, 17/08, 20/08.",
  noteImportante: "La peau mouillée est bien plus vulnérable au frottement que la peau sèche. Tenir 13 km trempé avec un simple échauffement final est un résultat obtenu en conditions DÉGRADÉES.",
  redondanceChaussettes: "🧦 Ce dossier est clos depuis le 22/08 : ce sont les Sidas Trail DOUBLE qui partent aux pieds, validées sur 10,2 km en conditions dures. Les Trail Protect deviennent le secours — une paire dans le sac de course, une à Champex. Deux modèles éprouvés de la même marque, c'est de la redondance, pas une hésitation."
};

/* ==================== trousse médicale : complète ==================== */

export const TROUSSE = {
  statut: "COMPLÈTE — validée médicalement le 20/08",
  rdv: "Dr Alexandra Nunes de Sousa, jeudi 20/08 à 8h20",
  items: [
    { nom: "Allopurinol", statut: "maintenu" },
    { nom: "Colchicine", statut: "MAINTENUE LE JOUR J", cle: true,
      note: "Confirmé par le médecin le 20/08. Question ouverte depuis le 15/08, désormais fermée." },
    { nom: "Antihistaminique non sédatif", statut: "PRESCRIT le 20/08", cle: true,
      aFaire: "⚠️ Retirer l'ordonnance en pharmacie AVANT le 25. Vérifier qu'il est bien NON SÉDATIF." },
    { nom: "Compeed", statut: "en curatif uniquement" },
    { nom: "Sels et électrolytes", statut: "ok" },
    { nom: "Bande élastique", statut: "✅ ACHETÉE",
      note: "Leukoplast Elastomull haft — 6 cm × 4 m, cohésive. Elle tient sur elle-même, donc pas de sparadrap à trouver avec les mains froides." },
    { nom: "Bol + spork", statut: "✅ ACHETÉS",
      note: "Sea to Summit Frontier 400 ml, 53 g. Pour le salé aux ravitos." }
  ],
  suivi: {
    priseDeSang: "✅ Résultats reçus. Polyarthrite rhumatoïde écartée, zéro inflammation, aucune carence martiale. Le détail est dans le dossier médical.",
    ongles: "signalés au médecin : ongles de mains épais, durs, friables, plus douleur rapide des doigts au froid. Suivi en cours.",
    pieds: "revus le 20/08. Suivi maintenu.",
    prochainesEtapes: "Chirurgien le 4/09 · IRM pied droit le 5/09 · rhumatologue en janvier 2027"
  }
};

/* ==================== la veste ne déperle plus ==================== */

export const VESTE = {
  modele: "Salomon S/Lab Ultra Jacket",
  membrane: "Pertex Shield 3 couches · 10 000 mm · respirabilité 50 000 g/m²/24h",
  statut: "✅ TRAITÉE — Tech Wash + TX.Direct faits le week-end du 22-23.",
  alerteSechage: "⚠️ Séchage à l'air UNIQUEMENT. L'étiquette de cette veste interdit le sèche-linge : ne pas suivre l'étape 4 du protocole Nikwax telle quelle.",
  probleme: "Ne déperlait plus. Constaté le 19/08 : trempé de l'intérieur, surtout aux avant-bras.",
  diagnostic: "Ce n'est PAS la membrane qui lâche, c'est le traitement déperlant de surface qui est usé. Le tissu extérieur se gorge d'eau au lieu de la repousser, ce qui bloque le transfert de vapeur. La sueur reste dedans, effet cocotte.",
  consequenceSecondaire: "⚠️ Explique aussi la montée de FC en fin de séance, 152 puis 156 puis 160 sur les trois derniers kilomètres : une veste qui ne respire plus, c'est de la chaleur piégée et une thermorégulation dégradée.",
  produit: "Nikwax Tech Wash + TX.Direct — commandé le 19/08, appliqué le week-end du 22-23.",
  protocole: [
    { n: 1, txt: "Lire l'étiquette de la veste : température, essorage" },
    { n: 2, txt: "Tech Wash en machine", alerte: "⛔ Bac à lessive VIDE ET RINCÉ. Les résidus de lessive classique tuent le déperlant." },
    { n: 3, txt: "TX.Direct, deuxième cycle, sur veste encore humide" },
    { n: 4, txt: "Chaleur douce pour activer le déperlant.", alerte: "⛔ PAS de sèche-linge sur CETTE veste, l'étiquette l'interdit. Séchage à l'air, puis fer doux avec un linge entre les deux." },
    { n: 5, txt: "Test : quelques gouttes d'eau sur la manche sèche. Elles perlent, c'est réglé. Elles s'étalent, on recommence." }
  ],
  quand: "week-end du 22-23/08 — séchage complet obligatoire avant le 26",
  statut: "à faire"
};

/* ==================== lampes : config figée ==================== */

export const LAMPES = {
  principale: {
    modele: "Petzl Swift RL", batterie: "2 350 mAh",
    alerte: "⚠️ SIX HEURES de charge complète. Impossible de recharger à Champex. Charger le 27 DANS LA JOURNÉE, pas le soir.",
    conseil: "Mode réactif : l'intensité baisse toute seule quand tu regardes le sol. C'est ce qui fait tenir les 9 h de nuit."
  },
  secours: {
    modele: "2ᵉ Petzl Swift RL", prix: "99 €",
    decision: "✅ ARBITRÉE le 23/08 — assumée : marque connue, mêmes réglages, batteries interchangeables.",
    pourquoi: "Deux fois la même lampe, c'est un seul geste à connaître au lieu de deux. À 3 h du matin, ça compte plus que les grammes."
  },
  rechange: [
    { objet: "Batterie de rechange Swift RL", statut: "commandée le 19/08",
      note: "Elle va sur l'une comme sur l'autre : c'est tout l'intérêt d'avoir deux fois la même lampe." }
  ],
  reglementaire: "2 lampes + rechange : la ligne du règlement est cochée. Les deux sont des Swift RL, la batterie de rechange sert aux deux.",
  froid: "🌡️ Le froid tue les batteries. Garder la Swift allumée sur la tête, elle reste au chaud. Si tu la retires : poche intérieure, contre le corps. La seconde reste dans le sac, batterie pleine."
};

/* ==================== la balise, à rendre le samedi ==================== */

export const BALISE = {
  caution: { montant: "155 €", systeme: "Swikly", dates: "27/07/2026 → 17/01/2027", statut: "réglée" },
  retrait: "jeudi 27/08, en même temps que le dossard, 12h-14h à l'Espace Michel Croz. Un bénévole oriente vers le poste balise après l'enveloppe dossard.",
  restitution: {
    dateLimite: "dimanche 30 août",
    quandPierre: "🔴 SAMEDI 29 — il quitte Chamonix le 30 à 7h30. Aucun rattrapage possible.",
    ou: [
      { lieu: "Centre Sportif Richard Bozon", note: "LE PLUS MALIN : c'est là qu'il récupère son sac d'allègement. Un déplacement, deux choses réglées.", malin: true },
      { lieu: "Point Information — Place du Triangle de l'Amitié" },
      { lieu: "Point Information — Promenade du Fori, MJC" }
    ],
    interdit: "⛔ Ne JAMAIS la rendre à un bénévole sur le parcours, même en cas d'abandon.",
    sanction: "155 € retenus si elle n'est pas rendue avant le 30/08",
    secours: "Envoi postal à ses frais, Maison UTMB, 31 rue du Lyret à Chamonix, avant le 31/08"
  },
  alerte: "⚠️ METTRE UNE ALARME LE SAMEDI 29. C'est typiquement ce qu'on oublie après 20 h de course."
};

/* ==================== menus, de J-3 au jour J ==================== */

export const MENUS = {
  principe: [
    "Les féculents deviennent la BASE de chaque repas, pas l'accompagnement",
    "Les fibres baissent progressivement dès le MARDI 25 — avancé le 23/08. Plus progressif, donc mieux toléré qu'une coupure brutale la veille.",
    "⛔ Rien de nouveau, rien de gras, rien d'épicé",
    "⚠️ LE PIÈGE : manger PLUS au lieu de manger PLUS GLUCIDIQUE. Ce n'est pas le volume qui monte, c'est la proportion. Sinon on arrive lourd et ballonné."
  ],
  jours: [
    {
      date: "2026-08-25", label: "Mardi 25 · J-3", sous: "📈 la recharge démarre · fibres RÉDUITES · nuit à l'hôtel",
      repas: [
        { moment: "Petit-déj", contenu: "Pain blanc grillé, miel · banane bien mûre · un peu de skyr",
          note: "🔄 Modifié le 23/08 : le porridge d'avoine saute. La recharge démarre aujourd'hui, et l'avoine est l'une des céréales les plus riches en fibres." },
        { moment: "Midi", contenu: "Riz basmati généreux · poulet · courgettes · coulis de tomates" },
        { moment: "Collation", contenu: "Pain d'épices · compote" },
        { moment: "Soir · HÔTEL", contenu: "🍱 Repas préparé à la maison et emporté : riz ou pâtes, poulet ou dinde, coulis de tomates. Réchauffage à la kitchenette.",
          note: "✅ Supprime le seul repas à risque de la semaine. Plus de restaurant inconnu, plus de question persil ou céleri, plus de portion imprévisible." }
      ]
    },
    {
      date: "2026-08-26", label: "Mercredi 26 · J-2", sous: "10 h de trajet · fibres basses",
      alerte: "⚠️ NE SAUTER AUCUN REPAS. C'est le J-2, en pleine recharge. Six prises dans la journée.",
      repas: [
        { moment: "~7h15 · hôtel", contenu: "Petit-déj préparé la veille : pain blanc et miel · banane · café",
          note: "⚠️ Ne pas dépendre du buffet : beaucoup n'ouvrent qu'à 7h et le train part à 7h53." },
        { moment: "9h-9h30 · Eurostar", contenu: "Pain d'épices et compote" },
        { moment: "10h05-12h16 · PARIS", contenu: "🍝 LE VRAI REPAS, assis. Pâtes ou riz et protéine maigre. Ou le repas emporté de la maison, zéro risque.",
          note: "🚶 C'est aussi le meilleur créneau de la journée pour MARCHER. 2h11 de battement." },
        { moment: "13h30-14h · TGV", contenu: "Sandwich pain de mie blanc et dinde · banane" },
        { moment: "15h30 · TGV", contenu: "Compote et barre de céréales simple" },
        { moment: "17h20 · arrivée", contenu: "Banane" },
        { moment: "~19h · appartement", contenu: "🍝 Dîner complet : pâtes ou risotto, protéine maigre. ⛔ Pas de raclette, pas de fondue, pas de resto inconnu." }
      ]
    },
    {
      date: "2026-08-27", label: "Jeudi 27 · J-1", sous: "pic glucidique · fibres QUASI ZÉRO",
      repas: [
        { moment: "Petit-déj", contenu: "Pain blanc, miel ou confiture · banane · compote · café noir" },
        { moment: "Midi · LE GROS REPAS", contenu: "Grosse assiette de pâtes ou de riz BLANC · sauce tomate simple · blanc de poulet. ⛔ Pas de crudités." },
        { moment: "Goûter 16h", contenu: "Banane bien mûre · deux tranches de pain d'épices" },
        { moment: "Dîner 19h · TÔT ET SIMPLE", contenu: "Riz blanc ou pâtes · dinde ou poulet · deux compotes gourde. ⛔ Zéro fibre compliquée." }
      ],
      interdits: ["Légumes crus", "Légumineuses", "Chou", "Plats en sauce", "Fromage fort",
                  "Charcuterie", "Alcool", "Tout produit nouveau",
                  "🔴 ZÉRO APIACÉE : persil, céleri, fenouil, coriandre, aneth, cumin. Lire les étiquettes des soupes et des bouillons."],
      hydratation: "💧 Régulière la journée, COUPURE NETTE après 20h. Ne pas se lever trois fois la nuit."
    },
    {
      date: "2026-08-28", label: "Vendredi 28 · JOUR J", sous: "",
      repas: [
        { moment: "05:20-05:45", contenu: "3 à 4 tranches de pain blanc et miel · 1 banane · 1 compote · CAFÉ NOIR",
          note: "⛔ Pas de lait. ⛔ Pas de gros bol de skyr, la vidange gastrique est trop lente." },
        { moment: "~08:00 · Courmayeur", contenu: "1 banane ou 1 barre de céréales simple · petites gorgées d'eau",
          note: "Le petit-déj sera à 3h30 du départ." }
      ]
    }
  ],
  courses: {
    depuisLaBelgique: ["Pain d'épices", "Miel en dosettes", "Compotes gourdes ×6",
      "Barres de céréales simples ×4", "🥣 LE PETIT-DÉJ COMPLET DU 28",
      "🍱 Repas du mardi soir et petit-déj du mercredi, préparés à l'avance",
      "🍱 Éventuellement le déjeuner du mercredi"],
    aChamonixLe27: ["Pain de mie blanc", "Blanc de poulet ou dinde tranché",
      "Bananes bien mûres ×5", "Riz ou pâtes", "Sauce tomate simple", "Eau plate"]
  },
  sacDuTrain: {
    quand: "🔴 LUNDI OU MARDI. Pierre dort à l'hôtel le 25, RIEN ne doit rester à la maison.",
    contenu: ["2 sandwichs pain de mie blanc et dinde", "Pain d'épices, 4 à 5 tranches",
      "3 compotes gourdes", "2 barres de céréales simples", "2 bananes bien mûres",
      "💧 1,5 L d'eau minimum", "🍴 Couverts et boîte", "☕ Café soluble ou dosettes selon la kitchenette"],
    regle: "⛔ NE JAMAIS compter sur les gares ou les trains. Bar fermé, file d'attente, retard : ça arrive."
  },
  reglesVoyage: [
    "⛔ PAS les Reveal dans le train. 10 h assis, le pied gonfle.",
    "🚶 Debout et marche à chaque arrêt",
    "🚶 15 à 20 min de marche à l'arrivée à Chamonix, AVANT de dîner",
    "💧 Une gorgée toutes les 20 à 30 min, l'air des trains déshydrate",
    "🧦 Chaussettes de compression sur le trajet",
    "💊 Traitement dans le bagage à main, jamais en soute"
  ]
};

/* ==================== les traces GPX pour la montre ==================== */

export const TRACES = {
  pourquoi: "Sans les sommets, l'objectif entre Vallorcine et La Flégère fait 11,4 km : trop long à tenir dans la tête à 2 h du matin. Avec eux, tu ne montes plus vers un ravito mais vers un col. La course se découpe en 13 morceaux au lieu de 9, et le plus long tombe de 16,5 à 11,5 km.",
  fichiers: [
    { nom: "CCC_2026_RAVITOS_SOMMETS.gpx", points: 13,
      quoi: "9 ravitos + 4 sommets", recommande: true },
    { nom: "CCC_2026_RAVITOS.gpx", points: 9, quoi: "les ravitos seuls" }
  ],
  chaquePoint: "Chaque point porte sa consigne en description : Trient « veste avant de s'asseoir », Champex « emporter du salé », Plan de l'Au « pointage seul, pas de ravito ».",
  instructions: [
    "Garmin Connect → Entraînement → Parcours → Importer le GPX → envoyer vers la montre",
    "⚠️ Vérifier que les 13 points apparaissent dans l'aperçu. Sinon, les ajouter à la main dans l'éditeur de parcours.",
    "Écran de données « prochain objectif » : distance au point suivant · ETA au point suivant · heure du jour. Trois champs, une question.",
    "ClimbPro reste actif en parallèle, les deux se complètent",
    "📅 Charger le SAMEDI 22, pas dimanche : une journée de marge si la synchro coince"
  ]
};

/* ==================== physio, semaine du 17 au 20 ==================== */

export const PHYSIO = {
  jours: [
    { j: "Lun 17", sommeil: "7h12 · 86", fc: 45, vfc: 80, bb: 82, readiness: 55 },
    { j: "Mar 18", sommeil: "6h06 · 84", fc: 40, vfc: 88, bb: 94, readiness: 82, bon: true },
    { j: "Mer 19", sommeil: "7h24 · 88", fc: 40, vfc: 80, bb: 94, readiness: 84, bon: true,
      note: "115 min de sommeil profond" },
    { j: "Jeu 20", sommeil: "3h42 · 55", fc: 44, vfc: 71, bb: 68, readiness: 28, mauvais: true },
    { j: "Ven 21", sommeil: "6h06 · 83", fc: 41, vfc: 84, bb: 88, readiness: 70,
      note: "75 min de sommeil profond" },
    { j: "Sam 22", sommeil: "5h48 · 67", fc: 42, vfc: 94, bb: 85, readiness: 67, bon: true,
      note: "🔥 VFC 94 ms : record du dossier. La baseline passe de 62 à 63." },
    { j: "Dim 23", sommeil: "6h36 · 63", fc: 42, vfc: 70, bb: 79, readiness: 55, bon: true,
      note: "🔥 147 min de sommeil profond : record absolu. Le readiness à 55 ne mesure que la fragmentation." }
  ],
  charge: "ACWR 0,7 à 0,8 OPTIMAL · TSB +122 à +214 · MAINTAINING",
  /* Trois nuits hachees d'affilee. Ce n'est pas un signal d'alarme, c'est la
     consequence mecanique d'un TSB tres eleve : moins de charge, moins de
     pression de sommeil. Le corps n'a pas besoin de plus, il dort moins. */
  fragmentation: "⚠️ 82 à 86 min d'éveil par nuit du 21 au 23. Trois causes qui s'additionnent : enfant réveillé, stress pré-course, et un TSB très élevé qui réduit mécaniquement la pression de sommeil.",
  gorge: "🤒 23/08 au réveil : gorge qui gratte, tête lourde. AUCUN marqueur infectieux — FC de repos à 42, VFC équilibrée, Body Battery 79. Explication la plus probable : 147 min de profond, donc bouche ouverte, plus l'anxiété. À réévaluer chaque matin, sans en faire une histoire.",
  lecture: "⚠️ La nuit du 20 : insomnie, endormi à minuit, réveillé un quart d'heure après, impossible de se rendormir. MAIS 81 min de profond sur 3h42, c'est une densité très élevée. VFC toujours au-dessus de la base, FC de repos basse, charge optimale. Le readiness à 28 pénalise uniquement la DURÉE : ne rien construire dessus.",
  causes: "Séance de 18h30 à 19h50 avec FC max 166 · charge mentale jusqu'à 21h · TSB très positif, donc besoin de sommeil réduit · stress pré-course qui monte, normal à J-8.",
  correctifs: [
    "Séance plus tôt en soirée",
    "Coupure des écrans ET des décisions à 21h",
    "Bain chaud 2 à 3 h avant le coucher, pas juste avant"
  ]
};

export default { VERDICT_CHAUSSURES, TROUSSE, VESTE, LAMPES, BALISE, MENUS, TRACES, PHYSIO };
