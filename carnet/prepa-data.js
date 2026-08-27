/**
 * prepa-data.js — Plan d'affûtage CCC 2026 · J-11 → J-0
 * ---------------------------------------------------------------------------
 * Source de vérité : agenda PRO de Pierre, corrigé le 16/08/2026.
 * Ce fichier alimente la SECTION PRÉPARATION de l'app (écran « Préparation »).
 *
 * PRINCIPE À RESPECTER DANS L'UI :
 *   « Plus rien de ce qui suit ne construit de forme. »
 *   L'objectif unique des 12 jours : un pied intact sur la ligne de départ
 *   et un dossier chaussures fermé avant Courmayeur.
 *
 * TYPES : type ∈ 'repos' | 'ef' | 'cle' | 'renfo' | 'voyage' | 'course'
 *         priorite ∈ 'normale' | 'haute' | 'critique'
 */

export const AFFUTAGE = {
  meta: {
    etabliLe: "2026-08-16",
    sourceDeVerite: "Agenda PRO",
    volumeS1Km: 37,   // lun 17 → dim 23
    volumeS2Km: 14,   // lun 24 → ven 28
    acclimatationChaleur: 0.68,
    meteoSemaine: "20-25 °C — plus frais que le 15/08 (30,8 °C). Aucun stimulus thermique dehors → les bains chauds deviennent le seul apport.",
    seanceCle: "2026-08-19"
  },

  regles: [
    { n: 1, titre: "Rien de neuf.",
      detail: "Pas de chaussure, pas de semelle, pas de gel, pas de technique, pas de manipulation agressive. Ce qui n'a pas deux séances de test ne monte pas dans le sac." },
    { n: 2, titre: "Une séance qui déborde ne se rattrape plus.",
      detail: "Formulation de Pierre, 14/08." },
    { n: 3, titre: "Une séance manquée ne coûte rien.",
      detail: "Aucune séance de ce plan ne construit de forme. Si le pied parle, on saute." },
    { n: 4, titre: "Ce n'est pas la distance qui déborde, c'est l'allure.",
      detail: "Chaque séance a un plafond FC. Configurer l'alerte sur la Fenix — elle décide à la place de la sensation." }
  ],

  jours: [
    {
      date: "2026-08-17", j: "J-11", jour: "Lundi", type: "renfo", priorite: "critique",
      titre: "Renfo 6/9 · pas de course",
      seance: { heure: "18:30", contenu: "Renfo 6/9", distanceKm: 0 },
      taches: [
        { id: "p17a", txt: "📞 RDV médecin DÉPLACÉ au jeudi 20 au matin", priorite: "normale", detail: "Dr Alexandra Nunes de Sousa · 4 sujets · rien à faire lundi" },
        { id: "p17b", txt: "🛒 TraKKs Rocourt — liste fermée : 12 gels + 5 caféinés + 5 barres · zéro poudre" },
        { id: "p17c", txt: "☕ Noter les mg de caféine par gel sur l'étiquette" },
        { id: "p17d", txt: "🛁 Bain chaud (38-40 °C, 20-25 min)" }
      ],
      note: "Le RDV médecin est passé au jeudi 20 au matin. Reste TraKKs et le bain chaud."
    },
    {
      date: "2026-08-18", j: "J-10", jour: "Mardi", type: "ef", priorite: "normale",
      titre: "EF 8 km — ROUTE",
      seance: { heure: "17:30", contenu: "8 km souple, route plate", distanceKm: 8, fcMax: 140,
                config: "⛔ PAS les Reveal — chaussures de route" },
      taches: [
        { id: "p18a", txt: "⌚ Alerte FC 140 configurée sur la Fenix" }
      ],
      note: "Objectif : faire tourner les jambes. Le pied doit arriver frais mercredi."
    },
    {
      date: "2026-08-19", j: "J-9", jour: "Mercredi", type: "cle", priorite: "critique",
      titre: "TEST REVEAL #2 — FAIT, REVEAL VALIDÉE",
      seance: { heure: "17:30", contenu: "12 km · ~300 m D+ · trail", distanceKm: 12, dplus: 300, fcMax: 145,
                config: "S/Lab Ultra Glide Reveal 44⅔ · SIDAS TRAIL DOUBLE · laçage heel-lock · bâtons dès la 1re montée · sac de course chargé · BV Sport RTECH PRO (haut) · les 3 couches de gants · NOK avant départ" },
      consignes: [
        "⛔ Aucune recherche de sensation. Pas de segment, pas de PR.",
        "⛔ Ne pas courir les montées — marcher, comme le 28.",
        "✅ Une séance ennuyeuse est une séance réussie."
      ],
      aNoter: [
        "Km d'apparition de la brûlure (ou « aucune »)",
        "Intensité max : légère / 🔥 / 🔥🔥 / 🔥🔥🔥",
        "Zone exacte : avant-pied (friction) ou 5e méta (compression)",
        "Douleur d'appui APRÈS la séance : oui/non, combien de temps"
      ],
      taches: [
        { id: "p19a", txt: "📸 Série photo du pied le soir — mêmes angles que le 15/08" },
        { id: "p19b", txt: "🛁 Bain chaud" }
      ],
      branche: {
        si: "aucune brûlure ou légère", alors: "Dossier chaussures FERMÉ · Reveal le 28",
        sinon: "🔥 ou pire → samedi 22 devient le test S/Lab Ultra 2 semelle d'origine. 6 jours pour trancher, pas 0."
      },
      note: "C'est LA séance des 12 jours. Elle ferme le dossier chaussures."
    },
    {
      date: "2026-08-20", j: "J-8", jour: "Jeudi", type: "repos", priorite: "haute",
      titre: "Médecin le matin · vérif matériel · renfo léger",
      seance: { contenu: "Repos", distanceKm: 0 },
      taches: [
        { id: "p20f", txt: "🩺 RDV Dr Alexandra Nunes de Sousa — 4 sujets", priorite: "critique", detail: "Colchicine le jour J · antihistaminique non sédatif · pied droit et cheville gauche · mains au froid et ongles" },
        { id: "p20a", txt: "📋 Vérification matériel obligatoire, pièce par pièce, liste en main", priorite: "haute" },
        { id: "p20b", txt: "🔋 Piles ×2 frontales" },
        { id: "p20c", txt: "🥣 Couverts + bol (BYOU)" },
        { id: "p20d", txt: "💪 Renfo 7/9 le soir — 1 TOUR seulement (déplacé du mercredi)" },
        { id: "p20e", txt: "👖 Re-tester le collant long Salomon à froid, au réveil" }
      ],
      note: "Règlement 2026 : plus de kit chaud / kit froid — liste additionnelle activée par l'orga avant le départ. ⚠️ Si le pied a parlé mercredi : renfo sauté."
    },
    {
      date: "2026-08-21", j: "J-7", jour: "Vendredi", type: "ef", priorite: "haute",
      titre: "EF 8 km + Renfo 8/9 — LE MATIN · Ostéo le soir",
      seance: { heure: "09:00", contenu: "8 km souple + renfo 8/9 (1 tour)", distanceKm: 8, fcMax: 135 },
      rdv: { heure: "17:30", quoi: "Ostéopathe — Xavier Walczynski", ou: "Av. Albert 1er 87, Grivegnée" },
      consignesRdv: [
        "🗣️ Dire d'entrée : « J'ai 101 km dans 7 jours. Je veux du léger, pas un grand nettoyage. »",
        "⛔ Cheville GAUCHE — entorse en inversion 15/08, douleur atypique malléole interne. Pas de manipulation forcée.",
        "⛔ Avant-pied DROIT — suspicion fracture de fatigue tête du 5e méta. IRM 5/09. Aucun thrust.",
        "⛔ MTP1 bilatéral — ankylose structurelle. Inutile de forcer.",
        "⚠️ Antécédents discaux + chevilles très rigides.",
        "✅ Travail utile : bassin, chaînes postérieures, dorsales, diaphragme.",
        "❓ Demander la mesure CHIFFRÉE de la dorsiflexion de cheville (jamais mesurée)."
      ],
      taches: [
        { id: "p21a", txt: "🛁 Bain chaud" },
        { id: "p21b", txt: "📋 Surveiller 48h après l'ostéo — toute sensation nouvelle est à signaler" }
      ]
    },
    {
      date: "2026-08-22", j: "J-6", jour: "Samedi", type: "ef", priorite: "haute",
      titre: "9 km · D+ léger",
      seance: { heure: "09:30", contenu: "9 km · ~200 m D+ · config course", distanceKm: 9, dplus: 200, fcMax: 140 },
      taches: [
        { id: "p22a", txt: "🗺️ Charger le GPX CCC + activer ClimbPro dans la Fenix 8", priorite: "haute" },
        { id: "p22b", txt: "🔋 Charger la montre à 100 %" }
      ],
      note: "Journée d'observation post-ostéo : une seule sortie souple, rien d'autre. GPX aujourd'hui et pas dimanche → une journée de marge si la synchro coince."
    },
    {
      date: "2026-08-23", j: "J-5", jour: "Dimanche", type: "repos", priorite: "normale",
      titre: "Marche familiale + Renfo 9/9",
      seance: { heure: "18:00", contenu: "Renfo 9/9 — 1 tour", distanceKm: 0 },
      rdv: { heure: "10:00", quoi: "Marche 60 ans Marie-Pierre" },
      taches: [
        { id: "p23a", txt: "🛁 Bain chaud" },
        { id: "p23b", txt: "📖 Relire le carnet de course en entier, une fois" },
        { id: "p23c", txt: "🧠 Finaliser le mantra de Trient" }
      ]
    },
    {
      date: "2026-08-24", j: "J-4", jour: "Lundi", type: "ef", priorite: "normale",
      titre: "EF 6 km très souple · dernier bain chaud",
      seance: { heure: "17:30", contenu: "6 km très souple", distanceKm: 6, fcMax: 130 },
      taches: [
        { id: "p24a", txt: "🛁 DERNIER bain chaud du protocole d'acclimatation", priorite: "haute" },
        { id: "p24b", txt: "🍝 Fin du contrat nutrition « propre » — la recharge démarre demain" }
      ]
    },
    {
      date: "2026-08-25", j: "J-3", jour: "Mardi", type: "ef", priorite: "haute",
      titre: "Activation · sac bouclé · début de recharge",
      seance: { heure: "17:30", contenu: "5 km + 4 lignes droites de 20 s", distanceKm: 5 },
      taches: [
        { id: "p25a", txt: "🎒 Sac de course bouclé ET PESÉ", priorite: "haute" },
        { id: "p25b", txt: "🎒 Sac d'allègement Champex préparé (⛔ bâtons, valeur, fragile)" },
        { id: "p25c", txt: "🍝 RECHARGE GLUCIDIQUE — à ta faim, sans discussion", priorite: "haute" },
        { id: "p25d", txt: "🧊 GEL du développement de l'app — ce qui n'est pas fini n'existe pas" },
        { id: "p25e", txt: "🖨️ Imprimer le carnet de course (backup papier)" }
      ]
    },
    {
      date: "2026-08-26", j: "J-2", jour: "Mercredi", type: "voyage", priorite: "critique",
      titre: "Voyage — 9 h assis",
      trajet: [
        { h: "07:53", quoi: "Eurostar 9414 · Liège-Guillemins → Paris-Nord" },
        { h: "12:16", quoi: "TGV 9773 · Paris-Lyon → Genève-Cornavin (15:36)" },
        { h: "16:05", quoi: "FlixBus N504 · Genève → Chamonix (17:20) — maillon faible" },
        { h: "16-18h", quoi: "Appartement · adresse et référence dans le coffre" }
      ],
      taches: [
        { id: "p26a", txt: "⛔ NE PAS voyager en Reveal — chaussures larges, lacées lâche", priorite: "critique" },
        { id: "p26b", txt: "🚶 Debout et marche à chaque arrêt (Paris-Nord, Genève)" },
        { id: "p26c", txt: "🚶 15-20 min de marche à l'arrivée, avant de dîner" },
        { id: "p26d", txt: "⚠️ Conflit à trancher : « Logo 13h » dans l'agenda Famille" }
      ],
      note: "Risque le moins surveillé de la prépa : le pied de Pierre gonfle en position assise — c'est le mécanisme qui a disqualifié les S/Lab Ultra Glide 2."
    },
    {
      date: "2026-08-27", j: "J-1", jour: "Jeudi", type: "repos", priorite: "critique",
      titre: "Déblocage + retrait dossard",
      seance: { heure: "10:00", contenu: "Déblocage 3 km plat dans Chamonix", distanceKm: 3 },
      taches: [
        { id: "p27a", txt: "🎽 Retrait dossard 12h-14h — Espace Michel Croz · carte d'identité + confirmation", priorite: "critique" },
        { id: "p27b", txt: "🛰️ Balise GPS remise (caution Swikly, réf. dans le coffre)" },
        { id: "p27c", txt: "🎒 Sac d'allègement remis au retrait du dossard" },
        { id: "p27d", txt: "📞 Numéro sécurité orga (dos du dossard) enregistré dans le téléphone" },
        { id: "p27e", txt: "🛒 Courses : pain frais, bananes, eau, petit-déj du 28" },
        { id: "p27f", txt: "🎒 Sacs bouclés le soir · tenue posée" },
        { id: "p27g", txt: "⏰ 2 alarmes réglées · coucher tôt" }
      ]
    },
    {
      date: "2026-08-28", j: "J-0", jour: "Vendredi", type: "course", priorite: "critique",
      titre: "CCC — 108,8 km · 6 400 m D+ · parcours modifié le 27/08",
      matin: [
        { h: "05:00", quoi: "Réveil" },
        { h: "05:20-05:45", quoi: "Petit-déj testé : pain + miel, banane, café noir" },
        { h: "06:10", quoi: "Départ à pied — 600 m, 8 min jusqu'à l'arrêt Grépon" },
        { h: "06:30", quoi: "NAVETTE CCC Start Line → Courmayeur Sport Center" },
        { h: "07:30-08:45", quoi: "Dépôt sac d'allègement · Piazzale Monte Bianco" },
        { h: "08:30", quoi: "Briefing · Place Brocherel · fond du sas vague 2" },
        { h: "09:00-09:15", quoi: "DÉPART" }
      ]
    }
  ],

  /** Le rendez-vous medecin, deplace du lundi 17 au jeudi 20 au matin. */
  rdvMedecin: {
    date: "2026-08-20", moment: "matin",
    medecin: "Dr Alexandra Nunes de Sousa", fait: true, bilan: "Colchicine maintenue · antihistaminique prescrit · prise de sang faite · ongles signalés, suivi en cours",
    sujets: [
      { n:1, titre:"Colchicine le jour J",
        detail:"Risques digestifs et musculaires sur 20 h d'effort. Arreter, maintenir, ou emporter en secours ?" },
      { n:2, titre:"Antihistaminique non sedatif",
        detail:"A emporter dans le sac. Urticaire nocturne, piste persil et Apiacees." },
      { n:3, titre:"Pied droit et entorse cheville gauche",
        detail:"Aucune douleur a la marche a froid, proeminence percue mais indolore. La douleur apparait sous repetition d'appuis, persiste apres l'effort au point de faire marcher sur le talon, et disparait completement apres une nuit. Le podologue observe qu'en decharge sur table, les deux pieds partent spontanement vers l'avant-pied externe. Plus l'entorse en inversion du 15/08, sans suite a 24 h." },
      { n:4, titre:"Mains au froid et ongles", nouveau:true,
        detail:"Tres vite mal au bout des doigts quand il fait froid, ET ongles de mains epais, durs et friables. Est-ce que ca peut etre lie ? Est-ce que ca ressemble a un Raynaud ? Demander aussi s'il faut en parler au rhumatologue : un Raynaud peut etre secondaire." }
    ]
  },

  /** Carb cycling : un outil maitrise depuis plus de 2 ans, pas un signal d'alerte. */
  carbCycling: {
    contexte: "Pierre pratique le carb cycling depuis plus de 2 ans. C'est un outil maitrise, pas un signal d'alerte.",
    plan: [
      { date:"2026-08-17", niveau:"LOW",    note:"Jour sans cardio, place volontairement" },
      { date:"2026-08-18", niveau:"MEDIUM" },
      { date:"2026-08-19", niveau:"HIGH",   note:"Test Reveal #2 : la seance cle se court sur des reserves pleines" },
      { date:"2026-08-20", niveau:"MEDIUM / HIGH" },
      { date:"2026-08-21", niveau:"MEDIUM / HIGH" },
      { date:"2026-08-22", niveau:"HIGH",   note:"Derniere sortie avec D+" },
      { date:"2026-08-23", niveau:"MEDIUM / HIGH" },
      { date:"2026-08-24", niveau:"HIGH",   note:"Fin du contrat propre" },
      { date:"2026-08-25", niveau:"RECHARGE", note:"La recharge n'est pas un peu plus : c'est un cran au-dessus des jours high." }
    ],
    regleAbsolue: "PLUS AUCUN JOUR LOW apres le 17/08. Uniquement medium et high en alternance."
  },

  /** Trous ouverts — l'UI affiche la date de résolution et attend la saisie. */
  inconnues: [
    { id: "medoc",   label: "Colchicine le jour J + antihistaminique non sédatif",
      resoudreLe: "2026-08-20", via: "RDV Dr Nunes de Sousa", impacte: ["Trousse perso", "Checklist matériel"],
      reponse: "Colchicine MAINTENUE le jour J. Antihistaminique non sédatif PRESCRIT. Reste à retirer l'ordonnance avant le 25.",
      resoluLe: "2026-08-20" },
    { id: "cafeine", label: "mg de caféine par gel Näak Boost caféiné",
      resoudreLe: "2026-08-17", via: "Étiquette à TraKKs", impacte: ["Plan caféine"],
      reponse: "35 mg Ultra Energy Chocolat · 65 mg barre Caramel Macchiato · 100 mg Boost Peach Tea.",
      resoluLe: "2026-08-17" },
    { id: "reveal",  label: "Verdict chaussures — Reveal validée ou plan B",
      resoudreLe: "2026-08-19", via: "Test Reveal #2", impacte: ["Config course", "Séance du samedi 22"],
      reponse: "REVEAL VALIDÉE. Test #2 sous pluie battante, 13 km, pieds trempés 1h20 : zéro brûlure. Le laçage a même dû être RESSERRÉ.",
      resoluLe: "2026-08-19" }
  ],

  /** Points à vérifier, sans échéance dure mais à ne pas oublier. */
  aVerifier: [
    { id: "logo",  txt: "Conflit « Logo 13h » le mercredi 26 (jour de voyage)" },
    { id: "50ans", txt: "« 50 ans Pierre » samedi 29 à 19h — tu seras à Chamonix, séjour jusqu'au 30" },
    { id: "gobelet", txt: "Mesurer le gobelet : beaucoup font 125 ml, il faut ≥ 150 ml" },
    { id: "couche", txt: "Peser la 2e couche chaude : ≥ 180 g (ou 110 g + coupe-vent DWR)" },
    { id: "sac2l", txt: "Vérifier que le sac porte 2 L (kit canicule probable)" },
    { id: "collant", txt: "Collant long Salomon — re-testé à froid le 20, OK", fait: true },
    { id: "couche2", txt: "Peser LES DEUX t-shirts longs chauds : ≥ 180 g chacun, à cause de l'échange à Champex" },
    { id: "ci", txt: "Vérifier la validité de la carte d'identité" },
    { id: "ordo", txt: "💊 Retirer l'ordonnance antihistaminique en pharmacie AVANT le 25" },
    { id: "taxe", txt: "💳 Virement de la taxe de séjour, 16 €, à Lamy, puis confirmation par mail — avant le 25" },
    { id: "linge", txt: "🛏️ Trancher la question du linge de lit : mail à Sylvain Lazaille" },
    { id: "horsligne", txt: "📱 Enregistrer hors ligne le code de la boîte à clés, le numéro de Sylvain et les 2 PDF du mail du 20" }
  ],

  /** Contrat nutrition en vigueur du 17 au 24 août inclus. */
  contratNutrition: {
    du: "2026-08-17", au: "2026-08-24",
    principe: "Maintenance propre, zéro excédent. PAS de déficit.",
    base: "Maison, non transformé : riz / pommes de terre / pain gris, protéines maigres (poulet, dinde, œufs, skyr), légumes, fruits entiers.",
    zero: "Industriel · sucre raffiné de confort (glaces, biscuits, sodas) · friture",
    quantite: "À ta faim aux repas. Aucune compensation d'un « trop » de la veille — chaque jour repart à zéro.",
    verrou: "Skyr du soir planifié : c'est lui qui empêche le cycle restriction → craquage de 21h30.",
    hydratation: "2-2,5 L/jour constant — c'est le vrai drainage, et la protection goutte.",
    exceptions: [
      "Mercredi 19 : gels et Näak pendant le test Reveal — le test valide aussi la nutrition de course.",
      "Après chaque séance : collation de récup normale. Un jour d'entraînement n'est pas un jour de restriction.",
      "Lundi 24 au soir : le contrat s'éteint. La recharge glucidique démarre mardi 25, à ta faim."
    ],
    gardeFou: "Si faim entre les repas : tu manges (fruit, skyr, noisettes). Sur une semaine d'affûtage, la faim signale qu'on est passé sous la maintenance. « Propre » est l'objectif, « moins » ne l'est pas.",
    mesure: "Balance : mercredi 22/08 au réveil, à jeun, UNE fois. Attendu au-dessus de 73,5 kg — glycogène + plasma d'acclimatation = carburant embarqué, pas du lest."
  }
};

export default AFFUTAGE;
