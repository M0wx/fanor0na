# Fanorona 3 — Instructions agent

## Projet

Jeu traditionnel malgache Fanorona 3 (grille 3×3, 3 pions/joueur). Vanilla HTML/CSS/JS — aucune dépendance, aucun build.

## Fichiers

- `index.html` — structure, SVG des lignes, overlays DOM des intersections
- `style.css` — thème (blanc + `#88e788`), animations, responsive
- `script.js` — logique métier + rendu + IA (Minimax alpha-beta)

## Architecture & pièges

- `board` = `Array(9)` : `0`=vide, `1`=J1, `2`=J2
- `state.phase` : `'placement'` → `'movement'` automatiquement après 6 pions posés
- `WINNING_COMBOS` : 8 alignements (3 lignes, 3 colonnes, 2 diagonales)
- `ADJACENT[i]` : voisins valides au mouvement. Centre (index 4) connecté aux 8 autres
- `POSITIONS[i]` : coordonnées % pour le positionnement CSS des intersections
- Mouvement : clic sur un pion `player` → `state.selected = index` ; second clic sur vide adjacent → déplacement
- `playAIMove()` via `setTimeout(..., 500)` déclenché dans `updateUI()`. Mode `easy`=aléatoire, `hard`=minimax profondeur 4
- `history[]` = snapshots `JSON.parse(JSON.stringify(state))`. Ctrl+Z / Ctrl+Y

## Commandes

Aucune. Ouvrir `index.html` dans un navigateur.

## Contraintes (validation obligatoire)

Toute modification de fichier nécessite une proposition clairement formulée et approuvée avant exécution. Format :

### Proposition
Objectif : [description]
Fichiers : [liste]
Actions : [création / modification / suppression / explication]

Ne jamais créer, modifier, supprimer, renommer ou déplacer un fichier sans validation explicite.
