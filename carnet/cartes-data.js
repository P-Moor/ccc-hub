/**
 * cartes-data.js — les 4 cartes plastifiees, en entier
 * ---------------------------------------------------------------------------
 * Ce ne sont pas des pense-betes de confort. Au ravito, l'attention de Pierre
 * est au plus bas — bruit, monde, froid, fatigue — et c'est precisement la
 * qu'il faut executer une sequence sans en sauter une etape. Une carte
 * plastifiee ne tombe pas en panne de batterie et ne demande pas de
 * deverrouiller un ecran avec des doigts gourds.
 *
 * L'app porte le MEME contenu, mot pour mot. Deux raisons : si une carte se
 * perd ou se detrempe, rien n'est perdu ; et le contenu reste relisible
 * pendant les deux jours qui precedent, quand on repasse le film.
 *
 * Source : CARTES_COURSE_CCC.md, etabli le 23/08, distances officielles UTMB.
 */

export const CARTES = {
  note: "🖨️ Imprimer, découper, plastifier. Format poche, recto-verso.",
  rappel: "⚠️ Le code de la boîte à clés est sur la carte 4. Elle vit dans le sac de course, pas dans une poche extérieure.",

  liste: [
    /* ---------------------------------------------------------------- 1 */
    {
      n: 1, titre: "Pacing", ou: "Poche du RTECH PRO",
      sous: "Où je suis · quand · combien de marge",
      pourquoi: "La seule carte qu'on regarde en marchant. Le km restant y est parce qu'à 3 h du matin, une soustraction mentale est une soustraction ratée.",
      recto: {
        type: "pacing",
        colonnes: ["point", "km", "reste", "cible", "barrière", "marge"],
        lignes: [
          { p: "Courmayeur",        km: "0",    r: "108,8", c: "09:15", b: "—",     m: "—",    fort: true },
          { p: "⛰️ Tronche 2543",   km: "9,4",  r: "99,4",  c: "~11:45", b: "—",    m: "—" },
          { p: "🍽️ BERTONE",        km: "13,6", r: "95,2",  c: "12:37", b: "13:45", m: "1h08", fort: true },
          { p: "⛰️ Bonatti 2027",   km: "21,2", r: "87,6",  c: "—",     b: "—",     m: "—" },
          { p: "🍽️ ARNOUVAZ",       km: "26,3", r: "82,5",  c: "14:28", b: "16:30", m: "2h02", fort: true },
          { p: "⛰️ Col Ferret 2527", km: "30,9", r: "77,9", c: "~15:55", b: "—",    m: "—",    haut: true },
          { p: "🍽️ LA FOULY",       km: "40,7", r: "68,1",  c: "17:06", b: "20:15", m: "3h09", fort: true },
          { p: "🎒 CHAMPEX",        km: "54,2", r: "54,6",  c: "19:24", b: "23:15", m: "3h51", fort: true },
          { p: "⚠️ Plan de l'Au",   km: "59,1", r: "49,7",  c: "20:24", b: "00:15", m: "3h51", alerte: true },
          { p: "🆕 MARTIGNY 507",   km: "69,2", r: "39,6",  c: "22:00", b: "02:15", m: "4h15", fort: true },
          { p: "🍜 TRIENT",         km: "79,3", r: "29,5",  c: "01:00", b: "06:00", m: "5h00", fort: true },
          { p: "⛰️ Les Tseppes 1936", km: "83,1", r: "25,7", c: "—",    b: "—",     m: "—",    dur: true },
          { p: "☕ VALLORCINE",     km: "90,4", r: "18,4",  c: "03:50", b: "07:15", m: "3h25", fort: true, alerte: true },
          { p: "💧 LA FLÉGÈRE",     km: "101,6", r: "7,2",  c: "06:45", b: "10:45", m: "4h00", fort: true, alerte: true },
          { p: "🏁 CHAMONIX",       km: "108,8", r: "0",    c: "07:40", b: "12:00", m: "4h20", fort: true, alerte: true }
        ],
        alertes: [
          "⚠️ PLAN DE L'AU = POINTAGE SEUL, PAS DE RAVITO",
          "🔴 CHAMPEX → MARTIGNY = 15,0 km SANS RAVITO, DE NUIT",
          "⛔ APRÈS TRIENT LA MARGE FOND : les 3 dernières barrières n'ont PAS bougé, mais tu y arrives 2h10 plus tard"
        ]
      },
      verso: {
        type: "plans",
        titre: "🅱️ Si le pied parle (~25 h 30)",
        planB: [
          { p: "Bertone",    h: "13:04", m: "0h41", fort: true },
          { p: "Arnouvaz",   h: "15:11", m: "1h19" },
          { p: "La Fouly",   h: "18:10", m: "2h05" },
          { p: "Champex",    h: "20:47", m: "2h28" },
          { p: "Martigny",   h: "23:44", m: "2h31" },
          { p: "Trient",     h: "03:08", m: "2h52" },
          { p: "Vallorcine", h: "06:21", m: "0h54", fort: true },
          { p: "La Flégère", h: "09:40", m: "1h05" },
          { p: "🏁 Chamonix", h: "10:43", m: "1h17" }
        ],
        survieTitre: "🆘 Survie — ne jamais dépasser",
        survie: [
          { p: "Bertone", h: "13:25" }, { p: "Arnouvaz", h: "16:10" },
          { p: "La Fouly", h: "19:55" }, { p: "Champex", h: "22:55" },
          { p: "Plan de l'Au", h: "23:55" }, { p: "Martigny", h: "01:55" },
          { p: "Trient", h: "05:40" }, { p: "Vallorcine", h: "06:55" },
          { p: "La Flégère", h: "10:25" }, { p: "Chamonix", h: "11:40" }
        ],
        cle: {
          titre: "📈 Deux points de coupe, pas un",
          chiffre: "1h08 · puis 3h25",
          txt: "La marge grossit jusqu'à Trient (5h00), PUIS ELLE FOND : Vallorcine, la Flégère et Chamonix ont gardé leur barrière alors que tu y arrives 2h10 plus tard. Bertone reste le premier verrou. En plan B, Vallorcine devient le second, à 54 min."
        }
      }
    },

    /* ---------------------------------------------------------------- 2 */
    {
      n: 2, titre: "Champex", ou: "Sac de Champex",
      sous: "Le protocole, dans l'ordre",
      pourquoi: "Champex est le seul arrêt long. C'est là qu'on oublie quelque chose, et c'est là que ça coûte le plus cher. Une liste numérotée, on la suit sans réfléchir.",
      recto: {
        type: "protocole",
        titre: "🎒 CHAMPEX — 19:24",
        sousTitre: "15-20 min · pas plus",
        etapes: [
          { n: 1,  txt: "🧥 VESTE CHAUDE AVANT DE S'ASSEOIR", cle: true },
          { n: 2,  txt: "🪑 S'asseoir pour de vrai — une chaise" },
          { n: 3,  txt: "👟 Chaussures ET chaussettes enlevées" },
          { n: 4,  txt: "🦵 Pieds surélevés 2-3 min" },
          { n: 5,  txt: "🧻 SÉCHER LES PIEDS (microfibre)", cle: true },
          { n: 6,  txt: "💆 Masser AUTOUR de la bosse, jamais dessus" },
          { n: 7,  txt: "🧴 NOK · 🧦 chaussettes sèches" },
          { n: 8,  txt: "🔗 Relacer HEEL-LOCK — desserrer l'avant si gonflé" },
          { n: 9,  txt: "🔦 FRONTALE SUR LA TÊTE", cle: true },
          { n: 10, txt: "☕ CAFÉINE 35 mg — Ultra Chocolat" },
          { n: 11, txt: "🍜 Vrai repas assis — pâtes, riz ou vermicelles" },
          { n: 12, txt: "💧 Remplir Boost + eau À FOND" },
          { n: 13, txt: "🥖 EMPORTER DU SALÉ — pain, TUC, fromage", cle: true,
            alerte: "⚠️ 15,0 km SANS RAVITO APRÈS, DE NUIT — et services incertains à Martigny" },
          { n: 14, txt: "🍫 Recharger la nutrition — 3 UNITÉS DE PLUS qu'au plan initial", cle: true }
        ]
      },
      verso: {
        type: "trient",
        titre: "🍜 TRIENT — 01:00 · 15 min",
        etapes: [
          { n: 1, txt: "🧥 VESTE AVANT DE S'ASSEOIR — non négociable", cle: true },
          { n: 2, txt: "🍲 Soupe ou vermicelles chauds" },
          { n: 3, txt: "☕ CAFÉINE 100 mg — Peach Tea" },
          { n: 4, txt: "💧 Remplir à fond" },
          { n: 5, txt: "⛔ NE TRAÎNE PAS — c'est ici que la marge cesse de grossir", cle: true,
            alerte: "Vallorcine, la Flégère et Chamonix ont gardé leur barrière" }
        ],
        mental: "🧠 POINT BAS PRÉVU. C'ÉTAIT ÉCRIT. C'EST NORMAL.",
        cafeineTitre: "☕ Plan caféine",
        cafeine: [
          { n: 1, ou: "Départ Champex 19:24",  quoi: "Ultra Chocolat",    mg: 35 },
          { n: 2, ou: "Martigny 22:00",        quoi: "Caramel Macchiato", mg: 65,
            note: "🆕 AVANT la remontée de 1 082 m, pas après" },
          { n: 3, ou: "Trient 01:00",          quoi: "Peach Tea",         mg: 100 },
          { n: 4, ou: "Vallorcine 03:50",      quoi: "Peach Tea",         mg: 100 }
        ],
        cafeineRegles: ["⛔ ZÉRO CAFÉINE AVANT CHAMPEX", "⛔ ESPACER DE 2 H MINIMUM"],
        modesTitre: "🍽️ Mode des ravitos",
        modes: [
          { m: "EXPRESS 3-5 min", ou: "Bertone · Plan de l'Au · Flégère" },
          { m: "MOYEN 8-10 min",  ou: "Arnouvaz · La Fouly · Martigny · Vallorcine" },
          { m: "GRAND ARRÊT",     ou: "Champex 15-20 · Trient 15", fort: true }
        ],
        modesNote: "🦶 +10 MIN si douleur pied — sans négocier"
      }
    },

    /* ---------------------------------------------------------------- 3 */
    {
      n: 3, titre: "Ça va mal", ou: "Poche du RTECH PRO",
      sous: "Les 5 règles, et l'arbre de décision",
      pourquoi: "Elle ne sert qu'une fois, peut-être jamais. Mais au moment où elle sert, on n'est plus en état de raisonner.",
      recto: {
        type: "regles",
        titre: "🧭 Les 5 règles",
        regles: [
          { n: 1, t: "🥾 MARCHE TOUTES LES MONTÉES", s: "Bâtons dès le km 1" },
          { n: 2, t: "⏱️ MONTÉE 1 À 450-480 m/h", s: "FC < 145 · Des gens te doublent, tant mieux" },
          { n: 3, t: "🍫 UNE PRISE = MANGER ET BOIRE", s: "Ça vibre → tu manges. Immédiatement." },
          { n: 4, t: "🦶 DOULEUR OSSEUSE → TU RALENTIS", s: "TU N'ABANDONNES PAS", cle: true },
          { n: 5, t: "🪑 MAL AU RAVITO → CHAUSSURES OFF, 10 MIN", s: "Sans négocier" }
        ],
        marge: {
          titre: "🩸 Tu as 4 h 00 de marge à la Flégère",
          txt: "Moins qu'avant le 27/08 — la barrière n'a pas bougé, mais la course s'est allongée de 2 h. Ça reste 4 HEURES à perdre et finir quand même.",
          devise: "SOUFFRIR OU RALENTIR. JAMAIS SOUFFRIR OU ABANDONNER."
        }
      },
      verso: {
        type: "arbre",
        titre: "🦶 Arbre de décision — le pied",
        branches: [
          { c: "vert", t: "🟢 BRÛLURE, même forte", a: "→ CONTINUER",
            d: "Soins au prochain grand arrêt" },
          { c: "orange", t: "🟠 DOULEUR OSSEUSE qui MONTE d'un ravito à l'autre", a: "→ RALENTIR délibérément",
            d: "Bâtons partout · marcher les descentes. La marge absorbe 3 heures." },
          { c: "rouge", t: "🔴 DOULEUR VIVE À CHAQUE APPUI ou BOITERIE NON CONTRÔLÉE", a: "→ POSTE MÉDICAL au ravito suivant",
            d: "Arnouvaz · La Fouly · Champex · Trient · Vallorcine · Flégère" }
        ],
        signal: "⚠️ C'est la BOITERIE le signal rouge. Pas la douleur.",
        chaussettes: {
          titre: "🧦 Chaussettes",
          depart: "Départ : Sidas Trail DOUBLE",
          garde: "🔥 Friction diffuse → JE GARDE",
          change: "🦴 Serrement bord externe → JE CHANGE",
          ou: "Paire Trail Protect dans le sac · changement au prochain ravito où on peut s'asseoir"
        },
        analgesie: {
          titre: "⚠️ L'analgésie du jour J",
          txt: "L'adrénaline monte ton seuil de douleur. Tu sentiras MOINS. Ça n'abîmera pas MOINS. Pilote à la montre et au protocole."
        }
      }
    },

    /* ---------------------------------------------------------------- 4 */
    {
      n: 4, titre: "Contacts", ou: "Sac de course",
      sous: "Urgences · codes · après l'arrivée",
      pourquoi: "Le verso est le vrai sujet : rendre la balise le samedi, après vingt heures de course. 155 € et aucun rattrapage possible.",
      recto: {
        type: "contacts",
        titre: "📞 Urgences",
        aEcrire: {
          quoi: "🚨 ORGANISATION CCC",
          txt: "au dos du dossard — à écrire le 27, au retrait"
        },
        prive: "🔒 Contact perso, logement et code de la boîte à clés : dans le coffre, onglet Voyage.",
        codeNote: "🔑 Le code de la boîte à clés figure sur la carte imprimée, pas ici : cette page est publique."
      },
      verso: {
        type: "arrivee",
        titre: "🏁 Après l'arrivée",
        liste: [
          "Se couvrir IMMÉDIATEMENT",
          "Boire · manger",
          "Chaussures off · inspecter les pieds",
          "🎒 Récupérer le sac d'allègement"
        ],
        balise: {
          txt: "🛰️ RENDRE LA BALISE GPS — SAMEDI",
          ou: "Centre Sportif Richard Bozon",
          enjeu: "155 €",
          note: "Tu pars le 30 à 7h30 : aucun rattrapage. Mets une alarme."
        }
      }
    }
  ]
};

export default CARTES;
