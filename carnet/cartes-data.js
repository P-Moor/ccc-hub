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
          { p: "Courmayeur",        km: "0",    r: "100,9", c: "09:15", b: "—",     m: "—",    fort: true },
          { p: "⛰️ Tronche 2543",   km: "9,4",  r: "91,5",  c: "~12:05", b: "—",    m: "—" },
          { p: "🍽️ BERTONE",        km: "13,6", r: "87,3",  c: "12:37", b: "13:45", m: "1h08", fort: true },
          { p: "⛰️ Bonatti 2027",   km: "21,2", r: "79,7",  c: "—",     b: "—",     m: "—" },
          { p: "🍽️ ARNOUVAZ",       km: "26,3", r: "74,6",  c: "14:28", b: "16:30", m: "2h01", fort: true },
          { p: "⛰️ Col Ferret 2527", km: "30,9", r: "70,0", c: "~16:00", b: "—",    m: "—",    haut: true },
          { p: "🍽️ LA FOULY",       km: "40,7", r: "60,2",  c: "17:06", b: "20:15", m: "3h08", fort: true },
          { p: "🎒 CHAMPEX",        km: "54,9", r: "46,0",  c: "19:24", b: "23:15", m: "3h50", fort: true },
          { p: "⚠️ Plan de l'Au",   km: "59,8", r: "41,1",  c: "20:24", b: "00:15", m: "3h50", alerte: true },
          { p: "⛰️ La Giète 1885",  km: "66,3", r: "34,6",  c: "—",     b: "—",     m: "—" },
          { p: "🍜 TRIENT",         km: "71,5", r: "29,4",  c: "22:51", b: "04:00", m: "5h08", fort: true },
          { p: "⛰️ Les Tseppes 1936", km: "75,2", r: "25,7", c: "—",    b: "—",     m: "—",    dur: true },
          { p: "☕ VALLORCINE",     km: "82,5", r: "18,4",  c: "01:40", b: "07:15", m: "5h34", fort: true },
          { p: "💧 LA FLÉGÈRE",     km: "93,7", r: "7,2",   c: "04:35", b: "10:45", m: "6h09", fort: true },
          { p: "🏁 CHAMONIX",       km: "100,9", r: "0",    c: "05:30", b: "12:00", m: "6h30", fort: true }
        ],
        alertes: [
          "⚠️ PLAN DE L'AU = POINTAGE SEUL, PAS DE RAVITO",
          "🔴 CHAMPEX → TRIENT = 16,6 km / 3 h 05 SANS RAVITO, DE NUIT"
        ]
      },
      verso: {
        type: "plans",
        titre: "🅱️ Si le pied parle (~23 h)",
        planB: [
          { p: "Bertone",    h: "12:44", m: "1h00" },
          { p: "Arnouvaz",   h: "14:50", m: "1h39" },
          { p: "La Fouly",   h: "17:49", m: "2h25" },
          { p: "Champex",    h: "20:33", m: "2h41", fort: true },
          { p: "Trient",     h: "00:26", m: "3h33" },
          { p: "Vallorcine", h: "03:46", m: "3h28" },
          { p: "La Flégère", h: "07:13", m: "3h31" },
          { p: "🏁 Chamonix", h: "08:15", m: "3h44", fort: true }
        ],
        survieTitre: "🆘 Survie — ne jamais dépasser",
        survie: [
          { p: "Bertone", h: "13:25" }, { p: "Arnouvaz", h: "16:10" },
          { p: "La Fouly", h: "19:55" }, { p: "Champex", h: "22:55" },
          { p: "Plan de l'Au", h: "23:55" }, { p: "Trient", h: "03:40" },
          { p: "Vallorcine", h: "06:55" }, { p: "La Flégère", h: "10:25" },
          { p: "Chamonix", h: "11:40" }
        ],
        cle: {
          titre: "📈 La marge ne fait que grossir",
          chiffre: "1h08 → 6h30",
          txt: "La marge serrée à Bertone est VOULUE."
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
          { n: 10, txt: "☕ CAFÉ N°1 — Ultra Chocolat 35 mg" },
          { n: 11, txt: "🍜 Vrai repas assis — pâtes, riz ou vermicelles" },
          { n: 12, txt: "💧 Remplir Boost + eau À FOND" },
          { n: 13, txt: "🥖 EMPORTER DU SALÉ — pain, TUC, fromage", cle: true,
            alerte: "⚠️ 3 h 05 SANS RAVITO APRÈS" },
          { n: 14, txt: "🍫 Recharger la nutrition depuis le sac" }
        ]
      },
      verso: {
        type: "trient",
        titre: "🍜 TRIENT — 22:51 · 15 min",
        etapes: [
          { n: 1, txt: "🧥 VESTE AVANT DE S'ASSEOIR — non négociable", cle: true },
          { n: 2, txt: "🍲 Soupe ou vermicelles chauds" },
          { n: 3, txt: "☕ CAFÉ N°2 — Peach Tea 100 mg" },
          { n: 4, txt: "💧 Remplir à fond" }
        ],
        mental: "🧠 POINT BAS PRÉVU. C'ÉTAIT ÉCRIT. C'EST NORMAL.",
        cafeineTitre: "☕ Plan caféine",
        cafeine: [
          { n: 1, ou: "Départ Champex",        quoi: "Ultra Chocolat",    mg: 35 },
          { n: 2, ou: "Trient",                quoi: "Peach Tea",         mg: 100 },
          { n: 3, ou: "Vallorcine",            quoi: "Peach Tea",         mg: 100 },
          { n: 4, ou: "Avant la dernière montée", quoi: "Caramel Macchiato", mg: 65,
            note: "vers le km 88, entre Vallorcine et La Flégère" }
        ],
        cafeineRegles: ["⛔ ZÉRO CAFÉINE AVANT CHAMPEX", "⛔ ESPACER DE 2 H MINIMUM"],
        modesTitre: "🍽️ Mode des ravitos",
        modes: [
          { m: "EXPRESS 3-5 min", ou: "Bertone · Plan de l'Au · Flégère" },
          { m: "MOYEN 8-10 min",  ou: "Arnouvaz · La Fouly · Vallorcine" },
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
          titre: "🩸 Tu as 6 h 30 de marge à la Flégère",
          txt: "Tu peux perdre 3 HEURES et finir.",
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
