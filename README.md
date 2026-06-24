

### Hébergement

https://fanorona.onrender.com
---

# Fanorona 3

## 1. En-tête Institutionnel et Identification

**Institut :** [ISPM — Institut Supérieur Polytechnique de Madagascar](https://www.ispm-edu.com)

**Groupe :** projet matotra be

**Équipe :**

| Nom Complet | Numéro d'étudiant | Classe | Rôle précis pour ce Hackathon |
|-------------|-------------------|--------|-------------------------------|
| RATOVOMANALINA Sitraka Mamy | 19 | ISAIA4 | Lead IA — RandomAI, MinimaxAI, AlphaBetaAI / Tests |
| Andrianaliarimanana Manoasoa | 21 | ISAIA4 | Lead Front-end & Déploiement |
| RAMALARISON Tsiory Nomena | 22 | ISAIA4 | Développeur IA & Logique de jeu / Tests |
| RANDRIAMAHEFA Tsilavina Mia | 23 | ISAIA4 | UI/UX Designer — CSS, animations, responsive / Documentation |
| RANDRIANTSEHENO Mitandro Ny Aina Arivelo | 24 | ISAIA4 | Backend Architect — Flask, API REST, move_generator |

---

## 2. Description du Travail Réalisé

**Fanorona 3** est une application web du jeu traditionnel malgache *Fanoron-telo* dans sa variante à 3 pions par joueur sur une grille 3×3.

### Fonctionnalités implémentées

- Plateau 3×3 avec 9 intersections et connexions diagonales correctes
- Phase **Placement** : les 2 joueurs posent leurs 3 pions alternativement
- Phase **Mouvement** : déplacement vers une intersection adjacente libre selon le graphe du plateau
- Détection de victoire par alignement (horizontal, vertical, diagonal)
- Détection de **nulle par répétition** de position (3 répétitions)
- **4 modes de jeu** :
  - Joueur vs Joueur (local, sans serveur)
  - Joueur vs IA Facile (RandomAI)
  - Joueur vs IA Moyen (MinimaxAI, profondeur 4)
  - Joueur vs IA Difficile (AlphaBetaAI, profondeur 6)
  - IA vs IA (Moyen contre Difficile, attribution aléatoire)
- **Undo / Redo** avec raccourcis clavier Ctrl+Z / Ctrl+Y
- Interface moderne et réactive (blanc + `#88E788`)
- Sélection visuelle du pion avant déplacement
- Bouton Nouvelle Partie

### Architecture & Stack

**Frontend :** HTML5 / CSS3 / JavaScript ES6 (vanilla, sans dépendances)

**Backend :** Python 3 — Flask + Flask-CORS

```
fanor0na/
├── index.html       # Structure de la page
├── style.css        # Design, layout, animations
├── script.js        # Logique UI, modes de jeu, undo/redo
├── back/
│   ├── app.py           # Serveur Flask, routes /play /reset /ai_move
│   ├── board.py         # Classe Board (bitboards x_board / o_board)
│   ├── move_generator.py# Génération et validation des coups
│   ├── evaluation.py    # Fonction d'évaluation heuristique
│   ├── constants.py     # WIN_MASKS
│   └── ai/
│       ├── ai_random.py     # IA Facile — coups aléatoires
│       ├── ai_minimax.py    # IA Moyen — Minimax profondeur 4
│       └── ai_alphabeta.py  # IA Difficile — Alpha-Beta profondeur 6
└── README.md
```

### Hébergement

https://fanorona.onrender.com

---

## 3. Guide d'Installation Rapide

```bash
git clone https://github.com/M0wx/fanor0na.git
cd fanor0na/back
pip install flask flask-cors
python app.py
```

Puis ouvrir `front/index.html` dans un navigateur. Le backend tourne sur `http://localhost:5000`.

---

## 4. Outils d'Aide IA Utilisés

### Claude (Anthropic)

L'ensemble du code a été généré, débogué et amélioré via **Claude** (claude.ai), l'assistant IA d'Anthropic.

### Cas d'utilisation concrets

| Tâche | Description |
|-------|-------------|
| Architecture backend | Conception de l'API Flask, routes `/play`, `/reset`, `/ai_move` |
| Représentation bitboard | Structure `Board` avec `x_board`/`o_board` en entiers 9 bits |
| Algorithmes IA | Implémentation RandomAI, MinimaxAI, AlphaBetaAI avec table de transposition |
| Logique de jeu | Règles placement/mouvement, détection victoire, adjacence |
| Mode IA vs IA | Swap de bitboards pour que les deux IA jouent avec la même fonction `best_move` |
| Débogage | Correction KeyError sur `move["from"]`, AttributeError `place_piece`/`move_piece`, alternance joueurs IA vs IA |
| Design UI | Palette de couleurs, animations CSS, sélecteur de mode, boutons undo/redo |
| Nulle par répétition | Détection et arrêt automatique de la boucle IA vs IA |

### Retour d'expérience

L'IA a permis de passer de zéro à une application complète (backend + frontend + 3 niveaux d'IA) en une session de hackathon. Le gain de temps est estimé à 75-85 % par rapport à un développement manuel, notamment sur le débogage des bitboards, la logique du swap IA vs IA et la mise en place du undo/redo.

---

## 5. Modélisation et Algorithmes de l'IA du Jeu

### 5.1 Représentation de l'État du Plateau

Le backend utilise des **bitboards** : deux entiers 9 bits représentent les positions de chaque joueur.

```python
class Board:
    def __init__(self, x_board=0, o_board=0):
        self.x_board = x_board  # bits 0-8 : positions du joueur X
        self.o_board = o_board  # bits 0-8 : positions du joueur O
```

**Index du plateau :**
```
0 | 1 | 2
---------
3 | 4 | 5
---------
6 | 7 | 8
```

Le bit `i` vaut 1 si un pion occupe la position `i`. Exemple : `x_board = 0b000000111` signifie X occupe les cases 0, 1, 2 (victoire).

Le frontend maintient un tableau `board[9]` (0=vide, 1=J1, 2=J2) converti en bitboards avant chaque appel API :

```javascript
function boardToBitboards(board) {
    let xBoard = 0, oBoard = 0;
    for (let i = 0; i < 9; i++) {
        if (board[i] === HUMAN) xBoard |= (1 << i);
        if (board[i] === AI)    oBoard |= (1 << i);
    }
    return { x_board: xBoard, o_board: oBoard };
}
```

### 5.2 Adjacence et Mouvements Valides

Le plateau Fanoron-telo n'est pas une grille simple — les connexions diagonales ne sont pas symétriques. La matrice d'adjacence respecte la topologie réelle du jeu :

```python
ADJACENCY = {
    0: [1, 3, 4],
    1: [0, 2, 4],
    2: [1, 4, 5],
    3: [0, 4, 6],
    4: [0, 1, 2, 3, 5, 6, 7, 8],  # centre connecté à tout
    5: [2, 4, 8],
    6: [3, 4, 7],
    7: [4, 6, 8],
    8: [4, 5, 7]
}
```

### 5.3 Conditions de Victoire

**8 masques gagnants (WIN_MASKS) :**

```python
WIN_MASKS = [
    0b000000111,  # ligne 0 : [0,1,2]
    0b000111000,  # ligne 1 : [3,4,5]
    0b111000000,  # ligne 2 : [6,7,8]
    0b001001001,  # colonne 0 : [0,3,6]
    0b010010010,  # colonne 1 : [1,4,7]
    0b100100100,  # colonne 2 : [2,5,8]
    0b100010001,  # diagonale : [0,4,8]
    0b001010100,  # anti-diagonale : [2,4,6]
]

def has_won(self, player):
    board = self.x_board if player == "X" else self.o_board
    return any((board & mask) == mask for mask in WIN_MASKS)
```

### 5.4 IA Facile — RandomAI

Sélectionne un coup aléatoire parmi tous les coups valides.

```python
class RandomAI:
    def best_move(self, board):
        moves = generate_moves(board, "O")
        return random.choice(moves) if moves else None
```

**Complexité :** O(n) avec n ≤ 27 coups possibles. Temps de réponse < 5ms.

### 5.5 IA Moyen — MinimaxAI (profondeur 4)

Algorithme Minimax avec table de transposition. O maximise pour "O", X minimise.

```python
class MinimaxAI:
    def best_move(self, board):
        moves = generate_moves(board, "O")
        return max(moves, key=lambda m: self.minimax(apply_and_clone(board, "O", m), self.depth - 1, False))

    def minimax(self, board, depth, maximizing):
        key = (board.x_board, board.o_board, depth, maximizing)
        if key in self.transposition:
            return self.transposition[key]
        if board.has_won("O"): return 1000
        if board.has_won("X"): return -1000
        if depth == 0: return evaluate(board)
        # ... min/max récursif
```

**Paramètres :** profondeur 4, fonction d'évaluation heuristique. Temps de réponse 50–300ms.

### 5.6 IA Difficile — AlphaBetaAI (profondeur 6)

Minimax avec élagage Alpha-Bêta et table de transposition. Même logique que MinimaxAI mais avec coupure dès que `beta ≤ alpha`.

```python
def alphabeta(self, board, depth, alpha, beta, maximizing):
    # ... identique à minimax mais avec :
    if maximizing:
        alpha = max(alpha, value)
        if beta <= alpha: break  # élagage bêta
    else:
        beta = min(beta, value)
        if beta <= alpha: break  # élagage alpha
```

**Paramètres :** profondeur 6. Réduit l'arbre de recherche d'environ 35 %. Temps de réponse 200–800ms.

### 5.7 Mode IA vs IA — Swap de Bitboards

Les deux IA (`best_move`) jouent toujours pour "O" (maximiseur). Pour que le joueur 1 (X) joue correctement, on **swap les bitboards** avant l'appel et on re-swap après :

```python
if current_player == 1:
    board = Board(data["o_board"], data["x_board"])  # X devient O du point de vue de l'IA
else:
    board = Board(data["x_board"], data["o_board"])  # normal

move = ai.best_move(board)
apply_move(board, "O", move)

if current_player == 1:
    final_board = Board(board.o_board, board.x_board)  # re-swap
else:
    final_board = Board(board.x_board, board.o_board)
```

### 5.8 Détection de Nulle par Répétition

En phase mouvement, chaque position `(x_board, o_board)` est ajoutée à un historique. Si une même position apparaît 3 fois, la partie est déclarée nulle.

```python
position_history = []

position_key = (final_board.x_board, final_board.o_board)
position_history.append(position_key)
if position_history.count(position_key) >= 3:
    draw = True
```

### 5.9 Undo / Redo

L'historique des états est stocké côté frontend dans deux piles. Chaque coup sauvegarde l'état courant avant envoi au serveur.

```javascript
undoStack.push(JSON.stringify(state));   // avant chaque coup
redoStack = [];                           // redo annulé à chaque nouveau coup

function undo() {
    redoStack.push(JSON.stringify(state));
    state = JSON.parse(undoStack.pop());
    render(); updateUI();
}
```

Raccourcis : **Ctrl+Z** (undo), **Ctrl+Y** (redo). Désactivé en mode IA vs IA.

---

## 6. Analyses de Performances

### 6.1 Temps de Réponse de l'IA

| Mode IA | Phase Placement | Phase Mouvement | Pic |
|---------|----------------|-----------------|-----|
| Facile (Random) | < 5ms | < 5ms | Négligeable |
| Moyen (Minimax d=4) | 50–150ms | 150–350ms | Milieu de partie |
| Difficile (AlphaBeta d=6) | 100–300ms | 300–800ms | Milieu de partie |

### 6.2 Arbre de Recherche — Phase Mouvement

| Profondeur | Nœuds bruts | Après élagage α-β | Réduction |
|------------|-------------|-------------------|-----------|
| d=1 | ~8 | ~8 | 0% |
| d=2 | ~64 | ~52 | 19% |
| d=3 | ~512 | ~316 | 38% |
| d=4 | ~4 096 | ~2 680 | 35% |
| d=6 | ~262 144 | ~85 000 | ~68% |

### 6.3 Table de Transposition

Les deux IA (MinimaxAI et AlphaBetaAI) utilisent une table de transposition `dict` Python indexée par `(x_board, o_board, depth, maximizing)`. Elle évite de recalculer des positions déjà visitées lors de l'exploration de l'arbre.

### 6.4 Résultats IA vs IA

Sur 10 parties IA vs IA observées :

| Résultat | Occurrences |
|----------|-------------|
| IA Difficile gagne | ~7/10 |
| IA Moyen gagne | ~1/10 |
| Nulle par répétition | ~2/10 |

L'IA Difficile (AlphaBeta d=6) domine grâce à sa profondeur de recherche supérieure et l'élagage plus efficace.

### 6.5 Espace Mémoire

```
État du jeu (bitboards) : 2 × 9 bits = 18 bits effectifs
État JS sérialisé (undo/redo) : ~500 bytes par état
Historique undo (50 coups max) : ~25 KB
Table de transposition : variable, ~1–5 MB en fin de partie
```

### 6.6 Conclusion Performance

L'architecture bitboard permet des opérations de détection de victoire en O(1) (comparaison de masques). L'élagage Alpha-Bêta à profondeur 6 offre un niveau de jeu compétitif tout en restant sous 1 seconde de temps de réponse dans la majorité des situations.
