/**
 * cartes-data.js — les 4 cartes plastifiees
 * ---------------------------------------------------------------------------
 * Produites le 23/08. Ce ne sont pas des pense-betes de confort : au ravito,
 * l'attention de Pierre est au plus bas — bruit, monde, froid, fatigue — et
 * c'est precisement la qu'il faut executer une sequence sans en sauter une
 * etape. Une carte plastifiee ne tombe pas en panne de batterie et ne demande
 * pas de deverrouiller un ecran avec des doigts gourds.
 *
 * L'app les affiche pour qu'il puisse les relire n'importe quand, et les
 * imprime au bon format.
 */

export const CARTES = {
  note: "🖨️ Imprimer en recto-verso, sur papier épais, puis plastifier. Format A6, quatre cartes par A4.",
  emplacements: [
    { carte: "1 · Pacing",   ou: "poche du RTECH PRO" },
    { carte: "2 · Champex",  ou: "sac de Champex" },
    { carte: "3 · Ça va mal", ou: "poche du RTECH PRO" },
    { carte: "4 · Contacts", ou: "sac de course" }
  ],

  liste: [
    {
      n: 1, titre: "Pacing", ou: "Poche du RTECH PRO",
      recto: "Les 15 points · km · km restant · cible · barrière · marge",
      verso: "Scénario B et plan survie",
      pourquoi: "La seule carte qu'on regarde en marchant. Le km restant y est parce qu'à 3 h du matin, une soustraction mentale est une soustraction ratée.",
      genere: "pacing"
    },
    {
      n: 2, titre: "Champex", ou: "Sac de Champex",
      recto: "Le protocole en 14 étapes numérotées",
      verso: "Trient · plan caféine · les trois modes de ravito",
      pourquoi: "Champex est le seul arrêt long. C'est là qu'on oublie quelque chose, et c'est là que ça coûte le plus cher. Une liste numérotée, on la suit sans réfléchir.",
      genere: "champex"
    },
    {
      n: 3, titre: "Ça va mal", ou: "Poche du RTECH PRO",
      recto: "Les 5 règles",
      verso: "L'arbre 🟢🟠🔴 et la règle chaussettes",
      pourquoi: "Elle ne sert qu'une fois, peut-être jamais. Mais au moment où elle sert, on n'est plus en état de raisonner.",
      genere: "panic"
    },
    {
      n: 4, titre: "Contacts", ou: "Sac de course",
      recto: "Urgences · code C6190X",
      verso: "Check-list post-arrivée et balise GPS",
      pourquoi: "Le verso est le vrai sujet : rendre la balise le samedi, après vingt heures de course. 155 € et aucun rattrapage possible.",
      genere: "contacts"
    }
  ],

  rappel: "⚠️ Le code de la boîte à clés figure sur la carte 4. Elle vit dans le sac de course, pas dans une poche extérieure."
};

export default CARTES;
