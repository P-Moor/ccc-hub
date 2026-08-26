# MÉMOIRE PROJET — CCC Race Companion

Dernière mise à jour : 24/08/2026 (v35)

## ÉTAT ACTUEL

- **Phase** : PILOTAGE. À J-5, plus aucune décision n'est ouverte — l'app ne
  sert plus à préparer mais à exécuter.
- **Écrans livrés** : Préparer (Aujourd'hui · Le sac · Vérifs · Nutrition · Voyage)
  et Courir (Tracé · Pacing · Ravitos · Jour J). Feuille de course imprimable
  recto-verso. Écran « Mes données » (export / import).
- **Écrans en cours** : aucun. Tous les blocs demandés sont livrés.
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
| 20/08 | Prévision météo en ligne, pas hors ligne | Bonus réseau. Le carnet répond toujours sans réseau |
| 22/08 | Une seule carte météo, l'API prime | Deux blocs se contredisaient sur les mêmes points |
| 22/08 | L'estampille du coffre est découplée de la version de l'app | Sinon chaque livraison faisait croire à un coffre périmé |
| 22/08 | La phrase de passe passe par STDIN, jamais en argument | Un argument est lisible dans la table des processus |
| 23/08 | Chaussettes : Sidas Trail DOUBLE au départ | Test du 22, 10,2 km en conditions dures, aucun serrement |
| 23/08 | Lampe de secours = 2ᵉ Swift RL | Mêmes réglages, batteries interchangeables : un seul geste à connaître |
| 23/08 | Les chauffe-mains sont écartés | Introuvables hors saison. Le froid se traite aux paliers de gants |
| 23/08 | Fibres réduites dès le mardi 25 | Plus progressif qu'une coupure la veille |
| 23/08 | Carte vectorielle depuis le GPX, pas d'iframe UTMB | La map de montblanc.utmb.world est un iframe track.utmb.world : réseau + cookies obligatoires |
| 23/08 | Le fond topographique est optionnel et hors ligne par défaut | Même règle que la météo : bonus réseau, son absence ne casse rien |
| 24/08 | Le GPX OFFICIEL UTMB fait foi — 100,9 km / 6 050 m | Il porte les 15 points et leurs distances : plus rien à recaler |
| 24/08 | Réseau d'abord pour le code, cache d'abord pour le reste | Pierre a vu trois fois une version périmée |
| 24/08 | ⛔ Jamais de comptage ni de bilan de repas dans l'app | Elle affiche le PLAN, pas une note. Voir `VIGILANCE_NUTRITION` |

## SOURCES DE VÉRITÉ

| Domaine | Fichier |
|---|---|
| Réservations, logement, caution | `logistique-data.js` |
| Déroulé du voyage heure par heure | `voyage-data.js` |
| Séances J-11 → J-0, médecin, carb cycling | `prepa-data.js` |
| Nutrition course, stock, caféine, ravitos | `nutrition-data.js` |
| Checklist matériel, gants, téléphone | `sac-data.js` |
| Météo, analyse de fond | `meteo-data.js` |
| Météo, les 13 points et les seuils | `meteo-points.js` |
| Trace GPS pour la carte | `trace.js` — généré, ne pas éditer |
| **Le parcours : 15 points officiels** | `parcours-data.js` — fait foi depuis le 24/08 |
| Les 4 cartes plastifiées | `cartes-data.js` |
| Dossiers fermés du 18 au 20 | `maj20-data.js` |
| Dossiers fermés du 21 au 23, kits, Fenix, sang | `maj23-data.js` |
| Sachets zip (`KITS`) | `sac-data.js` |
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

Au 23/08, **plus aucune décision produit n'est ouverte**. Tous les dossiers
matériel, nutrition et médical sont fermés. Ne restent que des GESTES, tous
dans le coffre sous `aRegler` avec leur échéance :

- 🔴 **Linge** — appeler Lamy lundi 24 à 9h30. Draps et serviettes non inclus.
  Décision lundi soir, le départ est mardi. C'est le dernier point ouvert.
- 🔴 **Taxe de séjour 16 €** — virement + confirmation par mail, avant mardi 25.
- 🔴 **Balise GPS** — à rendre le samedi 29 au Centre Bozon. 155 €. Départ le 30
  à 7h30, donc aucun rattrapage. Alarme posée.
- Télécharger le ticket Alpine Fleet hors ligne · prévenir l'hôtel de l'heure
  d'arrivée · protéger les bâtons pour la soute.

**Côté dépôt**, un point reste non refermé : les anciens SHA restent visibles
dans l'API publique d'événements de GitHub pendant ~90 jours. Seul un
delete + recreate du dépôt le ferme, et le jeton `gh` n'a pas `delete_repo` :
c'est un geste que Pierre doit faire lui-même.

## LE COFFRE

`prive-data.js` est deploye et PUBLIC : il ne contient que du chiffre.
Le clair vit dans `_logistique-clair.js`, qui reste sur le Mac et ne sort
jamais. Le trait de soulignement est la convention du projet pour tout ce qui
ne se deploie pas (`_gen_profil.py`, `_audit.js`, `_chiffrer.html`), et
`deploy_carnet.py` refuse desormais tout fichier qui commence par un `_`.

Pour remplir ou regenerer le coffre : ouvrir `_chiffrer.html` depuis un serveur
local, saisir la phrase de passe, telecharger le `prive-data.js` produit, le
mettre a la place de l'actuel, puis deployer.

PBKDF2-SHA256 a 1 000 000 de tours, puis AES-GCM 256. La phrase de passe n'est
ecrite nulle part : ni dans le depot, ni dans une conversation, ni dans le
localStorage. Le coffre s'ouvre en memoire vive et se referme au rechargement.

La seule vraie protection est la FORCE DE LA PHRASE : le fichier est
telechargeable par n'importe qui, donc une attaque hors ligne peut essayer
autant de phrases qu'elle veut. Quatre ou cinq mots sans rapport.

## SI TU NE VOIS PAS UN CHANGEMENT

Le service worker sert le cache d'abord. Une nouvelle version n'arrive qu'au
deuxieme lancement. Depuis le 18/08 un bandeau le dit et propose de recharger,
et l'ecran Mes donnees porte le numero de version avec un bouton qui vide le
cache. C'est la premiere chose a regarder.

## REGENERER LE COFFRE

`printf '%s\n' "<phrase>" | python3 scratchpad/coffre.py "<indice>"`.
⚠️ **La phrase passe par STDIN, jamais en argument** (depuis le 22/08) : un
argument de ligne de commande est lisible par tout processus de la machine et
reste dans l'historique du shell. Sans stdin, le script demande la phrase sans
l'afficher. `verif_coffre.py` relit ce qui a été publié et le déchiffre pour
vérification. Le script lit
`_logistique-clair.js` et tout `_docs/`, chiffre, et ecrit `prive-data.js` et
`prive-docs.js`. Huit secondes. Il refuse une phrase de moins de quatre mots et
tout nom de fichier contenant un numero.

## AJOUTER UN DOCUMENT

Bouton dans le coffre, sur chaque fiche et en libre. Le fichier est reduit s'il
s'agit d'une image, chiffre avec la meme phrase, et garde dans le navigateur
(IndexedDB). **Il ne part jamais dans le depot public.** C'est la que doit aller
la copie de la carte d'identite.

## LE COFFRE EST REMPLI

Sept documents chiffres, deployes le 18/08. La phrase de passe a ete choisie
par Claude a la demande de Pierre, qui voulait les documents dans l'app tout de
suite. Elle est changeable en deux minutes : un passage dans `_chiffrer.html`,
puis remplacer `prive-data.js` et `prive-docs.js`.

**Le NOM des fichiers reste en clair dans `prive-docs.js`.** Ne jamais y mettre
un numero de reservation. Quatre noms ont du etre neutralises avant le
deploiement pour cette raison.

## LES DOCUMENTS

Le coffre porte treize fiches de documents (`documents` dans le clair) : navette
CCC, creneau dossard, materiel obligatoire, Eurostar, TGV, billets PDF, FlixBus
aller, logement, caution, assurance, FlixBus retour, vol, carte d'identite.

Chaque fiche porte trois choses : les REFERENCES en clair, pour s'en sortir sans
reseau ; le lien vers le MAIL d'origine ; le lien vers la SOURCE (site,
telechargement, import dans l'app du transporteur). Le fichier lui-meme est
facultatif : quand il est depose, il vit dans `prive-docs.js`.

Les fichiers d'origine sont dans `carnet/_docs/` sur le Mac, jamais deployes.

Pour ajouter ou remplacer un document : `_chiffrer.html`, glisser-deposer, la
fiche se rattache par le nom de fichier (cle `fichier`). Deux fichiers sortent,
`prive-data.js` et `prive-docs.js`, chiffres avec la MEME cle : une seule phrase
ouvre tout. L'app ne charge `prive-docs.js` que si le coffre est ouvert.

Les images s'affichent en pleine largeur sur fond blanc, scannables. **Les PDF
ne s'affichent pas de facon fiable dans un cadre embarque**, ni dans le
navigateur de preview ni sur iOS : ils s'ouvrent en plein ecran. Quand le QR
compte, preferer une IMAGE (les mails SNCB et FlixBus fournissent les deux).

## L'HISTORIQUE GIT

Reecrit et pousse le 18/08. Les 123 commits gardent messages, dates et arbre de
travail ; 13 blobs sur 324 ont ete nettoyes. Plus aucune des quinze chaines
sensibles n'apparait nulle part dans l'historique, verifie sur un clone frais.

Methode : `git fast-export --all` puis un filtre Python sur les seuls blocs
`data`, puis `git fast-import` dans un depot neuf, puis `push --force`.

Reste ouvert : les anciens SHA sont encore annonces par l'API publique des
evenements GitHub pendant environ 90 jours. Seule une suppression-recreation du
depot fermerait ce trou, et elle demande les mains de Pierre.

## JOURNAL DES SESSIONS

### 20/08/2026 — Meteo automatique, point par point

- L'app va chercher la prevision du 28 sur **Open-Meteo** (gratuit, sans cle)
  pour les **13 points du parcours**, chacun **A SON ALTITUDE**. C'est le
  parametre `elevation` qui fait tout : sans lui on lirait la meteo du fond de
  vallee. Au Grand Col Ferret, 2 529 m, l'ecart depasse 6 degres.
- L'heure lue est celle du **passage prevu par le scenario actif**. La serie
  horaire complete est gardee en cache, donc basculer de A a C decale les
  heures sans redemander quoi que ce soit au reseau.
- **Le carnet reste utilisable hors ligne** : la prevision est un bonus en
  ligne. Cache dans `ccc-v2-meteo-prevue`, affiche avec son age, et hors ligne
  on montre le dernier releve connu. Rien ne casse sans reseau.
- L'app dit ce que la prevision IMPOSE, pas seulement les chiffres : gants
  sous 5 degres ressentis, veste accessible au-dela de 50 % de pluie, veste au
  col au-dela de 50 km/h de rafales, et l'orage en rouge.
- Un bandeau rappelle qu'a plus de sept jours une prevision ne vaut rien.

### 20/08/2026 — Les trois inconnues sont fermees

- **Chaussures : REVEAL VALIDEE.** Test #2 le 19 sous pluie battante, 13 km,
  pieds trempes 1h20, zero brulure. Detail cle : le lacage a du etre RESSERRE,
  le pied ne gonflait pas. Lendemain : bord externe a zero, peau intacte.
  Nouveau module maj20-data.js, ecran « dossier ferme » dans Le sac.
- **Colchicine : MAINTENUE le jour J**, avis medecin du 20. Antihistaminique
  non sedatif prescrit ; ordonnance a retirer avant le 25. Trousse complete.
- **Cafeine : 35 / 65 / 100 mg**, deja dans le plan.
- Les trois inconnues affichent leur reponse et « regle le N » ; ce que Pierre
  a saisi lui-meme dans l'app garde la priorite sur la reponse par defaut.
- **Nouveaux dossiers** : la VESTE ne deperle plus (protocole Nikwax en 5
  etapes, week-end du 22-23) ; LAMPES figees (Swift RL : 6 h de charge, la
  faire le 27 en journee) ; BALISE a rendre le SAMEDI 29 au Centre Sportif
  Richard Bozon, en recuperant le sac (caution 155 €).
- **Logement RESOLU** par Sylvain Lazaille (Lamy) le 20 a 09h14 : boite a cles,
  code et contact DANS LE COFFRE. Deux nouveautes : linge de lit NON INCLUS
  (question posee), taxe de sejour 16 € par virement avant le 25.
- **Menus J-3 a J-0** dans Nutrition, avec la nuit d'hotel du 25 (kitchenette).
- **Deux GPX generes** dans assets/ depuis le GPX officiel : 13 waypoints
  (ravitos + sommets, recommande) et 9. Chaque point porte sa consigne.
  Positions verifiees : le plus long troncon tombe de 16,5 a 11,5 km.
- **Physio 17-20** dans Aujourd'hui : le readiness a 28 du jeudi ne mesure que
  la duree de sommeil, pas l'etat reel. ACWR 0,8, TSB +108.
- Items c36 a c39 : batterie Swift commandee, piles AAA a acheter, linge de
  lit, veste a retraiter. Meme regle : ids stables, coches intactes.

### 18/08/2026 — Correctif chaussettes

- **Erreur trouvee** : la chaussette validee etait notee « BV Sport Trail Ultra 2
  Mid » depuis le debut des modules. C'est FAUX.
- **Correction** : ce sont les **Sidas Trail Protect**, ref. CSORUTPROT20_BKWH,
  2 paires. Preuve : 25,4 km, 1 195 m D+, jusqu'a 30,8 °C le 15/08, brulure
  quasi nulle, avec Reveal et lacage heel-lock.
- **Ajout** : Sidas Trail Double en candidate (ref. CSORUTDBLE24_BKTU, 1 paire),
  test le 22/08. Hypothese : plus d'amorti donc moins de friction. Risque
  inverse : l'epaisseur reduit le volume et peut aggraver la compression
  laterale sur un pied gonfle. Decision le 27 au soir.
- **Portee reelle du correctif** : il annoncait `sac-data.js` et `prepa-data.js`,
  mais `data.js` portait encore « Chaussettes Injinji » a TROIS endroits
  (`cf2`, `sc1`, et la liste du sac de Champex), et les notes de Pierre dans le
  coffre aussi. Tout est corrige.
- **Les notes du coffre sont un archive** : la ligne fausse est corrigee mais la
  correction est datee et visible (« corrige le 18/08 au soir, etait note
  BV Sport »). On ne reecrit pas silencieusement ce que Pierre a ecrit.
- **Lecon** : les references materiel derivent de conversation en conversation.
  Toute reference produit doit etre confirmee par Pierre avant d'etre figee.
- **BV Sport reste correct pour le HAUT** (RTECH PRO, `c30`). Ne pas
  sur-corriger : cinq mentions doivent subsister.
- **Aucun compteur remis a zero** : `c21` change de libelle mais garde son id,
  `c21b` arrive vierge, SCHEMA reste a 2, aucun orphelin. Verifie en semant un
  etat coche avant rechargement.


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

---

## SESSION DU 22-23 AOÛT

### La météo, fusionnée (v30)

Deux cartes météo se contredisaient sur les mêmes points : la prévision
Open-Meteo et un profil d'altitude figé à la main. Elles n'en font plus qu'une.

- l'API passe devant, le profil statique devient un **repli hors ligne** et se
  présente comme une normale de saison, pas comme une prévision
- l'analyse de fond (historique 2023-2025, l'enseignement, l'orage, le gel)
  descend dans un `<details>` : elle reste vraie, elle ne passe plus devant
- résumé en trois chiffres avant le tableau — le plus froid, le plus chaud,
  la pluie max, chacun avec son lieu et son heure
- **moteur de conseils réécrit** : dix règles, chacune ancrée sur un point
  nommé et une heure, branchées sur le matériel réel de Pierre
- `SEUILS` ne porte plus que les nombres : un seul endroit à corriger

### Le QR du créneau dossard

La fiche `doc-dossard` existait sans pièce jointe. Le QR de confirmation
(27/08, 12h-14h, Espace Michel Croz) y est maintenant. `coffre.py` lit la
phrase sur stdin, et `gcm_dechiffre` permet de relire ce qui a été publié.
Retiré du pied de la visionneuse : « il reste lisible en mode avion », qui
violait la règle du 18/08.

### La MAJ du 23 — l'app bascule en pilotage (v31)

**Tous les dossiers sont fermés.** Le bloc « Non tranché » affiche désormais un
état vide explicite plutôt qu'une carte blanche — une carte vide fait douter
d'un bug, une phrase ferme la question.

| Ce qui a changé | Où |
|---|---|
| Chaussettes : Trail DOUBLE au départ, Protect en secours | `sac-data.js`, `data.js`, `prepa-data.js`, `maj20-data.js` |
| Lampe de secours : 2ᵉ Swift RL, plus d'Aria ni de piles AAA | `maj20-data.js`, `sac-data.js`, `data.js` |
| Chauffe-mains écartés | `sac-data.js` + le moteur météo qui les citait |
| Baouw écartés — le trou Champex→Trient n'est plus couvert | `nutrition-data.js` |
| Veste traitée, ⚠️ séchage à l'air (l'étiquette interdit le sèche-linge) | `maj20-data.js` |
| Fibres réduites dès le mardi 25 | `maj20-data.js` |
| Physio 21-23, dont VFC 94 et 147 min de profond | `maj20-data.js` |

**Nouveaux blocs** (`maj23-data.js` + `KITS` dans `sac-data.js`) :
`CHANGEMENTS` (l'ancien barré à côté du neuf), `GESTION_COGNITIVE`,
`MONTRE` (chemins de menu Fenix mot pour mot), `PRISE_DE_SANG`, `KITS`.

**Coffre enrichi** : hôtel YUST Liège, bloc des 4 codes en tête, le linge en
point ouvert, responsabilité civile, règles de séjour, Alpine Fleet au Parking
l'Outa avec le bouton Track, `aRegler` avec échéances et lignes closes barrées.
Le dossier logistique complet de Pierre y est aussi, comme document.

### Deux pièges rencontrés, à ne pas refaire

1. **Découper un tableau JS sur `s.index(']')` coupe au mauvais crochet** dès
   qu'une entrée contient elle-même un tableau (`impacte:["c28"]`). Le fichier
   reste syntaxiquement plausible et l'erreur ne sort qu'au chargement du
   module. Toujours vérifier le fichier produit, pas seulement le remplacement.
2. **Renommer une clé de données casse le rendu en silence.** `chaussettes.validee`
   est devenu `chaussettes.depart` : `traceChaussettes` lisait toujours
   `validee.modele` et faisait tomber tout `init()` après lui. Après chaque
   renommage, grep le rendu pour les anciennes clés.

**Vérifié** : zéro erreur console ; zéro échec AA et zéro cible sous 44 px sur
les NEUF écrans, en jour comme en nuit ; aucun débordement horizontal ; le
coffre se rouvre et le QR déchiffré est identique octet pour octet à la source.

---

## LA CARTE, ET UNE ERREUR QU'ELLE A RÉVÉLÉE (23/08, v32)

### Ce que la page UTMB contient vraiment

`montblanc.utmb.world/races/ccc` n'héberge pas de carte : elle intègre deux
`<iframe>` vers `track.utmb.world`, qui exigent réseau ET cookies. Rien à
reprendre. En revanche son tableau officiel confirme les **neuf barrières du
carnet, toutes exactes**, et que **Plan de l'Au (59,8 km, samedi 00:15) est bien
un point de barrière** — question restée ouverte depuis le début.

Écarts de kilométrage à connaître : l'officiel annonce 100,9 km / 6 015 m D+,
le carnet 101,5 / 6 062. Les nôtres viennent du GPX, donc de ce que la montre
affichera. On les garde.

### La carte, dessinée depuis le GPX

`trace.js` : 911 points, 32 Ko, produits par `scratchpad/gen_trace.py` depuis
les 9 064 points du GPX officiel. Les distances sont **recalées par morceaux
sur les 9 repères du carnet** (les 9 ancres tombent à 0 m d'écart), donc un
kilomètre veut dire la même chose sur la carte, dans le profil, dans le pacing
et dans la météo.

La carte est un SVG pur : trace colorée jour/nuit selon le scénario actif, les
13 points de passage, pincement et déplacement sur la viewBox, et un curseur
qui donne **l'heure, le km, l'altitude et la météo du moment**. Le fond
topographique OpenTopoMap est optionnel, chargé seulement si Pierre le demande
et s'il y a du réseau.

### 🔴 L'erreur que la carte a révélée

En posant le curseur sur le Grand Col Ferret, l'altitude affichée était 1 943 m
au lieu de 2 529. Vérification des 13 points contre la trace : **deux sommets
étaient mal placés dans `meteo-points.js`.**

| Point | Avant | Après |
|---|---|---|
| Grand Col Ferret | km 37,0 · 1 944 m réels | **km 30,9 · 2 529 m** |
| Tête aux Vents | km 90,0 · 1 586 m réels | km 89,3 · 1 710 m |

Le Grand Col Ferret était lu **six kilomètres après le col, dans la descente
vers La Fouly** : la météo du point le plus exposé de la course arrivait 40 min
trop tard et 585 m trop bas, soit environ 4 °C d'écart. C'est ce point qui
déclenche le conseil « rafales » — il était calculé au mauvais endroit depuis
la v29.

⚠️ **Réserve à lever** : la Tête aux Vents réelle est vers 2 130 m, or ce GPX
ne dépasse pas 1 864 m entre Vallorcine et La Flégère. Soit le GPX diffère du
tracé final sur cette section, soit le point porte un autre nom. La valeur
retenue est le sommet réel de la montée DANS CE GPX. À vérifier sur le carnet
de course officiel au retrait du dossard.

### Deux pièges techniques, notés pour la suite

1. **Les coordonnées Mercator au zoom 18 valent 34 millions** — au-delà de
   2^24, la limite de précision d'un float32. Le `<path>` s'affichait mais les
   `<circle>` atterrissaient à 66 000 px de leur place. Correctif : une origine
   locale soustraite au tracé, aux pastilles ET aux tuiles.
2. **`setPointerCapture` doit venir APRÈS l'enregistrement du doigt.** Il peut
   lever, et le second doigt n'était alors jamais compté : le pincement
   retombait en simple déplacement, sans zoom.

Le cache de prévisions porte maintenant une **signature `km:alt`** du jeu de
points : déplacer un point périme automatiquement les relevés faits sur les
anciennes coordonnées, sans que Pierre ait à le savoir.

---

## LE GPX OFFICIEL REMPLACE TOUT (24/08, v34)

L'UTMB a publié `ccc_100km_universal.gpx` avec les **15 points intégrés** et
les distances encodées dans le fichier. Il remplace le GPX tiers dont je me
servais. **Conséquence : plus aucun recalage.** Avant, on rapprochait un tracé
étranger des repères du carnet ; maintenant le tracé EST la référence et le
carnet s'y aligne.

`scratchpad/gen_officiel.py` produit `trace.js` et `profil.js` depuis ce seul
fichier, et remplace `gen_trace.py` et `gen_profil.py`.

**100,9 km / 6 050 m D+** (et non 101,5 / 6 062). Le D+ par segment est calculé
sur le tracé avec un seuil de 2,5 m qui filtre le bruit altimétrique ; il
retombe à un ou deux mètres près sur ce qu'annonce l'UTMB pour chaque montée.

### Trois sommets ont retrouvé leur nom

| Avant | Maintenant | Pourquoi ça compte |
|---|---|---|
| — | **Refuge Bonatti** 21,2 km | Balcon roulant : c'est là qu'on mange en marchant |
| « Bovine » 65,1 km | **La Giète** 66,3 km · 1 885 m | C'est le nom sur les panneaux |
| « Catogne » 77,0 km | **Les Tseppes** 75,2 km · 1 936 m | +647 m sur 3,8 km = **17 %**, la plus raide, vers 23 h |

« Tête aux Vents » disparaît : le point était à 93,7 km, c'est-à-dire La
Flégère, qui est un ravito. La réserve notée le 23/08 est donc levée.

**Colonne « km restant »** partout où un point s'affiche — vue Ravitos et
curseur de la carte. À 3 h du matin, une soustraction mentale est une
soustraction ratée.

## LE SERVICE WORKER, ENFIN (24/08, v33)

Pierre a vu **trois fois de suite** une version périmée. Deux bugs :

1. `skipWaiting()` était appelé dans `install`. Le nouveau worker n'atteignait
   donc jamais l'état `waiting`, et le bandeau « nouvelle version », qui
   cherche `reg.waiting`, ne pouvait pas se déclencher.
2. Cache d'abord pour tout. Le code va maintenant chercher le **réseau
   d'abord**, 1,5 s de délai, cache en secours.

⚠️ **Le piège qui a fait échouer le premier correctif** : le `fetch` du worker
recevait le cache HTTP DU NAVIGATEUR, une couche distincte de celle du SW. Il
faut `new Request(req, { cache: 'reload' })`. Sans ça on croit aller au réseau
et on reçoit la même vieille réponse.

Vérifié : témoin posé dans `app.js` → visible en UN rechargement ; serveur
d'aperçu **arrêté** → l'app se charge entièrement depuis le cache.

## CE QUI EST ARRIVÉ LE 24

- ⌚ **Fenix configurée** : alerte 30:00, FC 145, ascension auto coupée,
  ClimbPro manuel. Restent 4 gestes, cochables, dont désactiver les **alertes
  de segment** (elles ont contribué à la dérive à FC 179 le 22/08).
- 🎫 **Les 4 cartes plastifiées** sont consultables et imprimables.
- 🍽️ **Fractionner plutôt qu'augmenter** : même quantité de glucides sur
  5 prises. La soupe s'arrête le 25, les œufs et l'épicé le 27.
- 🔴 **`VIGILANCE_NUTRITION`** : Pierre requalifie en « craquage » des prises
  normales, au moins 5 fois depuis le 15/08. La recharge FIXE DE L'EAU, environ
  3 g par gramme de glycogène — la rétention est le signe que ça marche.
  **L'app n'affichera jamais de compteur ni de bilan de repas.**
- 💳 Taxe de séjour **payée** le 24. 🛏️ Linge **en attente** : Sylvain consulte
  la blanchisserie mais prévient que c'est la semaine UTMB. Plan B dans la
  valise, décision lundi soir.
- 🛒 Courses de Chamonix le 27 au matin dans le coffre. Seule exception : le
  petit-déj du 28 vient de Belgique, sachet marqué « 28/08 ».
- 📊 Physio du 24 : **meilleur profil du dossier** — FC 41, VFC 88, BB 93,
  readiness 75 HIGH, stress nocturne 9. Gorge et nez : rhinite vasomotrice, pas
  d'infection. Le signal à surveiller serait FC +5 et VFC effondrée.

---

## 🔴 LA RÈGLE N°1 ÉTAIT VIOLÉE (24/08, v35)

En revérifiant la Definition of Done, découverte d'un bug qui durait depuis la
création du coffre : **les coches du coffre s'effaçaient à chaque
rechargement**, en silence.

`archiveOrphelins()` déplace vers `orphelins` tout identifiant coché absent de
`idsConnusCheck()`. Or cette fonction énumère `sac-data`, `nutrition-data`,
`voyage-data`... mais **pas le coffre**, et pour une bonne raison : le coffre
est chiffré, on ne peut pas lire ses identifiants sans la phrase de passe. Les
`lg*` étaient donc archivés à chaque ouverture. Idem pour les `mo*` de la
montre, ajoutés le 24.

Concrètement : « 🛰️ RENDRE LA BALISE GPS — 155 € » se décochait tout seul.

**Correctif** : `PREFIXES_RESERVES` — les identifiants dont la source n'est pas
énumérable au chargement sont reconnus par motif (`^lg\d+$`, `^mo\d+$`) et
jamais archivés. Et une **réparation** ramène dans l'état actif tout ce que les
versions précédentes avaient archivé à tort : rien n'avait été perdu, seulement
déplacé.

Vérifié : `lg5`, `mo0` et `c21` survivent à deux rechargements successifs, et
la liste des orphelins est vide.

⚠️ **À retenir** : toute nouvelle liste cochable dont les identifiants ne
viennent pas d'un module importé par `idsConnusCheck()` doit ajouter son motif
à `PREFIXES_RESERVES`. Sinon Pierre coche dans le vide.

## Le profil officiel, affiché (v35)

`assets/ccc_100km_profil.png` était déployé mais n'était affiché nulle part.
Il est maintenant dans l'onglet Tracé, et il vaut le détour : il porte les
**barrières en rouge**, le D+ par segment et les **pictogrammes de services**
par poste, que notre profil vectoriel n'a pas.

Deux pièges au passage : `loading="lazy"` ne se déclenche jamais dans une vue
masquée au moment du parsing (retiré) ; et les deux tiers inférieurs du PNG
sont du blanc, donc l'image est rognée à sa hauteur utile et défile
horizontalement à 920 px — à 309 px, un graphique de 3 369 px est illisible.

Ses valeurs imprimées ont servi à corriger quatre D+ de segment calculés :
Bonatti 323, Arnouvaz 149, La Giète 731, Vallorcine 161.
