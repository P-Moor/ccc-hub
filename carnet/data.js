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
    consigne:"Marche + bâtons dès le km 1 · VAM 450-480 m/h · FC < 145", arret:"express", arretMin:4 },
  { nom:"Arnouvaz", km:12.8, cumKm:26.5, dplus:441, dminus:663, sommet:"balcon 2062 m",
    consigne:"Ça roule · manger en marchant", arret:"moyen", arretMin:9 },
  { nom:"La Fouly", km:14.4, cumKm:40.9, dplus:863, dminus:1037, sommet:"Grand Col Ferret 2529 m",
    consigne:"Toit de la course · vent possible · veste à portée", arret:"moyen", arretMin:9 },
  { nom:"Champex-Lac", km:13.7, cumKm:54.6, dplus:520, dminus:720, sommet:"",
    consigne:"Vallée roulante · relance douce, ne pas courir vite", arret:"grand", arretMin:18,
    todo:["Sac d'allègement","Chaussettes sèches","NOK","Frontale sur la tête","☕ Café n°1","Repas assis"] },
  { nom:"Plan de l'Au", km:4.8, cumKm:59.4, dplus:122, dminus:147, sommet:"",
    consigne:"Frontale allumée · ~20:30 la nuit tombe", arret:"express", arretMin:4 },
  { nom:"Trient", km:11.7, cumKm:71.2, dplus:778, dminus:817, sommet:"Bovine 2044 m",
    consigne:"De nuit · rythme régulier · personne ne va vite ici", arret:"grand", arretMin:15,
    todo:["Soupe chaude","VESTE avant de s'asseoir","☕ Café n°2","Point bas prévu, normal"] },
  { nom:"Vallorcine", km:12.0, cumKm:83.2, dplus:829, dminus:907, sommet:"Catogne 2070 m",
    consigne:"Un pas après l'autre · le mantra sert ici", arret:"moyen", arretMin:9,
    todo:["☕ Café n°3","Dernier vrai ravito"] },
  { nom:"La Flégère", km:11.4, cumKm:94.6, dplus:969, dminus:376, sommet:"Tête aux Vents 1886 m",
    consigne:"LA plus dure · 2h45 · blocs, de nuit · ELLE EST PRÉVUE. Après elle, c'est fini.",
    arret:"express", arretMin:4, laPlusDure:true },
  { nom:"Chamonix", km:6.8, cumKm:101.5, dplus:14, dminus:845, sommet:"",
    consigne:"Descente finale · rien à gérer, juste descendre", arret:"arrivee", arretMin:0 }
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
  }
};

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
    { id:'cf11', l:"Balise GPS", s:"Remise au retrait du dossard · caution reference dans le coffre" },
    { id:'cf12', l:"Trousse : traitement, antihistaminique, pansements en curatif, sel" }
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
