// Donnees de course CCC 2026. Contrat de contenu : carnet-ccc.html.
// Recopie du payload valide, aucune donnee inventee.

export const RACE = {
  nom: "CCC by UTMB 2026", dossard: 4330, vague: 2,
  depart: "2026-08-28T09:15:00+02:00",
  distanceKm: 108.8, dplus: 6400,
  barriereFinale: "2026-08-29T12:00:00+02:00",
  // La nuit tombe pile a l'entree de la descente sur Martigny : 4 km pour
  // -604 m, le passage le plus expose pour le 5e metatarsien, et il se fait
  // desormais dans le noir. Batons, cadence haute, pas de freinage talon.
  nuit: { tombeVers: "20:30", kmEstime: 60.5, lever: "06:45" },
  // Parcours modifie le 27/08 : Bovine supprime, remplace par Martigny.
  modifie: { le: "27/08", avantKm: 100.9, avantDplus: 6050, avantCible: "20h15",
             quoi: "Bovine supprimé → descente sur Martigny (507 m) puis remontée complète sur Trient." }
};

// sections[i] = du point i-1 (ou depart) vers .nom
export const SECTIONS = [
  { nom:"Refuge Bertone", km:13.6, cumKm:13.6, dplus:1436, dminus:676, sommet:"Tête de la Tronche 2543 m",
    consigne:"Marche + bâtons dès le km 1 · VAM 450-480 m/h · FC < 145", arret:"express", arretMin:4,
    ravito:"complet", assist:false },
  { nom:"Arnouvaz", km:12.7, cumKm:26.3, dplus:469, dminus:673, sommet:"Refuge Bonatti 2027 m",
    consigne:"Ça roule · manger en marchant", arret:"moyen", arretMin:9,
    ravito:"complet", assist:false },
  { nom:"La Fouly", km:14.4, cumKm:40.7, dplus:865, dminus:1037, sommet:"Grand Col Ferret 2527 m",
    consigne:"Toit de la course · vent possible · veste à portée", arret:"moyen", arretMin:9,
    ravito:"complet", assist:false },
  { nom:"Champex-Lac", km:13.5, cumKm:54.2, dplus:516, dminus:648, sommet:"",
    consigne:"Vallée roulante · relance douce, ne pas courir vite", arret:"grand", arretMin:18, ravito:"base", assist:true,
    todo:["Sac d'allègement","Chaussettes sèches","NOK","Frontale sur la tête","☕ Café n°1","Repas assis"] },
  { nom:"Plan de l'Au", km:4.9, cumKm:59.1, dplus:74, dminus:208, sommet:"",
    consigne:"Frontale allumée · ~20:30 la nuit tombe · la descente qui suit est LE passage à risque pour le pied",
    arret:"express", arretMin:4, ravito:"controle", assist:false },
  { nom:"Martigny", km:10.1, cumKm:69.2, dplus:163, dminus:996, sommet:"", nouveau:true,
    consigne:"Descente de 604 m sur 4 km puis vallée roulante · bâtons, cadence 84-88, pas de freinage talon",
    arret:"moyen", arretMin:9, ravito:"complet", assist:false,
    todo:["☕ Café 65 mg AVANT la remontée","Salé si disponible","Point bas de la course : 507 m"] },
  { nom:"Trient", km:10.1, cumKm:79.3, dplus:1082, dminus:286, sommet:"",
    consigne:"Remontée de 1 082 m à 10,7 % de moyenne · marche efficace aux bâtons, pas de l'escalade · FC < 145",
    arret:"grand", arretMin:15, ravito:"complet", assist:false,
    todo:["Soupe chaude","VESTE avant de s'asseoir","☕ Café 100 mg","Point bas prévu, normal"] },
  { nom:"Vallorcine", km:11.1, cumKm:90.4, dplus:807, dminus:853, sommet:"Les Tseppes 1936 m",
    consigne:"Un pas après l'autre · le mantra sert ici · ⚠️ barrière inchangée, marge divisée par deux",
    arret:"moyen", arretMin:9, ravito:"complet", assist:true,
    todo:["☕ Café 100 mg","Dernier vrai ravito"] },
  { nom:"La Flégère", km:11.2, cumKm:101.6, dplus:966, dminus:342, sommet:"",
    consigne:"LA plus dure · 2h45 · blocs, de nuit · ELLE EST PRÉVUE. Après elle, c'est fini.",
    arret:"express", arretMin:4, laPlusDure:true, ravito:"eau", assist:false },
  { nom:"Chamonix", km:7.2, cumKm:108.8, dplus:21, dminus:866, sommet:"",
    consigne:"Descente finale · rien à gérer, juste descendre", arret:"arrivee", arretMin:0,
    ravito:"arrivee", assist:false }
];

// horloge = heure d'arrivee au point · marge vs barriere
export const SCENARIO_A = { id:"A", label:"Cible ~22h25", arrets:"1h21",
  rows:[
    { pt:"Bertone",      section:"3h22", horloge:"12:37", barriere:"13:45", marge:"1h08" },
    { pt:"Arnouvaz",     section:"1h51", horloge:"14:28", barriere:"16:30", marge:"2h02" },
    { pt:"La Fouly",     section:"2h38", horloge:"17:06", barriere:"20:15", marge:"3h09" },
    { pt:"Champex",      section:"2h18", horloge:"19:24", barriere:"23:15", marge:"3h51" },
    { pt:"Plan de l'Au", section:"1h00", horloge:"20:24", barriere:"00:15", marge:"3h51" },
    { pt:"Martigny",     section:"1h36", horloge:"22:00", barriere:"02:15", marge:"4h15", nouveau:true },
    { pt:"Trient",       section:"3h00", horloge:"01:00", barriere:"06:00", marge:"5h00" },
    { pt:"Vallorcine",   section:"2h50", horloge:"03:50", barriere:"07:15", marge:"3h25", retrecie:"5h35" },
    { pt:"La Flégère",   section:"2h55", horloge:"06:45", barriere:"10:45", marge:"4h00", retrecie:"6h10" },
    { pt:"Chamonix",     section:"0h55", horloge:"07:40", barriere:"12:00", marge:"4h20", retrecie:"6h30" }
  ]};

// Recalcule sur le parcours modifie. On applique la MEME degradation relative
// qu'avant — l'ancien scenario B perdait 13,6 % sur la cible — au nouveau
// temps de 22h25, ce qui donne 25h28.
//
// ⚠️ CE QUE CE RECALCUL REVELE, ET QUI EST NEUF : si le pied parle, le point
// de coupe n'est plus seulement Bertone. VALLORCINE le devient, avec 54 min
// de marge, a 06:21 le samedi matin. Avant la modification ce point offrait
// 3h28 et ne faisait courir aucun risque. La barriere n'a pas bouge, mais on
// y arrive 2h30 plus tard.
export const SCENARIO_B = { id:"B", label:"Le pied parle ~25h30", arrets:"1h55 (3 protocoles pieds)",
  rows:[
    { pt:"Bertone",      horloge:"13:04", marge:"0h41", serre:true },
    { pt:"Arnouvaz",     horloge:"15:11", marge:"1h19" },
    { pt:"La Fouly",     horloge:"18:10", marge:"2h05" },
    { pt:"Champex",      horloge:"20:47", marge:"2h28" },
    { pt:"Plan de l'Au", horloge:"21:55", marge:"2h20" },
    { pt:"Martigny",     horloge:"23:44", marge:"2h31" },
    { pt:"Trient",       horloge:"03:08", marge:"2h52" },
    { pt:"Vallorcine",   horloge:"06:21", marge:"0h54", serre:true },
    { pt:"La Flégère",   horloge:"09:40", marge:"1h05" },
    { pt:"Chamonix",     horloge:"10:43", marge:"1h17" }
  ]};

export const SCENARIO_C = { id:"C", label:"Survie (barrière moins 20 min)",
  rows:[
    { pt:"Bertone", max:"13:25" }, { pt:"Arnouvaz", max:"16:10" },
    { pt:"La Fouly", max:"19:55" }, { pt:"Champex", max:"22:55" },
    { pt:"Plan de l'Au", max:"23:55" }, { pt:"Martigny", max:"01:55" },
    { pt:"Trient", max:"05:40" }, { pt:"Vallorcine", max:"06:55" },
    { pt:"La Flégère", max:"10:25" }, { pt:"Chamonix", max:"11:40" }
  ]};

export const SCENARIOS = [SCENARIO_A, SCENARIO_B, SCENARIO_C];

export const NUTRITION = {
  cible: "≈70 g/h · ≈1570 g total (22h25)",
  unites: { total: 32, avant: 29, aSortir: 3,
            ou: "Les 3 unités supplémentaires se répartissent entre Champex et Trient : 5h35 de course sur ce tronçon, deux ravitos seulement." },
  regle: "Une prise = manger ET boire, ensemble · alarme Fenix 30 min",
  boisson: "Flasque 1 : Näak Boost 60 concombre (60 g gluc · 500 mg Na / 500 ml) · Flasque 2 : eau (refroidissement + gels) · recharge Ultra Energy aux ravitos (testée ✅)",
  // Nouveau schema du 27/08 : la nuit s'allonge d'environ 2 h et un point
  // d'appui s'ajoute a Martigny, juste AVANT la remontee de 1 082 m.
  cafeine: [
    { ou:"Champex 19:24", quoi:"35 mg — amorçage avant la tombée du jour" },
    { ou:"Martigny 22:00", quoi:"65 mg — AVANT la remontée de 1 082 m" },
    { ou:"Trient 01:00", quoi:"100 mg — creux nocturne" },
    { ou:"Vallorcine 03:50", quoi:"100 mg — dernier bloc + Tête aux Vents" }
  ],
  cafeineTotal: "300 mg",
  portage: {
    depart: "7 gels + 3 barres + 2 ziplocks + 2 gels réserve",
    champex: "11 gels dont 5 caféinés + 2 barres + 2 ziplocks — 3 unités de plus qu'au plan initial"
  },

  // Decoupage lisible des memes donnees, pour l'ecran : deux flasques, trois
  // cafes situes sur le parcours, et ce qu'on porte a chaque depart.
  flasques: [
    { n:"1", quoi:"Näak Boost concombre", d:"60 g de glucides et 500 mg de sodium par 500 ml" },
    { n:"2", quoi:"Eau", d:"Refroidissement, et pour faire passer les gels" }
  ],
  recharge: "Aux ravitos : Näak Ultra Energy, 55 g par 500 ml. Testée ✅",
  cafes: [
    { n:1, ou:"Champex", h:"19:24", km:54.2, mg:35 },
    { n:2, ou:"Martigny", h:"22:00", km:69.2, mg:65, nouveau:true },
    { n:3, ou:"Trient", h:"01:00", km:79.3, mg:100 },
    { n:4, ou:"Vallorcine", h:"03:50", km:90.4, mg:100 }
  ],
  cafeRegle: "Jamais avant Champex. 300 mg au total, réparti sur quatre prises.",
  charge: [
    { q:"Au départ", g:7, b:3, z:2, plus:"2 gels de réserve" },
    { q:"À Champex", g:11, b:2, z:2, plus:"dont 5 caféinés · +3 unités vs plan initial" }
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
  { id:'sac', t:"Dans le sac de course", s:"Ce que tu portes sur 108,8 km", items:[
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
    "Chaussettes Sidas Trail PROTECT sèches", "2ᵉ paire d'Epitact", "NOK en recharge",
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
/* Les sommets nommes, entre les postes. Refaits le 24/08 sur le GPX officiel,
   puis le 27/08 sur le parcours modifie.
   Le travail de nomenclature du 24/08 tenait a ce que deux sommets portaient
   un nom qui n'etait pas le leur : « Bovine » etait en realite LA GIETE, et
   « Catogne » LES TSEPPES. La modification du 27/08 a tranche la premiere
   question toute seule — LA GIETE NE FIGURE PLUS AU PARCOURS, la course
   descend sur Martigny a la place. Reste Les Tseppes, dont le nom compte
   toujours : c'est ce qui est ecrit sur les panneaux. */
export const REPERES = [
  { km:9.4,  nom:"Tête de la Tronche", alt:2543, t:"sommet",
    r:"Point haut de la première montée. +1 418 m sur 9,4 km, sans transition. VAM 450-480." },
  { km:21.2, nom:"Refuge Bonatti", alt:2027, t:"eau",
    r:"Point d'eau. Sentier balcon roulant en surplomb du val Ferret — c'est là qu'on mange en marchant." },
  { km:30.9, nom:"Grand Col Ferret", alt:2527, t:"col",
    r:"Toit de la course, frontière Italie / Suisse. +762 m sur 4,5 km. Aucun ravitaillement, vent probable : veste à portée AVANT la montée." },
  { km:69.2, nom:"Martigny", alt:507, t:"ravito",
    r:"🆕 Le point bas de la course, 507 m — La Giète et Bovine ont disparu du parcours le 27/08. On y descend 604 m en 4 km de nuit, puis on remonte 1 082 m sur 10,1 km. C'est long, mais c'est à 10,7 % de moyenne : de la marche aux bâtons, pas de l'escalade." },
  { km:83.1, nom:"Les Tseppes", alt:1936, t:"sommet",
    r:"🔴 +647 m sur 3,8 km, soit 17 % de pente moyenne : LA PLUS RAIDE DE LA COURSE, et elle tombe vers 23 h. Un pas après l'autre, bâtons courts." }
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
    { id:'ob6', l:"2 frontales en état de marche, mode rouge", s:"2 × Petzl Swift RL 1100 · batterie de rechange commune aux deux" },
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
    { id:'cf2', l:"Chaussettes Sidas Trail DOUBLE aux pieds", s:"1 paire Trail Protect en secours dans le sac" },
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
    { id:'sc1', l:"Chaussettes Sidas Trail PROTECT sèches" },
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
  { apres:3, cle:'cafe1',  icone:"☕", t:"Caféine 35 mg",  d:"Au départ de Champex, vers 19:24. Amorçage avant la tombée du jour." },
  { apres:4, cle:'pied1',  icone:"🦶", t:"Descente à risque", d:"4 km pour −604 m jusqu'à la vallée, de nuit. Bâtons, cadence 84-88, ne pas freiner sur les talons." },
  { apres:5, cle:'cafe2',  icone:"☕", t:"Caféine 65 mg",  d:"Martigny, vers 22:00. AVANT la remontée de 1 082 m, pas après." },
  { apres:6, cle:'cafe3',  icone:"☕", t:"Caféine 100 mg", d:"Trient, vers 01:00. Veste AVANT de t'asseoir." },
  { apres:7, cle:'cafe4',  icone:"☕", t:"Caféine 100 mg", d:"Vallorcine, vers 03:50. Dernier vrai ravito." },
  { apres:7, cle:'barr1',  icone:"⛔", t:"Ta marge a fondu ici", d:"Vallorcine garde sa barrière de 07:15 alors que tu y arrives 2h10 plus tard : 3h25 au lieu de 5h35. Ne traîne pas." }
];

// Libelles des modes d'arret
export const ARRETS = {
  express: { l:"Express", c:"express" },
  moyen:   { l:"Moyen",   c:"moyen" },
  grand:   { l:"Grand arrêt", c:"grand" },
  arrivee: { l:"Arrivée",  c:"arrivee" }
};
