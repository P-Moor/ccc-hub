/**
 * nutrition-data.js — Plan nutrition course CCC 2026
 * ---------------------------------------------------------------------------
 * Sources :
 *   • Contenu des ravitos = PDF OFFICIEL UTMB 2026 « Détail des ravitaillements »
 *     (montblanc.utmb.world → Coureurs → Ravitaillements), lu le 16/08/2026.
 *   • Horaires et durées d'arrêt = scénario A du carnet (data.js).
 *   • Produits portés = validés à l'entraînement par Pierre.
 */

export const NUTRITION = {

  meta: {
    cibleGlucidesParHeure: 70,
    totalEstimeG: 1400,
    dureeCibleH: 20.25,
    regleOr: "Une prise = manger ET boire, ENSEMBLE. Alarme Fenix toutes les 30 min.",
    pourquoi: "Le 15/08 : sous-bu au début, puis l'inverse. Sous-boire tôt ralentit la vidange gastrique — les glucides pris ensuite absorbent moins bien, et ça se paie deux heures plus tard.",
    sourceRavitos: "PDF officiel UTMB 2026, lu le 16/08/2026"
  },

  /* ======================================================================
   * TROIS CORRECTIONS ISSUES DU DOCUMENT OFFICIEL
   * ====================================================================== */
  corrections: [
    {
      id: "boisson",
      avant: "Je pensais que les ravitos servaient de la Näak Ultra Energy (55 g gluc + 8 g protéines + BCAA).",
      apres: "Le document officiel dit : NÄAK BOISSON BOOST SAVEUR NEUTRE. C'est la MÊME gamme que ta Boost 60 concombre — sans protéines, digestion simple.",
      consequence: "Excellente nouvelle : tu peux recharger tes flasques aux ravitos sans changer de famille de produit. Aucun risque digestif nouveau. Tu portes moins de poudre que prévu."
    },
    {
      id: "planau",
      avant: "Plan de l'Au compté comme ravito express.",
      apres: "Plan de l'Au N'APPARAÎT PAS dans la liste officielle des postes CCC (8 postes : Bertone, Arnouvaz, La Fouly, Champex, Trient, Vallorcine, La Flégère, Arrivée). C'est très probablement un POINTAGE SEUL.",
      consequence: "⚠️ Champex → Trient devient 16,5 km / 3h05 SANS ravito, de nuit, avec Bovine dedans. Autonomie complète obligatoire au départ de Champex.",
      aVerifier: "À confirmer sur le carnet de course officiel dès réception."
    },
    {
      id: "remplissage",
      avant: "—",
      apres: "RÈGLE UTMB : pour remplir flasques et poches, l'organisation ne fournit QUE de l'eau plate ou de la boisson énergétique. Coca, café, thé et bouillon se consomment SUR PLACE.",
      consequence: "D'où le gobelet ≥ 15 cl obligatoire. Tout ce qui est chaud ou pétillant = consommé debout au poste, pas emporté."
    }
  ],

  /* ======================================================================
   * CE QUI EST DISPONIBLE SUR TOUS LES POSTES (ou presque)
   * ====================================================================== */
  ravitoStandard: {
    boissons: [
      { nom: "Näak Boisson BOOST saveur NEUTRE", partout: true, pierre: "oui", note: "Même gamme que ta Boost 60 → recharge flasque" },
      { nom: "Eau plate", partout: true, pierre: "oui" },
      { nom: "Yaute Cola", partout: true, pierre: "oui", note: "À partir de Trient · sur place, au gobelet" },
      { nom: "Café soluble Nescafé", partout: true, pierre: "oui", note: "Trient + Vallorcine, sur place" },
      { nom: "Thé Lipton", partout: true, pierre: "oui" },
      { nom: "Eau gazeuse", partout: true, pierre: "non", note: "⛔ ballonnements — cf. dimanche 16" }
    ],
    chaud: [
      { nom: "Bouillon végétal sans gluten", partout: true, pierre: "⚠️ DEMANDER", note: "🔴 Un bouillon de légumes contient presque toujours du CÉLERI (Apiacée). À vérifier auprès du bénévole AVANT de boire." },
      { nom: "Gros vermicelles", partout: "quasi", pierre: "oui", note: "Très digeste, chaud, salé — idéal Trient" },
      { nom: "Riz", partout: "quasi", pierre: "oui" },
      { nom: "Pâtes Torti", partout: "fréquent", pierre: "oui" }
    ],
    sucre: [
      { nom: "Pain d'épice bio au miel", partout: true, pierre: "oui", note: "Ton produit de référence EcoTrail" },
      { nom: "Cake aux fruits", partout: true, pierre: "oui" },
      { nom: "Cookies chocolat", partout: true, pierre: "oui" },
      { nom: "Bananes", partout: true, pierre: "oui", note: "Valeur sûre à chaque poste" },
      { nom: "Pastèque", partout: true, pierre: "oui", note: "Excellent par forte chaleur — eau + sucre" },
      { nom: "Dattes", partout: "quasi", pierre: "oui" },
      { nom: "Sucre en morceaux", partout: true, pierre: "oui" },
      { nom: "Barres céréales avoine & miel", partout: "quasi", pierre: "oui", note: "⚠️ arachides" },
      { nom: "Chocolat noir", partout: "quasi", pierre: "oui" },
      { nom: "Compote pomme/poire", partout: "5 postes", pierre: "oui" },
      { nom: "Näak gaufres (caramel / fruits rouges)", partout: true, pierre: "non", note: "⛔ Choix de Pierre : miettes + écœurement" }
    ],
    sale: [
      { nom: "Pain de boulangerie locale", partout: "quasi", pierre: "oui" },
      { nom: "TUC", partout: true, pierre: "oui", note: "Sel + glucides rapides, passe bien tard" },
      { nom: "Sel", partout: true, pierre: "oui" },
      { nom: "Fromages (Beaufort, Fontina, Raclette, Tomme)", partout: "régional", pierre: "modéré", note: "OK ponctuellement — gras, ralentit la digestion" },
      { nom: "Charcuteries (italienne, suisse, saucisson)", partout: "régional", pierre: "NON", note: "🔴 GOUTTE — purines. Acide urique 6,2-6,3, crise le 10/08." }
    ],
    naak: [
      { nom: "Näak Gel BOOST", partout: "5 postes seulement", pierre: "oui si dispo", note: "⚠️ Ne PAS compter dessus — porte les tiens" },
      { nom: "Näak barres (chocolat-cacahuète / baies-noix)", partout: "7 postes", pierre: "oui si dispo", note: "⚠️ soja, gluten, noix, arachides" }
    ]
  },

  /* ======================================================================
   * PLAN PAR SECTION — quoi porter, quoi consommer, quoi prendre au poste
   * ====================================================================== */
  sections: [
    {
      de: "Courmayeur", vers: "Refuge Bertone", km: 13.7, duree: "3h22", eta: "12:37",
      autonomieRequise: true,
      besoinG: 235,
      porte: "1 flasque Boost 60 · 1 flasque eau · 3 gels · 2 barres",
      apportG: 195,
      enCourant: [
        "Prise 1 (~30 min) : ½ gel + 3 gorgées Boost",
        "Puis alarme 30 min : alterner gel / barre, toujours avec 3-4 gorgées",
        "Eau plate sur la nuque et la casquette dès qu'il fait chaud"
      ],
      alerte: "⚠️ 3h22 sans ravito, c'est la 2e plus longue autonomie de la course. Tu pars avec un petit-déj à 3h30 → viser 55-60 g/h ici est réaliste, pas 70.",
      ravito: {
        nom: "Refuge Bertone", type: "LIQUIDE", duree: "3-5 min", assistance: false,
        surPlace: ["Remplir flasque Boost", "Remplir flasque eau", "1 banane + pain d'épice à emporter"],
        eviter: ["Ne pas s'asseoir", "Pas d'arrêt pieds préventif — ton seuil est au-delà de 25 km"],
        note: "Poste liquide : pas de repas chaud. On remplit et on repart, on mange dans le balcon qui suit."
      }
    },
    {
      de: "Refuge Bertone", vers: "Arnouvaz", km: 12.8, duree: "1h47", eta: "14:28",
      besoinG: 125, porte: "recharge Bertone", apportG: 125,
      enCourant: ["Section roulante : c'est LE moment de manger du solide", "1 gel + 1 barre + ce que tu as pris à Bertone"],
      ravito: {
        nom: "Arnouvaz", type: "SOLIDE (végétarien)", duree: "8-10 min", assistance: false,
        surPlace: ["Remplir Boost + eau", "Salé : pain, TUC, fromage", "Banane / pastèque", "Sel"],
        eviter: ["⛔ Charcuterie (goutte)", "⚠️ Bouillon : demander si céleri"],
        note: "Poste végétarien. Dernier ravito avant le Grand Col Ferret — remplir plein, il fait souvent froid et venteux là-haut."
      }
    },
    {
      de: "Arnouvaz", vers: "La Fouly", km: 14.4, duree: "2h29", eta: "17:06",
      besoinG: 175, porte: "recharge Arnouvaz + 1 gel réserve", apportG: 170,
      enCourant: ["Montée Grand Col Ferret : manger AVANT le col, pas pendant", "Longue descente suisse : boire, ménager les quadriceps"],
      ravito: {
        nom: "La Fouly", type: "SOLIDE", duree: "8-10 min", assistance: false,
        surPlace: ["Remplir Boost + eau", "Premier vrai repas : riz ou pâtes si l'estomac suit", "Pain d'épice, banane"],
        eviter: ["⛔ Charcuterie", "⚠️ Bouillon : demander"],
        note: "Ambiance et bénévoles réputés. Dernier gros poste avant Champex."
      }
    },
    {
      de: "La Fouly", vers: "Champex-Lac", km: 13.7, duree: "2h08", eta: "19:24",
      besoinG: 150, porte: "recharge La Fouly", apportG: 150,
      enCourant: ["Vallée roulante — relance douce, ne pas courir vite ici", "Finir les gels du sac de départ : le réassort est à Champex"],
      ravito: {
        nom: "Champex-Lac", type: "BASE DE VIE — REPAS CHAUD + ASSISTANCE 🎒", duree: "15-20 min", assistance: true,
        surPlace: [
          "🎒 SAC D'ALLÈGEMENT — réassort complet",
          "🍜 Vrai repas assis : pâtes / riz / vermicelles",
          "🆕 2026 : produits asiatiques (nouilles, soupes, brioches)",
          "☕ CAFÉ n°1 (gel caféiné)",
          "🧦 Chaussettes sèches · NOK · frontale sur la tête",
          "Remplir Boost + eau À FOND"
        ],
        eviter: ["⛔ Ne pas dépasser 20 min", "⛔ Charcuterie / raclette (gras + purines avant Bovine)"],
        note: "🔴 POINT LE PLUS IMPORTANT DE LA COURSE. C'est ici que la 2e moitié se prépare."
      }
    },
    {
      de: "Champex-Lac", vers: "Trient", km: 16.5, duree: "3h05", eta: "22:51",
      autonomieRequise: true, viaPointage: "Plan de l'Au (pointage seul, PAS de ravito)",
      besoinG: 215, porte: "1 flasque Boost + 1 eau · 3 gels dont 1 caféiné · 1 barre", apportG: 175,
      enCourant: [
        "🌙 La nuit tombe vers 20:30 dans cette section",
        "Café n°1 pris au départ de Champex, il agit dans Bovine",
        "Montée de Bovine : manger avant, pas dans la pente raide",
        "Descente technique sur Trient : racines, prudence de nuit"
      ],
      alerte: "🔴 LA PLUS LONGUE AUTONOMIE DE LA COURSE — 3h05 sans ravito, de nuit. Partir de Champex avec TOUT. Si tu oublies quelque chose ici, tu le paies pendant 3 heures.",
      ravito: {
        nom: "Trient", type: "SOLIDE", duree: "15 min", assistance: false,
        surPlace: [
          "🧥 VESTE CHAUDE AVANT DE S'ASSEOIR — non négociable",
          "🍜 Vermicelles ou riz chaud",
          "☕ CAFÉ n°2 (gel caféiné) + café/coca au gobelet",
          "Remplir Boost + eau à fond"
        ],
        eviter: ["⛔ Ne pas dépasser 15 min : muscles froids + température qui chute", "⛔ Charcuterie"],
        note: "🧠 POINT BAS PRÉVU — c'est normal, c'était écrit. Le mantra sert ici."
      }
    },
    {
      de: "Trient", vers: "Vallorcine", km: 12.0, duree: "2h34", eta: "01:40",
      besoinG: 180, porte: "recharge Trient", apportG: 180,
      enCourant: ["Montée des Tseppes / Catogne : très raide au début, s'adoucit", "Descente rapide sur Vallorcine — piste large puis forêt technique"],
      ravito: {
        nom: "Vallorcine", type: "SOLIDE + ASSISTANCE", duree: "8-10 min", assistance: true,
        surPlace: ["☕ CAFÉ n°3 (gel caféiné) + coca au gobelet", "Chaud si l'estomac suit", "Remplir Boost + eau"],
        eviter: ["⛔ Ne pas s'installer — la dernière montée attend"],
        note: "Dernier vrai ravito. Après : la section la plus dure de la course."
      }
    },
    {
      de: "Vallorcine", vers: "La Flégère", km: 11.4, duree: "2h45", eta: "04:35",
      besoinG: 190, porte: "recharge Vallorcine + réserve", apportG: 190,
      enCourant: [
        "🔴 LA SECTION LA PLUS DURE : +969 m, blocs, de nuit, après 16h de course",
        "Manger régulièrement même sans faim — c'est là que les gens craquent",
        "ELLE EST PRÉVUE. 2h45. Après elle, c'est fini."
      ],
      ravito: {
        nom: "La Flégère", type: "LIQUIDE", duree: "3-5 min", assistance: false,
        surPlace: ["Coca ou café au gobelet", "1 chose sucrée", "Pas besoin de remplir à fond : 6,8 km restants"],
        eviter: ["⛔ Ne pas traîner — il ne reste qu'une descente"],
        note: "Dernier pointage. Rien à gérer, juste descendre."
      }
    },
    {
      de: "La Flégère", vers: "Chamonix", km: 6.8, duree: "0h50", eta: "05:30",
      besoinG: 60, porte: "ce qu'il reste", apportG: 60,
      enCourant: ["−845 m de descente finale · quadriceps · rien à manger si l'estomac refuse"],
      ravito: { nom: "🏁 ARRIVÉE CHAMONIX", type: "ARRIVÉE", duree: "—", assistance: true,
        surPlace: ["Se couvrir IMMÉDIATEMENT", "Boire", "Glucides + protéines, ce qui passe", "Récupérer le sac d'allègement"], eviter: [], note: "" }
    }
  ],

  // Inventaire reel au 18/08. Rien a acheter : la liste est fermee.
  stock: {
    statut: "FERMÉ — rien à acheter",
    totalUnites: 29,
    totalGlucidesG: 974,
    items: [
      { id:"st1", nom:"Näak Boost Ice Mint",        qte:9, glucides:30, cafeine:0,   note:"Menthol, sensation de frais, idéal montée du matin. ⛔ pas la nuit (effet froid)" },
      { id:"st2", nom:"Näak Boost Neutral",         qte:4, glucides:30, cafeine:0,   note:"Carte anti-écœurement : passe quand l'aromatisé bloque. 1 dans chaque sac" },
      { id:"st3", nom:"Näak Boost Peach Tea",       qte:4, glucides:30, cafeine:100 },
      { id:"st4", nom:"Näak Ultra Energy Chocolat", qte:3, glucides:45, cafeine:35 },
      { id:"st5", nom:"Näak Ultra Energy Salted Maple", qte:2, glucides:45, cafeine:0 },
      { id:"st6", nom:"Näak Purée Banane-Poire",    qte:2, glucides:27, cafeine:0 },
      { id:"st7", nom:"Näak Barre Peanut Butter",   qte:2, glucides:25, cafeine:0 },
      { id:"st8", nom:"Näak Barre Caramel Macchiato", qte:3, glucides:25, cafeine:65, note:"⚠️ CAFÉINÉE — ressemble à une barre normale, facile à confondre la nuit" },
      { id:"st9", nom:"Baouw Gel Abricot-Thym",     qte:1, glucides:30, cafeine:0,   note:"2-en-1 diluable — peut aromatiser une flasque d'eau" },
      { id:"st10", nom:"Baouw Purée Patate douce-Carotte-Poivre Timut", qte:1, glucides:25, cafeine:0, note:"🍠 SALÉ — le produit préféré de Pierre. Carte anti-écœurement de fin de course. Sac de Champex" }
    ]
  },

  // Le sucre est porte, le sale vient des ravitos. Le trou est entre les deux.
  sucreSale: {
    principe: "Tu portes le SUCRÉ (Näak) et tu comptes sur les ravitos de l'organisation pour le SALÉ. Tu ne tiendras pas 20 h uniquement au sucre.",
    trou: "⚠️ Champex → Trient : 16,5 km, 3h05, AUCUN ravito. L'écœurement du sucré arrive typiquement entre la 11ᵉ et la 14ᵉ heure, c'est-à-dire précisément dans cette section, de nuit.",
    action: "➜ EMPORTER DU SALÉ AU DÉPART DE CHAMPEX : pain, TUC, fromage dans un sachet. 50 g qui peuvent sauver trois heures.",
    action2: "➜ La purée Baouw patate douce est là pour ça, pas « au cas où »."
  },

  repartition: {
    depart: { label:"Sac de départ · 11 h · zéro caféine",
      contenu:["7 Ice Mint","2 Neutral","2 Salted Maple","2 purées Banane-Poire","1 barre Peanut Butter","1 gel Baouw Abricot-Thym"] },
    champex: { label:"Sac de Champex · 9 h de nuit",
      contenu:["3 Ultra Chocolat ☕","4 Peach Tea ☕","3 Caramel Macchiato ☕","2 Ice Mint","2 Neutral","1 barre Peanut Butter","1 purée Baouw patate douce","+ le salé pris sur place"] }
  },

  /* ====================================================================== */
  cafeine: [
    { n:1, ou:"Départ Champex", quand:"~19:45", produit:"Ultra Energy Chocolat", mg:35,  pourquoi:"Avant la nuit, avant Bovine" },
    { n:2, ou:"Trient",         quand:"~23:00", produit:"Boost Peach Tea",       mg:100, pourquoi:"Le point bas prévu" },
    { n:3, ou:"Vallorcine",     quand:"~01:45", produit:"Boost Peach Tea",       mg:100, pourquoi:"Avant la Tête aux Vents" },
    { n:4, ou:"Avant Tête aux Vents", quand:"~02:30", produit:"Barre Caramel Macchiato", mg:65, pourquoi:"La section la plus dure" },
    { n:"R", ou:"Réserve",      quand:"coup de mou imprévu", produit:"2 Peach Tea + 2 Caramel Macchiato", mg:0,
      pourquoi:"⛔ JAMAIS avant Champex — elle ne marche que si tu ne l'as pas gaspillée de jour" }
  ],
  cafeineTotal: "~300 mg répartis sur 7 h",
  cafeineRegles: [
    "⛔ ZÉRO caféine avant Champex — elle ne marche que si elle n'a pas été gaspillée de jour",
    "⛔ Espacer d'au moins 2 h — deux Peach Tea coup sur coup font 200 mg",
    "📦 Séparer visuellement les caféinés (sachet distinct ou marqueur) : illisible à la frontale à 3 h"
  ],

  portage: {
    flasques: "2 × 500 ml + 1 souple de secours. Flasque 1 = Näak Boost 60 concombre · Flasque 2 = eau (refroidissement nuque/casquette + faire passer les gels).",
    sacDepart: {
      label: "Courmayeur → Champex (~11h)",
      contenu: ["7 gels classiques", "3 barres", "2 mini-ziplocks Boost (3 cuillères = 1 flasque)", "+2 gels de réserve"]
    },
    sacChampex: {
      label: "Champex → arrivée (~9h)",
      contenu: ["8 gels dont les 5 CAFÉINÉS", "2 barres", "2 mini-ziplocks Boost", "Chaussettes sèches", "NOK recharge", "Couche chaude sèche", "Piles frontale", "Lingettes"]
    },
    note: "La caféine vit dans le sac de Champex — elle ne sert qu'à la nuit."
  },

  /* ====================================================================== */
  listeAchat: {
    trakks: [
      { id: "na1", txt: "12 gels Näak Boost classiques", detail: "Menthe en priorité · panacher 2-3 goûts contre l'écœurement" },
      { id: "na2", txt: "5 gels Näak Boost CAFÉINÉS", detail: "⚠️ Noter les mg/gel sur l'étiquette → renseigner cafeineMgParGel" },
      { id: "na3", txt: "5 barres Näak Ultra Energy", detail: "Goûts connus · ⛔ PAS de gaufres (miettes)" },
      { id: "na4", txt: "Poudre : RIEN", detail: "Le gros sac Boost concombre suffit — et les ravitos servent la même gamme" }
    ],
    maison: [
      { id: "nm1", txt: "4 mini-ziplocks de Boost concombre pré-pesés", detail: "3 cuillères = 1 flasque de 500 ml" },
      { id: "nm2", txt: "Gobelet ≥ 15 cl vérifié au mètre", detail: "🔴 obligatoire · beaucoup font 125 ml" },
      { id: "nm3", txt: "Petit-déj du 28 emporté de Belgique", detail: "Pain d'épices, miel dosettes, compotes gourdes" }
    ],
    budget: "~65-70 € · l'avoir TraKKs en absorbe une partie",
    regle: "⛔ LA LISTE EST FERMÉE. Tu entres, tu prends ça, tu sors."
  },

  /* ====================================================================== */
  alertes: [
    {
      niveau: "critique", icone: "🥬", titre: "Le bouillon végétal — Apiacées",
      texte: "Le bouillon végétal est servi sur TOUS les postes. Un bouillon de légumes contient presque toujours du CÉLERI. Pierre est à zéro épisode d'urticaire depuis l'éviction des Apiacées (piste persil). ➜ DEMANDER au bénévole avant de boire. En cas de doute : vermicelles ou riz à la place."
    },
    {
      niveau: "critique", icone: "🍖", titre: "Charcuteries et fromages gras — goutte",
      texte: "Charcuterie italienne, suisse, saucisson, raclette : purines. Acide urique à 6,2-6,3 (au-dessus de la cible), crise de goutte le 10/08. ➜ ZÉRO charcuterie. Fromage : ponctuel et modéré."
    },
    {
      niveau: "info", icone: "🫧", titre: "Eau gazeuse",
      texte: "Disponible partout. ⛔ À éviter : épisode de ballonnement documenté le 16/08 après deux canettes gazeuses sur estomac ralenti. Eau plate uniquement."
    },
    {
      niveau: "info", icone: "🧊", titre: "Remplissage des contenants",
      texte: "L'organisation ne remplit QUE avec de l'eau plate ou de la boisson énergétique. Coca, café, thé, bouillon : au gobelet, sur place, debout."
    }
  ],

  reglesAbsolues: [
    "Une prise = manger ET boire, ensemble. Alarme 30 min.",
    "Rien de neuf le jour J : uniquement du Näak testé.",
    "Refroidissement nuque / casquette à chaque point d'eau (validé km 21 le 15/08).",
    "Boire à sa soif + électrolytes — PAS « le plus possible » : le gonflement du pied suit l'apport hydrique.",
    "Zéro alcool, zéro eau gazeuse, zéro charcuterie, zéro bouillon non vérifié."
  ]
};

export default NUTRITION;
