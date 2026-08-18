# MÉMOIRE PROJET — CCC Race Companion

Dernière mise à jour : 18/08/2026

## ÉTAT ACTUEL

- **Phase** : P3 livrée. Cycle de mises à jour de contenu en cours.
- **Écrans livrés** : Préparer (Aujourd'hui · Le sac · Vérifs · Nutrition · Voyage)
  et Courir (Tracé · Pacing · Ravitos · Jour J). Feuille de course imprimable
  recto-verso. Écran « Mes données » (export / import).
- **Écrans en cours** : Journal · Pourquoi tu peux le faire.
- **Bugs connus** : aucun. Zéro erreur console, contraste AA sur les neuf vues
  dans les deux thèmes, cibles tactiles à 44 px, pas de débordement horizontal.
- **Déployé** : https://p-moor.github.io/ccc-hub/carnet/

## DÉCISIONS FIGÉES — ne pas rediscuter

| Date | Décision | Raison |
|---|---|---|
| 16/08 | Statique pur, pas de framework | GitHub Pages, zéro build |
| 16/08 | Ne toucher ni `carnet-ccc.html` ni le Hub | Documents de secours |
| 16/08 | Départ 09:15, vague 2, dossard 4330 | Site officiel, dossards 3832-4582 |
| 16/08 | Les barrières sont des heures absolues | Calées sur la dernière vague, 09:30 + 26h30 |
| 16/08 | Le papier est le livrable du jour J | La batterie du téléphone ne tiendra pas |
| 16/08 | La préparation est le cœur du produit | 12 jours de prépa contre 20 heures de course |
| 16/08 | Charte carte topographique | Choix de Pierre |
| 17/08 | `logistique-data.js` fait foi sur les réservations | Chevauchement avec `voyage-data.js` |
| 18/08 | Merge obligatoire du localStorage | Pierre a déjà saisi des données |
| 18/08 | Aucune consigne de mode avion | Le règlement exige un téléphone allumé et joignable |

## SOURCES DE VÉRITÉ

| Domaine | Fichier |
|---|---|
| Réservations, logement, caution | `logistique-data.js` |
| Déroulé du voyage heure par heure | `voyage-data.js` |
| Séances J-11 → J-0, médecin, carb cycling | `prepa-data.js` |
| Nutrition course, stock, caféine, ravitos | `nutrition-data.js` |
| Checklist matériel, gants, téléphone | `sac-data.js` |
| Météo | `meteo-data.js` |
| Confiance | `confiance-data.js` |
| Pacing, sections, scénarios, profil | `data.js` + `profil.js` |

## RÈGLE TECHNIQUE — l'état de Pierre est sacré

Les modules `*-data.js` définissent la **structure**, le `localStorage` détient
l'**état**. Le chemin de lecture merge par identifiant : un id inconnu vaut
`false`, donc un nouvel item arrive non coché sans toucher aux autres.

`migre()` tourne au démarrage : les identifiants qui n'existent plus sont
**archivés** dans `ccc-v2-orphelins`, jamais supprimés. Numéro de schéma dans
`ccc-v2-schema`.

**Les `id` sont des clés stables. Ne jamais les renuméroter.**

Clés utilisées : `ccc-v2-check` (toutes les cases à cocher, sac + vérifs +
voyage + achats), `ccc-v2-prepa`, `ccc-v2-course`, `ccc-v2-kits`,
`ccc-v2-scenario`, `ccc-v2-theme`, `ccc-v2-simu`, `ccc-v2-schema`,
`ccc-v2-orphelins`, préférences d'affichage, et `ccc-journal-v1` qui est
indépendante et n'est jamais touchée par une mise à jour.

## CE QUI RESTE OUVERT

- Départ du logement à 7h le 30, deux heures avant la fenêtre — **non résolu**
- Taxe de séjour incluse ou à payer sur place — non confirmé
- Aucun numéro de téléphone du partenaire local
- mg de caféine par gel Boost — étiquette à lire
- Verdict chaussures Reveal — test du 19
- Données personnelles dans un dépôt public — décision de Pierre attendue
- Plan de l'Au : pointage seul, à confirmer sur le carnet de course officiel

## JOURNAL DES SESSIONS

### 18/08/2026

- **Fait** : plan de la mise à jour validé. Écran « Mes données » livré :
  export et import JSON, compteurs, migration au démarrage qui archive les
  identifiants orphelins. Aller-retour vérifié : effacement total puis
  restauration, les quatre clés reviennent identiques au caractère près.
  Suppression des deux mentions de « mode avion » dans les commentaires.
- **Reste** : toutes les corrections de contenu du 18/08 (textile, gants,
  nutrition, logement, médecin, carb cycling, météo, téléphone, confiance),
  l'écran Journal, l'écran Pourquoi tu peux le faire.
- **Question ouverte pour Pierre** : décocher `c30` et `v02` une fois ?
  Que fait-on des données personnelles dans un dépôt public ?

- **Fait, deuxième passe** : toutes les corrections de contenu du 18/08 sont
  livrées. `sac-data.js` (RTECH PRO en c30, plan B Asics c30b, Epitact
  conditionnel, chauffe-mains, bol pliable, spork, moufles, les deux longs
  chauds, les quatre paliers de gants, le protocole téléphone en huit points),
  `nutrition-data.js` (inventaire fermé à 29 unités et 974 g, sucré/salé et le
  trou Champex → Trient, répartition des deux sacs, plan caféine à quatre doses
  plus réserve), `prepa-data.js` (médecin déplacé au jeudi 20, quatrième sujet
  mains au froid, carb cycling en neuf jours), `voyage-data.js` (10 h 07,
  retour du dimanche 30), plus `meteo-data.js` et `confiance-data.js`.
- **Nouveaux écrans** : Journal (clé `ccc-journal-v1`, note libre plus pied,
  zone, km, nuit, poids) qui remplace l'onglet Vérifs dans la barre ; les
  vérifications sont repliées dans Le sac. « Pourquoi tu peux le faire » ouvre
  en feuille depuis Aujourd'hui.
- **Migration schéma 2** : `c30` et `v02` décochés une seule fois, les
  identifiants inconnus archivés dans `ccc-v2-orphelins`, jamais effacés.
- **Deux bogues corrigés au passage** : « Où j'en suis » restait vide au
  chargement (`majEtat` n'était appelé qu'après une coche) et la date du
  journal partait d'un jour en arrière (`toISOString` repasse en UTC).
- **Non déployé volontairement** : `logistique-data.js`, qui attend le coffre
  chiffré.
- **Vérifié** : zéro erreur console, zéro échec de contraste AA sur les cinq
  écrans de Préparer, en thème jour et en thème nuit.

### 18/08/2026 — passe de design

Pierre a fourni un export HTML de référence (dashboard santé sombre, violet et
menthe, Manrope, rayons de 24 px) et demandé « un coup de polish sur le design,
inspiré de Whoop, juste l'UI, pas le contenu ».

**Décision prise sans lui, à assumer** : la palette carte topo est conservée.
Elle a été choisie la veille et elle porte l'identité du carnet ; c'est la
GRAMMAIRE de la référence qui a été reprise, pas ses couleurs. Concrètement :

- échelle de rayons nommée (`--r` 18 px, `--r-s` 12, `--r-xs` 9, `--pill`)
  substituée à tous les rayons figés du fichier
- deux niveaux d'ombre (`--ombre`, `--ombre-h`) et un voile de rail (`--voile`)
- lumière rasante en haut de page (`body::after`), très diluée
- les deux moitiés Préparer / Courir deviennent un segmenté à capsule
- la barre d'onglets devient un dock : coins hauts arrondis, flou renforcé,
  pastille d'accent qui grandit sous l'icône active
- chiffres à chasse fixe partout où ils se comparent
- jauges en capsule sans bordure, tuiles de jour à 15 px avec ombre
- l'alerte critique passe de l'encadré 2 px à l'aplat teinté
- la texture topographique baissée d'un cran (0,20 → 0,14 le jour)
- le segmenté s'adapte au nombre de segments (le sac n'en a que deux)

**Deux défauts de rendu corrigés au passage** : le bandeau retour affichait
« undefined » depuis la reconstruction de `voyage-data.js` (il lit maintenant
`resolu` et `renvoi`, et devient un constat vert au lieu d'une alerte rouge) ;
la ligne Réserve du plan caféine écrasait sa colonne de gauche.

**Vérifié** : zéro erreur console ; zéro échec AA et zéro cible sous 44 px sur
les NEUF écrans, en jour et en nuit, plus les trois feuilles. Feuille de course
et impression conservées (rayons ramenés à 8 px sur le papier, halo masqué).
