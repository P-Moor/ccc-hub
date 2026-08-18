/**
 * prive-data.js — le coffre
 * ---------------------------------------------------------------------------
 * Ce fichier est PUBLIC. Il ne contient que du chiffre.
 *
 * Le clair vit dans `_logistique-clair.js`, qui reste sur le Mac de Pierre et
 * n'est jamais deploye (le trait de soulignement est la convention du projet
 * pour ce qui ne sort pas). Pour regenerer ce fichier : ouvrir `_chiffrer.html`
 * en local, saisir la phrase de passe, telecharger le resultat, le remettre ici.
 *
 * Chiffrement : PBKDF2-SHA256 (1 000 000 tours) puis AES-GCM 256.
 * La phrase de passe n'est ecrite nulle part, ni ici, ni dans le depot, ni
 * dans une conversation. Elle n'existe que dans la tete de Pierre.
 *
 * ATTENTION, la seule vraie protection est la FORCE DE LA PHRASE. Ce fichier
 * est telechargeable par n'importe qui : une attaque hors ligne peut essayer
 * autant de phrases qu'elle veut. Quatre ou cinq mots sans rapport entre eux,
 * pas une date ni un nom propre.
 */

export const PRIVE = {
  version: 1,

  /** Faux coffre, tant que le vrai n'a pas ete genere. */
  vide: true,

  kdf: {
    nom: "PBKDF2",
    hash: "SHA-256",
    tours: 1000000,
    sel: ""
  },

  chiffre: {
    nom: "AES-GCM",
    iv: "",
    donnees: ""
  },

  /** Indice facultatif, choisi par Pierre. Jamais la phrase elle-meme. */
  indice: ""
};

export default PRIVE;
