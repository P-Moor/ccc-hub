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

`python3 scratchpad/coffre.py "<phrase>" "<indice>"`. Le script lit
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
