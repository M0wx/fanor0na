# Fanorona 3

## 1. En-tête Institutionnel et Identification

**Institut :** [ISPM — Institut Supérieur Polytechnique de Madagascar](https://www.ispm-edu.com)

**Groupe :** [Nom du groupe]

**Équipe :**

| Nom Complet | Numéro d'étudiant | Classe | Rôle |
|-------------|-------------------|--------|------|
| | | | |

---

## 2. Description du Travail Réalisé

**Fanorona 3** est une application web du jeu traditionnel malgache *Fanorona* dans sa variante à 3 pions par joueur sur une grille 3×3.

### Fonctionnalités implémentées

- Plateau de jeu 3×3 avec 9 intersections
- Phase de **placement** : les 2 joueurs placent leurs 3 pions alternativement
- Phase de **mouvement** : déplacement des pions vers une intersection adjacente libre
- Détection de victoire par alignement (horizontal, vertical, diagonal)
- Interface moderne et réactive (blanc + `#88E788`)
- Sélection visuelle du pion avant déplacement
- Bouton Nouvelle Partie

### Architecture & Stack

100% **vanilla** — HTML5 / CSS3 / JavaScript ES6. Aucune dépendance, aucun build, aucun backend. Le jeu fonctionne dans n'importe quel navigateur moderne en ouvrant `index.html`.

```
fanor0na/
├── index.html      # Structure de la page
├── style.css       # Design, layout, animations
├── script.js       # Logique métier et rendu
├── AGENTS.md       # Instructions pour l'assistant IA
└── README.md       # Présent rapport
```

### Hébergement

Non hébergé pour le moment.

---

## 3. Guide d'Installation Rapide

```bash
git clone <url_du_depot>
cd fanor0na
start index.html
```

Aucune dépendance ni installation requise. Ouvrir `index.html` dans un navigateur suffit.

---

## 4. Outils d'Aide IA Utilisés

### OpenCode (Claude)

L'ensemble du code a été généré et débogué via **OpenCode**, un assistant IA basé sur le modèle Claude, utilisé en ligne de commande.

### Cas d'utilisation concrets

| Tâche | Description |
|-------|-------------|
| Génération de code | Structure HTML, styles CSS et logique JS du jeu  |
| Architecture | Conception de l'architecture 100% frontend, séparation logique/rendu |
| Logique métier | Règles du jeu (placement, mouvement, alignement gagnant) |
| Design UI | Palette de couleurs, animations CSS, responsive |
| Débogage | Correction des lignes diagonales superflues, ajustement des règles de déplacement |

### Retour d'expérience

L'IA a permis de passer de zéro à une application fonctionnelle en moins d'une heure, incluant la logique de jeu complète et une interface soignée. Le gain de temps est estimé à environ 70-80 % par rapport à un développement manuel, notamment sur la partie CSS et la mise en place de la structure JS.

---

## 5. Modélisation et Algorithmes de l'IA du Jeu

Section dédiée à l'IA adversaire (à implémenter).

### Représentation de l'état du plateau

Le plateau est représenté par un tableau de 9 entiers (index 0 à 8) :

```
 0   1   2
 3   4   5
 6   7   8
```

- `0` = case vide
- `1` = pion du Joueur 1
- `2` = pion du Joueur 2

Les connexions (adjacences) sont stockées dans une liste d'adjacence statique. Chaque intersection possède la liste des index auxquels elle est reliée (orthogonal + diagonal uniquement via le centre).

```javascript
const ADJACENT = [
  [1, 3, 4],       // 0 : droite, bas, centre (diag)
  [0, 2, 4],       // 1 : gauche, droite, centre (bas)
  [1, 4, 5],       // 2 : gauche, centre (diag), bas
  [0, 4, 6],       // 3 : haut, centre (droite), bas
  [0, 1, 2, 3, 5, 6, 7, 8],  // 4 : toutes directions
  [2, 4, 8],       // 5 : haut, centre (gauche), bas
  [3, 4, 7],       // 6 : haut, centre (diag), droite
  [4, 6, 8],       // 7 : centre (haut), gauche, droite
  [4, 5, 7],       // 8 : centre (diag), haut, gauche
];
```

Les combinaisons gagnantes sont stockées dans un tableau des 8 alignements possibles (3 horizontaux, 3 verticaux, 2 diagonales).

### Minimax & Alpha-Beta (à implémenter)

L'algorithme prévu est un **Minimax avec élagage Alpha-Beta**. L'arbre de jeu explore les coups possibles (placement puis mouvement) jusqu'à une profondeur définie.

**Fonction d'évaluation (prévue) :**

| Critère | Poids |
|---------|-------|
| Alignement de 3 | +1000 (victoire) |
| Alignement de 2 sans blocage | +50 |
| Alignement de 2 avec blocage adverse | +10 |
| Nombre de pions au centre | +15 |
| Mobilité (nb de déplacements possibles) | +5 |

### Techniques avancées (à implémenter si pertinent)

- **Table de transposition** : hashage Zobrist pour stocker les états déjà évalués
- **Iterative Deepening** : exploration croissante avec contrainte de temps
- **Bitboards** : représentation bit à bit du plateau pour des opérations plus rapides

---

## 6. Analyses de Performances

*(Section à compléter après implémentation de l'IA)*

| Métrique | Valeur |
|----------|--------|
| Temps de réponse moyen de l'IA | TBD |
| Profondeur d'exploration | TBD |
| Nombre d'états évalués par coup | TBD |
| Taille de la table de transposition | TBD |
| Victoires IA difficile vs IA facile | TBD |

---

*Rapport généré dans le cadre des Travaux Pratiques — ISPM*
