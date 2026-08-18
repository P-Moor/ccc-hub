// Donnees de course CCC 2026. Contrat de contenu : carnet-ccc.html.
// Recopie du payload valide, aucune donnee inventee.

export const RACE = {
  nom: "CCC by UTMB 2026", dossard: 4330, vague: 2,
  depart: "2026-08-28T09:15:00+02:00",
  distanceKm: 101.5, dplus: 6062,
  barriereFinale: "2026-08-29T12:00:00+02:00",
  nuit: { tombeVers: "20:30", kmEstime: 57.5, lever: "06:45" }
};

// sections[i] = du point i-1 (ou depart) vers .nom
export const SECTIONS = [
  { nom:"Refuge Bertone", km:13.7, cumKm:13.7, dplus:1456, dminus:669, sommet:"Tête de la Tronche 2556 m",
    consigne:"Marche + bâtons dès le km 1 · VAM 450-480 m/h · FC < 145", arret:"express", arretMin:4,
    ravito:"complet", assist:false },
  { nom:"Arnouvaz", km:12.8, cumKm:26.5, dplus:441, dminus:663, sommet:"balcon 2062 m",
    consigne:"Ça roule · manger en marchant", arret:"moyen", arretMin:9,
    ravito:"complet", assist:false },
  { nom:"La Fouly", km:14.4, cumKm:40.9, dplus:863, dminus:1037, sommet:"Grand Col Ferret 2529 m",
    consigne:"Toit de la course · vent possible · veste à portée", arret:"moyen", arretMin:9,
    ravito:"complet", assist:false },
  { nom:"Champex-Lac", km:13.7, cumKm:54.6, dplus:520, dminus:720, sommet:"",
    consigne:"Vallée roulante · relance douce, ne pas courir vite", arret:"grand", arretMin:18, ravito:"base", assist:true,
    todo:["Sac d'allègement","Chaussettes sèches","NOK","Frontale sur la tête","☕ Café n°1","Repas assis"] },
  { nom:"Plan de l'Au", km:4.8, cumKm:59.4, dplus:122, dminus:147, sommet:"",
    consigne:"Frontale allumée · ~20:30 la nuit tombe", arret:"express", arretMin:4,
    ravito:"controle", assist:false },
  { nom:"Trient", km:11.7, cumKm:71.2, dplus:778, dminus:817, sommet:"Bovine 2044 m",
    consigne:"De nuit · rythme régulier · personne ne va vite ici", arret:"grand", arretMin:15, ravito:"complet", assist:false,
    todo:["Soupe chaude","VESTE avant de s'asseoir","☕ Café n°2","Point bas prévu, normal"] },
  { nom:"Vallorcine", km:12.0, cumKm:83.2, dplus:829, dminus:907, sommet:"Catogne 2070 m",
    consigne:"Un pas après l'autre · le mantra sert ici", arret:"moyen", arretMin:9, ravito:"complet", assist:true,
    todo:["☕ Café n°3","Dernier vrai ravito"] },
  { nom:"La Flégère", km:11.4, cumKm:94.6, dplus:969, dminus:376, sommet:"Tête aux Vents 1886 m",
    consigne:"LA plus dure · 2h45 · blocs, de nuit · ELLE EST PRÉVUE. Après elle, c'est fini.",
    arret:"express", arretMin:4, laPlusDure:true, ravito:"eau", assist:false },
  { nom:"Chamonix", km:6.8, cumKm:101.5, dplus:14, dminus:845, sommet:"",
    consigne:"Descente finale · rien à gérer, juste descendre", arret:"arrivee", arretMin:0,
    ravito:"arrivee", assist:false }
];

// horloge = heure d'arrivee au point · marge vs barriere
export const SCENARIO_A = { id:"A", label:"Cible ~20h15", arrets:"1h12",
  rows:[
    { pt:"Bertone",      section:"3h22", horloge:"12:37", barriere:"13:45", marge:"1h08" },
    { pt:"Arnouvaz",     section:"1h47", horloge:"14:28", barriere:"16:30", marge:"2h01" },
    { pt:"La Fouly",     section:"2h29", horloge:"17:06", barriere:"20:15", marge:"3h08" },
    { pt:"Champex",      section:"2h08", horloge:"19:24", barriere:"23:15", marge:"3h50" },
    { pt:"Plan de l'Au", section:"0h42", horloge:"20:24", barriere:"00:15", marge:"3h50" },
    { pt:"Trient",       section:"2h23", horloge:"22:51", barriere:"04:00", marge:"5h08" },
    { pt:"Vallorcine",   section:"2h34", horloge:"01:40", barriere:"07:15", marge:"5h34" },
    { pt:"La Flégère",   section:"2h45", horloge:"04:35", barriere:"10:45", marge:"6h09" },
    { pt:"Chamonix",     section:"0h50", horloge:"05:30", barriere:"12:00", marge:"6h30" }
  ]};

export const SCENARIO_B = { id:"B", label:"Le pied parle ~23h", arrets:"1h42 (3 protocoles pieds)",
  rows:[
    { pt:"Bertone",      horloge:"12:44", marge:"1h00" },
    { pt:"Arnouvaz",     horloge:"14:50", marge:"1h39" },
    { pt:"La Fouly",     horloge:"17:49", marge:"2h25" },
    { pt:"Champex",      horloge:"20:33", marge:"2h41" },
    { pt:"Plan de l'Au", horloge:"21:40", marge:"2h34" },
    { pt:"Trient",       horloge:"00:26", marge:"3h33" },
    { pt:"Vallorcine",   horloge:"03:46", marge:"3h28" },
    { pt:"La Flégère",   horloge:"07:13", marge:"3h31" },
    { pt:"Chamonix",     horloge:"08:15", marge:"3h44" }
  ]};

export const SCENARIO_C = { id:"C", label:"Survie (barrière moins 20 min)",
  rows:[
    { pt:"Bertone", max:"13:25" }, { pt:"Arnouvaz", max:"16:10" },
    { pt:"La Fouly", max:"19:55" }, { pt:"Champex", max:"22:55" },
    { pt:"Plan de l'Au", max:"23:55" }, { pt:"Trient", max:"03:40" },
    { pt:"Vallorcine", max:"06:55" }, { pt:"La Flégère", max:"10:25" },
    { pt:"Chamonix", max:"11:40" }
  ]};

export const SCENARIOS = [SCENARIO_A, SCENARIO_B, SCENARIO_C];

export const NUTRITION = {
  cible: "≈70 g/h · ≈1400 g total",
  regle: "Une prise = manger ET boire, ensemble · alarme Fenix 30 min",
  boisson: "Flasque 1 : Näak Boost 60 concombre (60 g gluc · 500 mg Na / 500 ml) · Flasque 2 : eau (refroidissement + gels) · recharge Ultra Energy aux ravitos (testée ✅)",
  cafeine: [
    { ou:"Départ Champex ~19:45", quoi:"Café n°1" },
    { ou:"Trient ~23:00", quoi:"Café n°2" },
    { ou:"Vallorcine ~01:45", quoi:"Café n°3" },
    { ou:"Réserve ×2", quoi:"Jamais avant Champex" }
  ],
  portage: {
    depart: "7 gels + 3 barres + 2 ziplocks + 2 gels réserve",
    champex: "8 gels dont 5 caféinés + 2 barres + 2 ziplocks"
  },

  // Decoupage lisible des memes donnees, pour l'ecran : deux flasques, trois
  // cafes situes sur le parcours, et ce qu'on porte a chaque depart.
  flasques: [
    { n:"1", quoi:"Näak Boost concombre", d:"60 g de glucides et 500 mg de sodium par 500 ml" },
    { n:"2", quoi:"Eau", d:"Refroidissement, et pour faire passer les gels" }
  ],
  recharge: "Aux ravitos : Näak Ultra Energy, 55 g par 500 ml. Testée ✅",
  cafes: [
    { n:1, ou:"Départ de Champex", h:"~19:45", km:54.6 },
    { n:2, ou:"Trient", h:"~23:00", km:71.2 },
    { n:3, ou:"Vallorcine", h:"~01:45", km:83.2 }
  ],
  cafeRegle: "Jamais avant Champex. Deux gels caféinés en réserve.",
  charge: [
    { q:"Au départ", g:7, b:3, z:2, plus:"2 gels de réserve" },
    { q:"À Champex", g:8, b:2, z:2, plus:"dont 5 caféinés" }
  ]
};

// ============================ PREPA ============================
// Plan jour par jour du 17 au 28 aout. L'affutage vient de la charge reelle
// lue dans Strava (pic a 165 km / 2 488 m fin juillet, sortie longue de
// 25,4 km et 1 195 m le 15/08). A valider par Pierre, ce n'est pas fige.
export const JOURS = [
  { d:"2026-08-16", seance:"Récupération", detail:"8,7 km faits ce matin. La sortie longue d'hier (25,4 km, 1 195 m) était la dernière grosse. À partir de maintenant on ne construit plus, on récupère.",
    faire:[], cle:false },
  { d:"2026-08-17", seance:"Repos", detail:"Ou marche 30 min si tu tournes en rond.",
    faire:[], cle:false },
  { d:"2026-08-18", seance:"8 à 10 km facile", detail:"Terrain souple, FC sous 140. Rien qui pique.",
    faire:[], cle:false },
  { d:"2026-08-19", seance:"Renfo léger + marche 30 min", detail:"Gainage, pas de charge lourde.",
    faire:["Verdict chaussures Reveal"], cle:true },
  { d:"2026-08-20", seance:"12 à 14 km, 400 à 500 m D+", detail:"En config course complète : sac, bâtons, chaussures, flasques. C'est la dernière vraie séance.",
    faire:["Vérification finale du matériel, pièce par pièce","Racheter la nutrition manquante, ici et pas à Chamonix","Rien de nouveau dans l'assiette après aujourd'hui"], cle:true },
  { d:"2026-08-21", seance:"Repos", detail:"Complet. Tu as fait le travail.",
    faire:[], cle:false },
  { d:"2026-08-22", seance:"8 à 10 km + 3 ou 4 côtes courtes", detail:"Côtes en marche-bâtons. Rappel neuromusculaire, surtout pas de la charge.",
    faire:[], cle:false },
  { d:"2026-08-23", seance:"Marche 45 à 60 min", detail:"Dehors, tranquille.",
    faire:[], cle:false },
  { d:"2026-08-24", seance:"6 à 8 km très facile", detail:"Les jambes se souviennent, elles ne travaillent plus.",
    faire:["Glucides à chaque repas, à ta faim, sans compter","Dernier bain chaud"], cle:false },
  { d:"2026-08-25", seance:"Repos", detail:"Jour des sacs.",
    faire:["Préparer le sac de course ET le sac d'allègement","Hydratation régulière toute la journée","Coucher tôt, c'est le levier numéro 1"], cle:true },
  { d:"2026-08-26", seance:"Voyage, marche 20 à 30 min", detail:"Dégourdir les jambes après le train.",
    faire:["Eurostar 9414, Liège-Guillemins 07h53","TGV 9773, Paris-Lyon 12h16 vers Genève 15h36","FlixBus N504, Genève 16h05 vers Chamonix 17h20"], cle:true },
  { d:"2026-08-27", seance:"20 min de footing le matin", detail:"Très léger, juste pour ouvrir.",
    faire:["Retrait du dossard 12h à 14h, Espace Michel Croz","Repas du soir simple, connu, tôt","Tenue posée, alarme + alarme de secours","Coucher tôt, même sans dormir tu te reposes"], cle:true },
  { d:"2026-08-28", seance:"CCC", detail:"Départ 09:15, Courmayeur, vague 2.",
    faire:["Réveil vers 5h30","Petit-déj testé : pain, miel, banane","NOK sur les pieds, chaussettes propres"], cle:true }
];

// Repartition du materiel : le meme objet ne doit pas se retrouver a deux endroits.
export const SAC = [
  { id:'moi', t:"Sur moi en permanence", s:"Contrôlable du départ à l'arrivée", items:[
    "Dossard visible", "Téléphone chargé, 3 pays, numéros de secours enregistrés",
    "Gobelet 15 cl minimum", "Sifflet", "Couverture de survie 1,40 × 2 m",
    "Bande élastique 100 × 6 cm", "Pièce d'identité"
  ]},
  { id:'sac', t:"Dans le sac de course", s:"Ce que tu portes sur 101,5 km", items:[
    "2 frontales + piles de rechange pour chacune",
    "Veste imperméable à capuche, coutures soudées",
    "Seconde couche chaude ≥ 180 g", "Pantalon ou collant long",
    "Sur-pantalon imperméable", "Bonnet", "Gants chauds imperméables",
    "Casquette ou Buff", "Réserve d'eau 1 L minimum, 2 L si kit canicule",
    "2 flasques : Boost concombre + eau",
    "7 gels + 3 barres + 2 ziplocks + 2 gels de réserve",
    "Bâtons Leki + carquois", "Batterie externe + câble",
    "Trousse : traitement, antihistaminique, pansements en curatif, sel"
  ]},
  { id:'champex', t:"Sac d'allègement Champex", s:"Déposé au départ, retrouvé au km 54,6, puis à Chamonix", items:[
    "Chaussettes Injinji sèches", "2ᵉ paire d'Epitact", "NOK en recharge",
    "8 gels dont 5 caféinés + 2 barres + 2 ziplocks",
    "Couche chaude sèche", "Lingettes ou serviette", "Piles de rechange frontale"
  ], interdit:["Bâtons", "Objets de valeur", "Objets fragiles"],
     note:"Le rapatriement peut avoir du retard : rien dedans dont tu aies besoin dans l'heure qui suit l'arrivée." },
  { id:'voyage', t:"Bagage voyage", s:"Reste à Chamonix", items:[
    "Tenue de rechange complète pour l'arrivée", "Chaussures de repos ou claquettes",
    "Vêtements pour 3 à 4 jours", "Nécessaire de toilette",
    "Chargeurs : téléphone, montre, frontale, batterie",
    "Nutrition course complète + nutrition avant et après",
    "Petit-déj du jour J : pain, miel, banane", "Sac plastique pour le linge sale"
  ], note:"Les bâtons Leki ne passent pas en cabine au retour, ils partent en soute." }
];

// Points de passage sans ravitaillement, repris du plan de course du Hub.
// Ils comptent autant que les postes : ce sont les reperes entre deux ravitos.
export const REPERES = [
  { km:9.3,  nom:"Tête de la Tronche", alt:2556, t:"sommet",
    r:"Point haut de la première montée. 1 300 m de D+ d'entrée, sans transition." },
  { km:19.2, nom:"Refuge Bonatti", alt:2025, t:"eau",
    r:"Point d'eau. Sentier balcon en surplomb du val Ferret." },
  { km:30.5, nom:"Grand Col Ferret", alt:2537, t:"col",
    r:"Toit de la course, frontière Italie / Suisse. Aucun ravitaillement, vent possible." },
  { km:65.1, nom:"Bovine", alt:2044, t:"sommet",
    r:"Casse le rythme après Champex. De nuit." },
  { km:77.0, nom:"Catogne", alt:2070, t:"sommet",
    r:"Entre Trient et Vallorcine. Un pas après l'autre." },
  { km:93.7, nom:"Tête aux Vents", alt:1886, t:"sommet",
    r:"Le dernier vrai point haut. Après, c'est fini." }
];

// Catalogue Näak, valeurs relevees sur naak.com le 2026-08-16.
// ATTENTION : la base d'aliments du Hub (backend/foods-database.js) donne 44 g
// pour le gel et 40 g pour la puree. Le fabricant annonce 27 g et 26 g.
// Ce sont les valeurs officielles qui font foi ici, et elles changent le calcul.
export const NAAK = [
  { n:"Ultra Energy Gel", u:"1 gel", g:27, kcal:200, prot:2, na:"420-460 mg",
    note:"35 mg de caféine, parfum chocolat uniquement" },
  { n:"Ultra Energy Bar", u:"1 barre 50 g", g:28, kcal:200, prot:7, na:"405 mg",
    note:"ratio 4:1, servie aux ravitos" },
  { n:"Ultra Energy Waffle", u:"1 gaufre", g:16, kcal:140, prot:3, na:"210 mg",
    note:"servie aux ravitos" },
  { n:"Ultra Energy Purée", u:"1 gourde", g:26, kcal:200, prot:5, na:"160 mg",
    note:"passe quand plus rien ne passe" },
  { n:"Boost Drink Mix 60", u:"1 sachet / 500 ml", g:60, kcal:250, prot:0, na:"500 mg",
    note:"ta flasque 1, concombre salé" },
  { n:"Ultra Drink Mix 250", u:"1 portion / 500 ml", g:55, kcal:250, prot:6, na:"400 mg",
    note:"la recharge servie aux ravitos" }
];
export const NAAK_SOURCE = "Relevé sur naak.com le 16/08/2026";

// Checklist nutrition, au meme titre que celle du matos.
// qte = nombre d'unites, ref = cle du catalogue NAAK pour le calcul des glucides.
export const NAAK_LISTE = [
  { id:'ach', t:"À acheter", s:"TraKKs Rocourt, lundi 17 · liste fermée, zéro poudre", items:[
    { id:'na1', l:"12 gels Ultra Energy", qte:12, ref:0 },
    { id:'na2', l:"5 gels caféinés (chocolat)", qte:5, ref:0, note:"35 mg de caféine chacun" },
    { id:'na3', l:"5 barres Ultra Energy", qte:5, ref:1 },
    { id:'na4', l:"Noter les mg de caféine sur l'étiquette", qte:0 }
  ]},
  { id:'dep', t:"Sur moi au départ", s:"Ce que je porte de Courmayeur à Champex", items:[
    { id:'nd1', l:"7 gels", qte:7, ref:0 },
    { id:'nd2', l:"3 barres", qte:3, ref:1 },
    { id:'nd3', l:"2 ziplocks de Boost concombre", qte:2, ref:4 },
    { id:'nd4', l:"2 gels de réserve", qte:2, ref:0, note:"on n'y touche pas avant Vallorcine" },
    { id:'nd5', l:"Flasque 1 remplie de Boost, flasque 2 d'eau", qte:0 }
  ]},
  { id:'cha', t:"Dans le sac Champex", s:"Récupéré au km 54,6", items:[
    { id:'nc1', l:"8 gels dont 5 caféinés", qte:8, ref:0 },
    { id:'nc2', l:"2 barres", qte:2, ref:1 },
    { id:'nc3', l:"2 ziplocks de Boost concombre", qte:2, ref:4 }
  ]},
  { id:'ctr', t:"Contrôles", s:"À faire avant de fermer le sac", items:[
    { id:'nx1', l:"Vérifier l'absence de céleri sur les étiquettes", qte:0, note:"Apiacées" },
    { id:'nx2', l:"Compter les portions une dernière fois", qte:0 },
    { id:'nx3', l:"Racheter ce qui manque avant le 20/08", qte:0, note:"ici, pas à Chamonix" }
  ]}
];

// Les echeances des 12 derniers jours, pour que l'accueil serve a quelque chose.
export const ECHEANCES = [
  { d:"2026-08-19", t:"Verdict chaussures Reveal", s:"Décision finale, S/Lab Ultra Glide" },
  { d:"2026-08-20", t:"Vérification finale du matériel", s:"Pièce par pièce, liste en main" },
  { d:"2026-08-20", t:"Racheter la nutrition manquante", s:"Ici, pas à Chamonix. Rien de nouveau après cette date." },
  { d:"2026-08-24", t:"Préparation des sacs", s:"Sac de course et sac d'allègement" },
  { d:"2026-08-26", t:"Départ", s:"Eurostar 9414, Liège-Guillemins 07h53" },
  { d:"2026-08-27", t:"Retrait du dossard, 12h à 14h", s:"Espace Michel Croz · pièce d'identité + sac de course" },
  { d:"2026-08-28", t:"CCC, départ 09:15", s:"Courmayeur, vague 2, dossard 4330" }
];

// §6.8 du brief
export const REGLES = [
  { n:1, t:"Marche + bâtons dès le km 1" },
  { n:2, t:"Montée 1 à 450-480 m/h" },
  { n:3, t:"Une prise = manger ET boire · alarme 30 min" },
  { n:4, t:"Douleur osseuse → ralentir, pas abandonner" },
  { n:5, t:"Mal au ravito → chaussures off 10 min, sans négocier" }
];

// Checklists : condense jour J tire de CHECKLIST_MATERIEL_CCC.md (15/08).
// La liste longue (192 items, 9 sections) reste dans checklist-ccc.html,
// le carnet ne garde que ce qui se verifie avant de partir et le jour J.
export const CHECKLIST = [
  { id:'ob', t:"Obligatoire, sur moi", s:"Contrôles au départ, sur le parcours et à l'arrivée", items:[
    { id:'ob1', l:"Téléphone chargé, utilisable en France, Italie et Suisse", s:"Numéros de secours enregistrés · numéro non masqué · allumé" },
    { id:'ob2', l:"Batterie externe + câble" },
    { id:'ob3', l:"Sifflet", s:"Souvent intégré à la bretelle du sac, à vérifier" },
    { id:'ob4', l:"Couverture de survie", s:"1,40 m × 2 m minimum" },
    { id:'ob5', l:"Bande élastique adhésive", s:"100 cm × 6 cm minimum" },
    { id:'ob6', l:"2 frontales en état de marche, mode rouge", s:"Petzl Swift RL 1100 + Petzl Aria 1R RGB, les deux vérifiées" },
    { id:'ob7', l:"Piles ou batteries de rechange pour chaque lampe", s:"À acheter avant le 26" },
    { id:'ob8', l:"Gobelet personnel 15 cl minimum", s:"Beaucoup de gobelets souples font 125 ml, mesure le tien" },
    { id:'ob9', l:"Réserve d'eau, 1 litre minimum" },
    { id:'ob10', l:"Réserve alimentaire" },
    { id:'ob11', l:"Veste imperméable à capuche, coutures soudées", s:"S/Lab Ultra Jacket" },
    { id:'ob12', l:"Pantalon ou collant long" },
    { id:'ob13', l:"Seconde couche chaude manches longues", s:"≥ 180 g, ou 110 g + coupe-vent DWR. Pèse-la." },
    { id:'ob14', l:"Bonnet" },
    { id:'ob15', l:"Casquette, bandana ou Buff" },
    { id:'ob16', l:"Gants chauds et imperméables", s:"Leki Overglove" },
    { id:'ob17', l:"Sur-pantalon imperméable", s:"Scott RC Run WP" },
    { id:'ob18', l:"Pièce d'identité", s:"Obligatoire au retrait du dossard" }
  ]},

  { id:'kt', t:"Kits additionnels", s:"L'organisation annonce le kit activé avant le départ", items:[
    { id:'kt1', l:"Lunettes de soleil", s:"Canicule" },
    { id:'kt2', l:"Casquette saharienne ou couvre-nuque", s:"Canicule · tête ET nuque entièrement couvertes" },
    { id:'kt3', l:"Crème solaire", s:"Canicule" },
    { id:'kt4', l:"Réserve d'eau portée à 2 litres", s:"Canicule · vérifie que le sac peut les porter" },
    { id:'kt5', l:"Lunettes de protection transparentes", s:"Hivernal · des photochromiques couvriraient les deux kits" },
    { id:'kt6', l:"3ᵉ couche chaude, polaire ou doudoune compressible", s:"Hivernal" },
    { id:'kt7', l:"Chaussures de trail robustes et fermées", s:"Hivernal · modèles minimalistes exclus" },
    { id:'kt8', l:"Seconde couche chaude additionnelle", s:"Mauvais temps" }
  ]},

  { id:'cf', t:"Ma config course", s:"Ce que je porte et ce que j'emporte", items:[
    { id:'cf1', l:"S/Lab Ultra Glide Reveal 44⅔", s:"Validée sur 9,9 km, aucun point de pression MTP1" },
    { id:'cf2', l:"Chaussettes Injinji + paire de secours" },
    { id:'cf3', l:"Epitact Epithelium Tact 05" },
    { id:'cf4', l:"NOK Akileïne appliqué avant le départ" },
    { id:'cf5', l:"Sac d'hydratation nettoyé et sec" },
    { id:'cf6', l:"2 flasques + réserve pour atteindre 2 litres" },
    { id:'cf7', l:"Bâtons Leki Ultratrail TR, système Shark, carquois" },
    { id:'cf8', l:"Tenue : short 2-en-1, S/Lab Ultra Seamless, Sense Aero" },
    { id:'cf9', l:"Casquette claire" },
    { id:'cf10', l:"Garmin Fenix 8 chargée à 100 %", s:"GPX et ClimbPro configurés · alarme nutrition 30 min" },
    { id:'cf11', l:"Balise GPS", s:"Remise au retrait du dossard · caution, réf. dans le coffre" },
    { id:'cf12', l:"Trousse : traitement, antihistaminique, pansements en curatif, sel" }
  ]},

  { id:'nu', t:"Nutrition à emporter", s:"Compté pour 1 400 g de glucides, marge comprise", items:[
    { id:'nu1', l:"15 Näak Ultra Energy Gel", s:"7 au départ + 8 dans le sac Champex, dont 5 caféinés · 44 g de gluc chacun, 660 g au total" },
    { id:'nu2', l:"2 gels de réserve", s:"On n'y touche pas avant Vallorcine · 88 g" },
    { id:'nu3', l:"5 Näak Ultra Energy Bar", s:"3 au départ + 2 à Champex · 28 g chacune, 140 g · ratio 4:1" },
    { id:'nu4', l:"4 ziplocks de Näak Boost concombre", s:"2 au départ + 2 à Champex · 1 sachet = 60 g gluc et 500 mg Na par 500 ml, 240 g" },
    { id:'nu5', l:"Compter les portions avant de partir", s:"Course + sac Champex + une marge. Le reste se recharge en Ultra Energy aux ravitos, 55 g par 500 ml." },
    { id:'nu6', l:"Lire les étiquettes : pas de céleri", s:"Apiacées, jusqu'à l'allergologue" },
    { id:'nu7', l:"Racheter ce qui manque avant le 20/08", s:"Ici, pas à Chamonix. Rien de nouveau dans l'assiette après cette date." }
  ]},

  { id:'sc', t:"Sac d'allègement Champex", s:"Déposé au départ à Courmayeur, retrouvé au km 54,6", items:[
    { id:'sc1', l:"Chaussettes Injinji sèches" },
    { id:'sc2', l:"2ᵉ paire d'Epitact" },
    { id:'sc3', l:"NOK Akileïne, recharge" },
    { id:'sc4', l:"Nutrition de secours", s:"8 gels dont 5 caféinés, 2 barres, 2 ziplocks" },
    { id:'sc5', l:"Couche chaude sèche" },
    { id:'sc6', l:"Lingettes ou serviette" },
    { id:'sc7', l:"Piles de rechange frontale" }
  ]},

  { id:'jj', t:"Veille et jour J", s:"Jeudi 27 et vendredi 28", items:[
    { id:'jj1', l:"Retrait du dossard jeudi 12h à 14h", s:"Espace Michel Croz, Chamonix · pièce d'identité obligatoire" },
    { id:'jj2', l:"Assurance rapatriement en PDF sur le téléphone, hors ligne", s:"Vérifier que la période couvre le 28/08" },
    { id:'jj3', l:"Photos des documents dans un album hors ligne" },
    { id:'jj4', l:"Repas du soir simple, connu, tôt", s:"Riz ou pâtes, protéine maigre, peu de fibres" },
    { id:'jj5', l:"Sac de course ET sac d'allègement préparés le soir" },
    { id:'jj6', l:"Tenue posée, prête" },
    { id:'jj7', l:"Alarme + alarme de secours" },
    { id:'jj8', l:"Réveil vers 5h30-6h" },
    { id:'jj9', l:"Petit-déj testé : pain, miel, banane", s:"Pas de gros bol de skyr, vidange gastrique lente" },
    { id:'jj10', l:"NOK sur les pieds, chaussettes propres" }
  ]}
];

// §6.6 : ce qui n'est pas encore tranche, avec sa date de resolution
export const EN_ATTENTE = [
  { l:"Verdict chaussures Reveal", quand:"19/08", s:"Décision finale après la dernière sortie" },
  { l:"Avis médecin pour le jour J", quand:"à caler", s:"Allopurinol et colchicine, posologie du 28" },
  { l:"Antihistaminique non sédatif", quand:"à caler", s:"À faire valider, piste Apiacées" },
  { l:"Dose de caféine par prise", quand:"avant le 25", s:"3 cafés prévus : Champex, Trient, Vallorcine" }
];

// Panic card. Contenu reconstruit a partir des 5 regles, du suivi du pied droit
// (5e metatarsien, IRM du 5 septembre) et des protocoles pieds du scenario B.
// A relire par Pierre : c'est le seul bloc du carnet qui ne vient pas d'un
// document deja valide.
export const PANIC = {
  mantra: "Souffrir ou ralentir. Jamais souffrir ou abandonner.",
  arbre: [
    { n:"vert", t:"Point chaud, ampoule, frottement",
      q:"C'est la peau. Ça se traite et ça ne t'arrêtera pas.",
      a:"Protocole pieds au prochain ravito, puis tu repars." },
    { n:"orange", t:"Douleur diffuse qui monte",
      q:"Muscle, tendon, fatigue. Ça se gère en changeant de rythme, pas en serrant les dents.",
      a:"Foulée plus courte, bâtons, marche les raidillons. Tu réévalues au ravito suivant." },
    { n:"rouge", t:"Douleur osseuse localisée, 5ᵉ métatarsien",
      q:"Elle augmente au repos, ou le pied gonfle.",
      a:"Tu marches, tu ne cours plus. Tu finis en marchant s'il le faut. Ralentir, pas abandonner." }
  ],
  protocole: [
    "S'asseoir. Chaussures ET chaussettes off, sans négocier.",
    "Regarder : point chaud, ampoule, rougeur, gonflement.",
    "Sécher le pied, deux minutes à l'air.",
    "NOK ou Epitact sur les zones qui parlent.",
    "Chaussettes sèches.",
    "Relacer, plus lâche à l'avant-pied si ça gonfle.",
    "Repartir en marchant cinq minutes avant de relancer."
  ]
};

// Alertes visuelles du mode course. Pas de son : declenchees au pointage.
// apres = index du poste qui declenche l'alerte.
export const ALERTES = [
  { apres:3, cle:'front1', icone:"🔦", t:"Frontale sur la tête", d:"La nuit tombe vers 20:30, tu ne repars pas de Champex sans elle." },
  { apres:3, cle:'cafe1',  icone:"☕", t:"Café n°1 maintenant",   d:"Au départ de Champex, vers 19:45." },
  { apres:5, cle:'cafe2',  icone:"☕", t:"Café n°2 maintenant",   d:"Trient, vers 23:00. Veste AVANT de t'asseoir." },
  { apres:6, cle:'cafe3',  icone:"☕", t:"Café n°3 maintenant",   d:"Vallorcine, vers 01:45. Dernier vrai ravito." }
];

// Libelles des modes d'arret
export const ARRETS = {
  express: { l:"Express", c:"express" },
  moyen:   { l:"Moyen",   c:"moyen" },
  grand:   { l:"Grand arrêt", c:"grand" },
  arrivee: { l:"Arrivée",  c:"arrivee" }
};
