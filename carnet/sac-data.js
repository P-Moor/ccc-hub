/**
 * sac-data.js — Checklist matériel CCC 2026
 * ---------------------------------------------------------------------------
 * Remplace la page « Le sac » actuelle, qui est une liste de LECTURE.
 * Ici : une vraie checklist, cochable, hiérarchisée, séquencée dans le temps.
 *
 * Erreurs corrigées par rapport à la version precedente :
 *   Chaussettes BV Sport Trail Ultra 2 Mid, validees le 15/08 sur 25,4 km,
 *   et non les Injinji. L'Epitact n'est PAS valide (teste le 08/08 dans une
 *   chaussure disqualifiee, pire brulure du dossier) : optionnel conditionnel.
 *   Ajoutes : chaussures, montre, reserve alimentaire, balise GPS, epingles,
 *   kit canicule, tenue, documents hors ligne.
 */

export const SAC = {

  meta: {
    course: "CCC 2026 · dossard 4330",
    avertissement: "⚠️ À recouper avec l'image officielle du matériel obligatoire 2026 : montblanc.utmb.world → Coureurs → Matériel obligatoire. Les quantités CCC peuvent différer de l'UTMB.",
    reglement2026: "Plus de kit chaud / kit froid figés : l'organisation active une liste additionnelle avant le départ.",
    phases: [
      { id: "achat",  label: "Acheter",        date: "2026-08-17", note: "TraKKs + pharmacie" },
      { id: "verif",  label: "Vérifier",       date: "2026-08-20", note: "Pièce par pièce, liste en main" },
      { id: "sacs",   label: "Boucler les sacs", date: "2026-08-25", note: "Sac de course pesé" },
      { id: "veille", label: "La veille",      date: "2026-08-27", note: "Après le retrait du dossard" },
      { id: "matin",  label: "Le matin",       date: "2026-08-28", note: "Avant de partir à la navette" }
    ],
    zones: [
      { id: "surmoi",     label: "Sur moi en permanence", sub: "Contrôlable du départ à l'arrivée" },
      { id: "sac",        label: "Dans le sac de course", sub: "Ce que tu portes sur 101,5 km" },
      { id: "allegement", label: "Sac d'allègement Champex", sub: "Remis au retrait du dossard · retrouvé au km 54,6" },
      { id: "bagage",     label: "Bagage voyage", sub: "Reste à Chamonix" }
    ]
  },

  items: [
    { id:"s01", zone:"surmoi", crit:"reglementaire", phase:"matin", txt:"Dossard visible sur la poitrine ou le ventre", detail:"+ épingles · puce sur le sac · bracelet au poignet" },
    { id:"s02", zone:"surmoi", crit:"reglementaire", phase:"veille", txt:"Épingles à dossard ×4", detail:"Fournies au retrait — en avoir 4 de rechange" },
    { id:"s03", zone:"surmoi", crit:"reglementaire", phase:"matin", txt:"Téléphone chargé", detail:"Utilisable FR/IT/CH · numéro NON masqué · téléphone allumé · numéros de secours de l'orga enregistrés (au dos du dossard)" },
    { id:"s04", zone:"surmoi", crit:"reglementaire", phase:"verif", txt:"Gobelet ≥ 15 cl", detail:"⛔ Bidons et flasques à bouchon refusés" },
    { id:"s05", zone:"surmoi", crit:"reglementaire", phase:"verif", txt:"Sifflet", detail:"Souvent intégré à la bretelle du sac — vérifier qu'il y est vraiment" },
    { id:"s06", zone:"surmoi", crit:"reglementaire", phase:"verif", txt:"Couverture de survie ≥ 1,40 × 2 m" },
    { id:"s07", zone:"surmoi", crit:"reglementaire", phase:"verif", txt:"Bande élastique adhésive ≥ 100 × 6 cm" },
    { id:"s08", zone:"surmoi", crit:"reglementaire", phase:"veille", txt:"Pièce d'identité", detail:"Carte d'identité belge — vérifier la date de validité" },
    { id:"s09", zone:"surmoi", crit:"reglementaire", phase:"veille", txt:"Balise GPS", detail:"Remise au retrait du dossard · caution Swikly réf. reference dans le coffre" },
    { id:"s10", zone:"surmoi", crit:"perso", phase:"matin", txt:"Montre Garmin Fenix 8", detail:"Chargée 100 % · GPX CCC + ClimbPro · alarme nutrition 30 min · alerte FC" },

    { id:"c01", zone:"sac", crit:"reglementaire", phase:"verif", txt:"2 lampes frontales en état de marche", detail:"Petzl Swift RL 1100 lm (principale) + Petzl Aria 1R RGB (secours) · mode rouge ✅ vérifié le 14/08" },
    { id:"c02", zone:"sac", crit:"reglementaire", phase:"achat", txt:"Piles / batteries de rechange pour CHAQUE lampe", detail:"🔴 Manquant au 16/08 — à acheter" },
    { id:"c03", zone:"sac", crit:"reglementaire", phase:"verif", txt:"Veste imperméable à capuche", detail:"S/Lab Ultra Jacket ✅ · coutures soudées · capuche intégrée" },
    { id:"c04", zone:"sac", crit:"reglementaire", phase:"verif", txt:"Seconde couche chaude manches longues ≥ 180 g", detail:"Ou sous-vêtement chaud ≥ 110 g + veste coupe-vent DWR · coton exclu" },
    { id:"c05", zone:"sac", crit:"reglementaire", phase:"verif", txt:"Pantalon ou collant long", detail:"Ou collant court + chaussettes couvrant toute la jambe · collant Salomon à re-tester à froid" },
    { id:"c06", zone:"sac", crit:"reglementaire", phase:"verif", txt:"Sur-pantalon imperméable", detail:"Scott RC Run WP ✅" },
    { id:"c07", zone:"sac", crit:"reglementaire", phase:"verif", txt:"Bonnet" },
    { id:"c08", zone:"sac", crit:"reglementaire", phase:"verif", txt:"Gants chauds ET imperméables", detail:"⚠️ Les Leki Overglove sont des sur-gants de bâtons — vérifier qu'ils sont acceptés comme gants chauds, sinon prévoir une vraie paire" },
    { id:"c09", zone:"sac", crit:"reglementaire", phase:"matin", txt:"Casquette / bandana / Buff", detail:"Casquette claire — sert aussi au refroidissement à l'eau" },
    { id:"c10", zone:"sac", crit:"reglementaire", phase:"matin", txt:"Réserve d'eau 1 L minimum", detail:"2 × 500 ml + souple de secours · 2 L si kit canicule activé" },
    { id:"c11", zone:"sac", crit:"reglementaire", phase:"matin", txt:"Réserve alimentaire", detail:"Distincte de la nutrition planifiée — garder 2 gels intouchés comme réserve" },

    { id:"c20", zone:"sac", crit:"perso", phase:"matin", txt:"👟 S/Lab Ultra Glide Reveal 44⅔", detail:"⏳ Confirmation finale au test du mercredi 19" },
    { id:"c21", zone:"sac", crit:"perso", phase:"matin", txt:"🧦 Chaussettes BV Sport Trail Ultra 2 Mid", detail:"✅ Validées le 15/08 sur 25,4 km · PAS les Injinji" },
    { id:"c22", zone:"sac", crit:"perso", phase:"matin", txt:"🧴 NOK Akileïne appliqué avant le départ", detail:"Sur les zones de friction, pas sur la boule du 5ᵉ méta" },
    { id:"c23", zone:"sac", crit:"perso", phase:"sacs", txt:"🥢 Bâtons Leki Ultratrail TR + système Shark", detail:"Conformes CCC ✅ · dès le km 1" },
    { id:"c24", zone:"sac", crit:"perso", phase:"sacs", txt:"Carquois à bâtons" },
    { id:"c25", zone:"sac", crit:"perso", phase:"sacs", txt:"Sac d'hydratation nettoyé et séché", detail:"Bicarbonate · vérifier qu'il porte 2 L si canicule" },
    { id:"c26", zone:"sac", crit:"perso", phase:"sacs", txt:"2 flasques 500 ml + 1 souple de secours", detail:"Flasque 1 : Näak Boost 60 concombre · Flasque 2 : eau" },
    { id:"c27", zone:"sac", crit:"perso", phase:"sacs", txt:"🍫 Nutrition sac de départ", detail:"7 gels + 3 barres + 2 mini-ziplocks Boost + 2 gels de réserve" },
    { id:"c28", zone:"sac", crit:"perso", phase:"sacs", txt:"💊 Trousse perso", detail:"Allopurinol + colchicine (⏳ selon avis médecin) · antihistaminique non sédatif (⏳) · Compeed EN CURATIF uniquement · sels/électrolytes" },
    { id:"c29", zone:"sac", crit:"perso", phase:"sacs", txt:"🔋 Batterie externe + câble" },
    { id:"c30", zone:"sac", crit:"perso", phase:"matin", txt:"Short 2-en-1 + t-shirt Salomon Sense Aero Graphic (S) + S/Lab Ultra Seamless" },
    { id:"c31", zone:"sac", crit:"confort", phase:"sacs", txt:"Epitact Epithelium Tact 05", detail:"⚠️ NON VALIDÉ — testé le 08/08 dans une chaussure disqualifiée (pire brûlure du dossier). Emporter seulement si le test du 19 le confirme. Retirable à Champex." },

    { id:"a01", zone:"allegement", crit:"perso", phase:"veille", txt:"🧦 Chaussettes BV Sport SÈCHES" },
    { id:"a02", zone:"allegement", crit:"perso", phase:"veille", txt:"🍫 Nutrition 2ᵉ moitié", detail:"8 gels DONT LES 5 CAFÉINÉS + 2 barres + 2 mini-ziplocks Boost" },
    { id:"a03", zone:"allegement", crit:"perso", phase:"veille", txt:"🧴 NOK en recharge" },
    { id:"a04", zone:"allegement", crit:"perso", phase:"veille", txt:"👕 Couche chaude sèche", detail:"T-shirt manches longues — la nuit commence juste après" },
    { id:"a05", zone:"allegement", crit:"reglementaire", phase:"veille", txt:"🔋 Piles de rechange frontale", detail:"La nuit fait ~9 h : Bovine → Trient → Catogne → Tête aux Vents → Flégère" },
    { id:"a06", zone:"allegement", crit:"confort", phase:"veille", txt:"Lingettes / petite serviette" },
    { id:"a07", zone:"allegement", crit:"confort", phase:"veille", txt:"2ᵉ paire d'Epitact", detail:"⚠️ Uniquement si l'Epitact est validé au test du 19" },

    { id:"b01", zone:"bagage", crit:"reglementaire", phase:"sacs", txt:"📄 Attestation d'assurance rapatriement — PDF HORS LIGNE", detail:"Souscription souscription dans le coffre · MUTUAIDE via Assurinco · renouvelée le 14/08 · ⚠️ vérifier que la période couvre bien le 28/08" },
    { id:"b02", zone:"bagage", crit:"reglementaire", phase:"sacs", txt:"📸 Photos de tous les documents, accessibles hors ligne", detail:"CI recto-verso · assurance · billets aller ET retour · ordonnances" },
    { id:"b03", zone:"bagage", crit:"reglementaire", phase:"sacs", txt:"🎫 Billets aller + retour", detail:"Eurostar 9414 · TGV 9773 · FlixBus N504 · FlixBus retour reference dans le coffre · SN2714 réf. reference dans le coffre" },
    { id:"b04", zone:"bagage", crit:"perso", phase:"sacs", txt:"🛂 Passeport", detail:"Pas obligatoire mais utile en secours si perte de la CI" },
    { id:"b05", zone:"bagage", crit:"perso", phase:"sacs", txt:"💳 Carte bancaire + espèces EUR et CHF", detail:"Tu traverses 3 pays · Champex et Trient sont en Suisse" },
    { id:"b06", zone:"bagage", crit:"perso", phase:"sacs", txt:"🏥 Carte européenne d'assurance maladie" },
    { id:"b07", zone:"bagage", crit:"perso", phase:"sacs", txt:"🔌 Chargeurs : téléphone, montre, frontale, batterie externe" },
    { id:"b08", zone:"bagage", crit:"perso", phase:"sacs", txt:"🔌 Adaptateur prise suisse", detail:"Si tu passes du temps côté suisse — l'appartement est à Chamonix, donc optionnel" },
    { id:"b09", zone:"bagage", crit:"perso", phase:"sacs", txt:"🍫 Nutrition course COMPLÈTE", detail:"Achetée avant le 20 · pas à Chamonix" },
    { id:"b10", zone:"bagage", crit:"perso", phase:"sacs", txt:"🥣 Petit-déj du jour J emporté de Belgique", detail:"Pain d'épices · miel en dosettes · compotes gourdes · barres simples" },
    { id:"b11", zone:"bagage", crit:"perso", phase:"sacs", txt:"🥛 Whey Nutripure + shaker", detail:"Récupération post-course" },
    { id:"b12", zone:"bagage", crit:"confort", phase:"sacs", txt:"👕 Tenue de rechange complète pour l'arrivée", detail:"Chamonix à 5h30 du matin : il fait froid" },
    { id:"b13", zone:"bagage", crit:"confort", phase:"sacs", txt:"🩴 Chaussures de repos ou claquettes" },
    { id:"b14", zone:"bagage", crit:"confort", phase:"sacs", txt:"👖 Vêtements pour 3-4 jours + nécessaire de toilette" },
    { id:"b15", zone:"bagage", crit:"confort", phase:"sacs", txt:"🛍️ Sac plastique pour le linge sale" },
    { id:"b16", zone:"bagage", crit:"perso", phase:"sacs", txt:"👟 Chaussures larges pour le train", detail:"⛔ NE PAS voyager en Reveal — 9 h assis, le pied gonfle" }
  ],

  kits: [
    {
      id: "canicule", label: "☀️ Kit canicule", defautActif: true,
      pourquoi: "Le plus probable : départ 9h de Courmayeur, exposition plein sud toute la journée.",
      items: [
        { id:"k11", txt:"Lunettes de soleil", crit:"reglementaire" },
        { id:"k12", txt:"Casquette saharienne ou combinaison couvrant tête ET nuque", crit:"reglementaire" },
        { id:"k13", txt:"Crème solaire", crit:"reglementaire" },
        { id:"k14", txt:"Réserve d'eau portée à 2 LITRES minimum", crit:"reglementaire", detail:"⚠️ Vérifier que le sac les porte — c'est souvent ce qui coince" }
      ]
    },
    {
      id: "hivernal", label: "❄️ Kit hivernal", defautActif: false,
      items: [
        { id:"k21", txt:"Lunettes de protection transparentes", crit:"reglementaire", detail:"Des verres photochromiques couvriraient canicule + hivernal avec un seul objet" },
        { id:"k22", txt:"3ᵉ couche chaude (polaire ou doudoune compressible)", crit:"reglementaire" },
        { id:"k23", txt:"Chaussures de trail robustes et fermées", crit:"reglementaire", detail:"⛔ Modèles minimalistes ou ultralégers exclus" }
      ]
    },
    {
      id: "mauvaistemps", label: "🌧️ Kit mauvais temps", defautActif: false,
      items: [
        { id:"k31", txt:"Seconde couche chaude ADDITIONNELLE", crit:"reglementaire" },
        { id:"k32", txt:"Bonnet + gants chauds imperméables + sur-pantalon", crit:"reglementaire", detail:"Déjà dans le kit de base — vérifier qu'ils sont bien là" }
      ]
    }
  ],

  verifications: [
    { id:"v01", txt:"Mesurer le gobelet au mètre", pourquoi:"Beaucoup de gobelets souples font 125 ml → non conformes. Il faut ≥ 150 ml.", quand:"2026-08-20", crit:"reglementaire" },
    { id:"v02", txt:"Peser la seconde couche chaude", pourquoi:"Elle doit faire ≥ 180 g (homme M), ou 110 g + coupe-vent DWR.", quand:"2026-08-20", crit:"reglementaire" },
    { id:"v03", txt:"Remplir le sac à 2 L et le porter", pourquoi:"Si le kit canicule est activé, 2 L sont obligatoires. Vérifier que le sac les accepte ET que ça reste confortable.", quand:"2026-08-20", crit:"reglementaire" },
    { id:"v04", txt:"Vérifier la validité de la carte d'identité", pourquoi:"Obligatoire au retrait du dossard. Sans elle, pas de dossard.", quand:"2026-08-20", crit:"reglementaire" },
    { id:"v05", txt:"Vérifier que les Leki Overglove comptent comme gants chauds", pourquoi:"Ce sont des sur-gants de bâtons. Si non acceptés, il faut une vraie paire imperméable.", quand:"2026-08-20", crit:"reglementaire" },
    { id:"v06", txt:"Tester le mode rouge des deux frontales", pourquoi:"✅ Fait le 14/08 — les deux ont le mode rouge.", quand:"2026-08-14", crit:"reglementaire", fait:true },
    { id:"v07", txt:"Re-tester le collant long Salomon à froid, au réveil", pourquoi:"Jugé serré le 16/08 au soir, après un week-end de recharge et 28 km. À rejuger dans de bonnes conditions.", quand:"2026-08-20", crit:"perso" },
    { id:"v08", txt:"Peser le sac de course chargé", pourquoi:"Le poids porté agit directement sur la charge de l'avant-pied.", quand:"2026-08-25", crit:"perso" },
    { id:"v09", txt:"Charger le GPX CCC + activer ClimbPro sur la Fenix", pourquoi:"Se perdre coûte cher : 14 min et un coup au moral le 15/08.", quand:"2026-08-22", crit:"perso" },
    { id:"v10", txt:"Enregistrer le numéro de sécurité de l'orga", pourquoi:"Il est au dos du dossard, donc disponible seulement à partir du 27.", quand:"2026-08-27", crit:"reglementaire" }
  ],

  interdits: {
    allegement: {
      titre: "⛔ INTERDIT dans le sac d'allègement",
      items: ["Bâtons", "Objets de valeur", "Objets fragiles"],
      note: "Le rapatriement du sac peut avoir du retard : n'y mets rien dont tu aurais besoin dans l'heure suivant l'arrivée."
    },
    retour: {
      titre: "✈️ Retour",
      note: "Les bâtons Leki ne passent pas en cabine — ils partent en soute. Prévoir de quoi les protéger."
    }
  },

  enAttente: [
    { id:"att1", txt:"Colchicine le jour J + antihistaminique non sédatif", resoudreLe:"2026-08-17", via:"Appel médecin", impacte:["c28"] },
    { id:"att2", txt:"Verdict chaussures Reveal", resoudreLe:"2026-08-19", via:"Test Reveal #2", impacte:["c20","c31","a07"] },
    { id:"att3", txt:"Kit conditionnel annoncé par l'orga", resoudreLe:"2026-08-28", via:"Annonce avant le départ", impacte:["kits"] }
  ]
};

export default SAC;
