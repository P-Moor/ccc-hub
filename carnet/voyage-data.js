/**
 * voyage-data.js — Voyage & logistique CCC 2026
 * ---------------------------------------------------------------------------
 * RECADRAGE PRODUIT : l'app sert 12 JOURS EN PREPARATION et 20 HEURES EN
 * COURSE. Le 28, Pierre aura son dossard, ses batons et sa tete : le telephone
 * servira a consulter, pas a piloter. LA PREPARATION EST LE COEUR DU PRODUIT.
 */

export const VOYAGE = {

  meta: {
    principe: "9 h 27 de transport porte-à-porte, deux jours avant 101 km. Le seul objectif : arriver avec des pieds en état.",
    risquePrincipal: "Le pied de Pierre gonfle en position assise — c'est le mécanisme qui a disqualifié les S/Lab Ultra Glide 2 (couture de languette sur l'exostose MTP1 en conduisant). C'est le risque le moins surveillé de la préparation."
  },

  aller: {
    date: "2026-08-26",
    label: "Mercredi 26 · Liège → Chamonix",
    dureeTotale: "10 h 07 porte-à-porte (07:53 → ~18:00)",
    conflitAgenda: "⚠️ « Logo 13h » est dans l'agenda Famille ce jour-là — à trancher avant le 20/08.",
    segments: [
      {
        id: "a1", type: "train", ref: "Eurostar 9414",
        de: "Liège-Guillemins", vers: "Paris-Nord",
        depart: "07:53", arrivee: "10:05", duree: "2h12",
        aFaire: ["Billet sur le téléphone ET imprimé", "Se lever et marcher une fois en cours de trajet"]
      },
      {
        id: "corr1", type: "correspondance",
        de: "Paris-Nord", vers: "Paris-Gare de Lyon",
        battement: 131, battementLabel: "2 h 11",
        niveau: "confortable",
        aFaire: [
          "Métro ligne 5 direct (~20 min) ou taxi",
          "🚶 MARCHER — c'est le meilleur créneau de la journée pour les jambes",
          "Déjeuner ici : repas simple, connu, peu de fibres",
          "Remplir la gourde"
        ]
      },
      {
        id: "a2", type: "train", ref: "TGV 9773",
        de: "Paris-Gare de Lyon", vers: "Genève-Cornavin",
        depart: "12:16", arrivee: "15:36", duree: "3h20",
        aFaire: [
          "Le plus long segment assis : se lever toutes les heures",
          "Jambes surélevées sur le sac quand c'est possible",
          "Boire régulièrement"
        ]
      },
      {
        id: "corr2", type: "correspondance",
        de: "Genève-Cornavin", vers: "Gare routière Genève",
        battement: 29, battementLabel: "29 min",
        niveau: "serre",
        alerte: "🔴 LE POINT CRITIQUE DE LA JOURNÉE. 29 minutes seulement, et si le TGV a du retard, tu rates le FlixBus.",
        aFaire: [
          "Repérer le trajet gare CFF → gare routière AVANT le départ (Google Maps hors ligne)",
          "Vérifier dès Paris si le TGV a du retard",
          "Plan B identifié : trains SNCF/TER Genève → Saint-Gervais puis Mont-Blanc Express, ou bus suivant"
        ]
      },
      {
        id: "a3", type: "bus", ref: "FlixBus N504",
        de: "Genève", vers: "Chamonix",
        depart: "16:05", arrivee: "17:20", duree: "1h15",
        alerte: "⚠️ Maillon faible du voyage — vérifier que le billet est modifiable.",
        aFaire: ["Billet FlixBus téléchargé hors ligne", "Bâtons rangés proprement en soute"]
      },
      {
        id: "a4", type: "arrivee",
        de: "Arrêt Chamonix", vers: "adresse dans le coffre",
        depart: "17:20", arrivee: "~18:00",
        ref: "Appartement réf. reference dans le coffre",
        aFaire: [
          "🚶 15-20 MIN DE MARCHE avant de dîner — non négociable après 9h assis",
          "Repérer l'arrêt Grépon Bus (600 m, 8 min) tant qu'il fait jour",
          "Défaire les sacs, sortir tout le matériel",
          "Dîner simple, connu, tôt"
        ]
      }
    ],
    surMoiDansLeTrain: [
      { id:"t1", txt:"👟 Chaussures larges, lacées lâche", crit:"critique", detail:"⛔ PAS les Reveal — le pied gonfle assis" },
      { id:"t2", txt:"💧 Gourde remplie", detail:"Boire régulièrement — la déshydratation en train est réelle" },
      { id:"t3", txt:"🍎 Collations du trajet", detail:"Contrat nutrition terminé le 24 → recharge glucidique en cours" },
      { id:"t4", txt:"📄 Tous les billets hors ligne", detail:"Eurostar · TGV · FlixBus" },
      { id:"t5", txt:"🪪 Carte d'identité à portée de main", detail:"Passage en Suisse" },
      { id:"t6", txt:"🔋 Batterie externe chargée" },
      { id:"t7", txt:"💊 Traitement du jour", detail:"Allopurinol + colchicine — ne pas le mettre en soute" },
      { id:"t8", txt:"🧦 Chaussettes de compression", detail:"Recommandé sur 9h de transport" }
    ]
  },

  retour: {
    label: "Retour",
    alerte: "🔴 INCOHÉRENCE À VÉRIFIER : le séjour est noté jusqu'au 30/08, le FlixBus retour est réservé le 29/08 à 07:30, et l'agenda Famille contient « 50 ans Pierre » le 29 à 19h. Tu finis la CCC le 29 au matin. Ces trois choses ne peuvent pas être vraies en même temps.",
    segments: [
      {
        id: "r1", type: "bus", ref: "FlixBus Alpine Fleet · réservation reference dans le coffre",
        de: "Chamonix Centre", vers: "Aéroport de Genève",
        depart: "07:30", date: "à vérifier — 29 ou 30/08 ?"
      },
      {
        id: "r2", type: "avion", ref: "Brussels Airlines SN2714 · réf. reference dans le coffre · e-billet e-billet dans le coffre",
        de: "Genève (GVA)", vers: "Bruxelles (BRU)",
        depart: "11:25", arrivee: "12:45", duree: "1h20",
        bagages: "1 petit bagage à main + 1 cabine 8 kg + 1 soute 23 kg",
        alerte: "⚠️ Les bâtons Leki ne passent PAS en cabine — ils partent en soute. Prévoir de quoi les protéger."
      }
    ],
    aFaire: [
      { id:"r10", txt:"Vérifier la date du FlixBus retour vs fin de séjour", crit:"critique" },
      { id:"r11", txt:"Vérifier l'événement « 50 ans Pierre » du 29 à 19h", crit:"critique" },
      { id:"r12", txt:"Récupérer le sac d'allègement à l'arrivée avant de quitter Chamonix" },
      { id:"r13", txt:"Récupérer la caution balise GPS (Swikly reference dans le coffre)" },
      { id:"r14", txt:"Protéger les bâtons pour la soute" }
    ]
  },

  surPlace: [
    {
      date: "2026-08-27", label: "Jeudi 27 · J-1",
      bloc: [
        { h: "10:00", quoi: "🏃 Déblocage 3 km plat dans Chamonix", detail: "Rien de plus. Les jambes tournent, c'est tout." },
        { h: "12:00-14:00", quoi: "🎫 RETRAIT DU DOSSARD — Espace Michel Croz", crit: "critique",
          detail: "Carte d'identité + confirmation d'inscription. Balise GPS remise ici (caution Swikly reference dans le coffre). Le SAC D'ALLÈGEMENT est remis ici aussi. Contrôle matériel facultatif." },
        { h: "après", quoi: "📞 Enregistrer le numéro de sécurité de l'orga", detail: "Il est au dos du dossard — donc disponible seulement maintenant." },
        { h: "15:00", quoi: "🛒 Courses à Chamonix", detail: "Pain frais, bananes, eau, de quoi petit-déjeuner le 28." },
        { h: "18:00", quoi: "🎒 Boucler les deux sacs", detail: "Sac de course pesé · sac d'allègement bouclé · tenue posée sur une chaise." },
        { h: "19:00", quoi: "🍽️ Dîner simple, connu, TÔT", detail: "Riz ou pâtes, protéine maigre, peu de fibres. ⛔ Rien de nouveau, rien de gras, rien d'épicé, zéro Apiacée." },
        { h: "21:30", quoi: "⏰ Deux alarmes réglées · coucher tôt", detail: "Même si tu ne dors pas, tu te reposes. La nuit J-2 compte plus que la nuit J-1." }
      ]
    },
    {
      date: "2026-08-28", label: "Vendredi 28 · JOUR J",
      bloc: [
        { h: "05:00", quoi: "⏰ Réveil" },
        { h: "05:20-05:45", quoi: "🥣 Petit-déj testé", detail: "Pain + miel, banane, café noir. Peu de gras, pas de gros bol de skyr (vidange lente)." },
        { h: "05:50", quoi: "🧴 NOK sur les pieds · chaussettes course · traitement" },
        { h: "06:10", quoi: "🚶 Départ à pied — 600 m, 8 min", detail: "Descendre la la rue du logement vers le sud. L'arrêt est au grand parking de l'Aiguille du Midi." },
        { h: "06:20", quoi: "📍 À l'arrêt Grépon", detail: "QR du dossard ou contremarque MyUTMB prêt. Sac bouclé, dossard épinglé." },
        { h: "06:30", quoi: "🚌 NAVETTE CCC Start Line → Courmayeur", crit: "critique" },
        { h: "~07:20", quoi: "🏔️ Arrivée Courmayeur Sport Center", detail: "Horaire exact : app UTMB GO." },
        { h: "07:30-08:45", quoi: "🎒 Dépôt du sac d'allègement — Piazzale Monte Bianco", crit: "critique" },
        { h: "~08:00", quoi: "🍌 Complément glucidique", detail: "Le petit-déj sera à 3h30 du départ. Vidange + file toilettes tôt." },
        { h: "08:30", quoi: "📢 Briefing — Place Brocherel", detail: "Se placer AU FOND du sas vague 2." },
        { h: "09:00-09:15", quoi: "🏁 DÉPART", crit: "critique" }
      ]
    }
  ],

  documentsHorsLigne: [
    { id:"d1", txt:"Ticket de navette (PDF MyUTMB)", statut:"aFaire", crit:"critique" },
    { id:"d2", txt:"Contremarque MyUTMB", statut:"aFaire" },
    { id:"d3", txt:"Attestation d'assurance rapatriement", statut:"aFaire", crit:"critique", detail:"Souscription souscription dans le coffre · vérifier que la période couvre le 28/08" },
    { id:"d4", txt:"Photos CI recto-verso", statut:"aFaire", crit:"critique" },
    { id:"d5", txt:"Billets aller (Eurostar, TGV, FlixBus)", statut:"aFaire", crit:"critique" },
    { id:"d6", txt:"Billets retour (FlixBus, SN2714)", statut:"aFaire" },
    { id:"d7", txt:"Google Maps Chamonix + Genève hors ligne", statut:"aFaire", detail:"Pour la correspondance serrée de Genève" },
    { id:"d8", txt:"Ce carnet, consultable hors ligne", statut:"aFaire", crit:"critique" },
    { id:"d9", txt:"Ordonnances en cours", statut:"aFaire" }
  ],

  contacts: [
    { qui: "Urgence orga CCC", num: "au dos du dossard — à enregistrer le 27" },
    { qui: "Contact d'urgence personnel", num: "dans le coffre" },
    { qui: "Appartement", num: "adresse dans le coffre · réf. reference dans le coffre" },
    { qui: "Caution balise GPS", num: "Swikly réf. reference dans le coffre" }
  ]
};

export default VOYAGE;
