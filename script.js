const EMPTY = 0;
const P1 = 1;
const P2 = 2;

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const ADJACENT = [
  [1, 3, 4],
  [0, 2, 4],
  [1, 4, 5],
  [0, 4, 6],
  [0, 1, 2, 3, 5, 6, 7, 8],
  [2, 4, 8],
  [3, 4, 7],
  [4, 6, 8],
  [4, 5, 7],
];

const POSITIONS = [
  [16.67, 16.67], [50, 16.67], [83.33, 16.67],
  [16.67, 50],   [50, 50],   [83.33, 50],
  [16.67, 83.33], [50, 83.33], [83.33, 83.33],
];

let state;
let history = [];
let historyIndex = -1;
let gameMode = null; // 'hvh', 'hvai-easy', 'hvai-hard', 'aivai-easy', 'aivai-hard'
let aiPlayer = null; // P1 or P2 if AI is enabled
let isAIMode = false; // true if both players are AI (IA vs IA)

function initState() {
  state = {
    board: Array(9).fill(EMPTY),
    currentPlayer: P1,
    phase: 'placement',
    piecesPlaced: { 1: 0, 2: 0 },
    winner: null,
    selected: null,
  };
}

function saveState() {
  historyIndex++;
  history = history.slice(0, historyIndex);
  history.push(JSON.parse(JSON.stringify(state)));
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    state = JSON.parse(JSON.stringify(history[historyIndex]));
    render();
    updateUI();
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    state = JSON.parse(JSON.stringify(history[historyIndex]));
    render();
    updateUI();
  }
}

function createBoard() {
  const container = document.getElementById('intersections');
  container.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'intersection';
    cell.dataset.index = i;
    cell.style.left = POSITIONS[i][0] + '%';
    cell.style.top = POSITIONS[i][1] + '%';
    cell.addEventListener('click', () => handleClick(i));
    container.appendChild(cell);
  }
}

function render() {
  const cells = document.querySelectorAll('.intersection');
  for (let i = 0; i < 9; i++) {
    const cell = cells[i];
    cell.innerHTML = '';
    cell.classList.remove('selected');
    if (state.board[i] !== EMPTY) {
      const piece = document.createElement('div');
      piece.className = 'piece ' + (state.board[i] === P1 ? 'p1' : 'p2');
      cell.appendChild(piece);
    }
    if (state.selected === i) {
      cell.classList.add('selected');
    }
  }
}

function updateUI() {
  const p1 = document.querySelector('[data-player="1"]');
  const p2 = document.querySelector('[data-player="2"]');
  p1.classList.toggle('active', state.currentPlayer === P1 && !state.winner);
  p2.classList.toggle('active', state.currentPlayer === P2 && !state.winner);

  document.getElementById('count1').textContent = state.piecesPlaced[1] + '/3';
  document.getElementById('count2').textContent = state.piecesPlaced[2] + '/3';

  const badge = document.getElementById('phaseBadge');
  badge.textContent = state.phase === 'placement' ? 'Placement' : 'Mouvement';

  const msg = document.getElementById('statusMsg');
  msg.className = 'game-status';
  if (state.winner) {
    const name = 'Joueur ' + state.winner;
    msg.textContent = '' + name + ' a gagné !';
    msg.classList.add('winner', state.winner === P1 ? 'p1-win' : 'p2-win');
  } else {
    const isAI = state.currentPlayer === aiPlayer;
    const playerLabel = isAI ? 'IA' : 'Joueur ' + state.currentPlayer;
    msg.textContent = 'À vous de jouer, ' + playerLabel;
  }

  // Update undo/redo buttons
  document.getElementById('undoBtn').disabled = historyIndex <= 0;
  document.getElementById('redoBtn').disabled = historyIndex >= history.length - 1;

  // Win overlay
  const overlay = document.getElementById('winOverlay');
  const winText = document.getElementById('winText');
  const winTrophy = document.getElementById('winTrophy');
  if (state.winner) {
    overlay.classList.add('active');
    const name = 'Joueur ' + state.winner;
    winText.textContent = name + ' a gagné !';
    winText.className = 'win-text ' + (state.winner === P1 ? 'p1-win' : 'p2-win');
    winTrophy.className = 'win-trophy ' + (state.winner === P1 ? 'p1' : 'p2');
  } else {
    overlay.classList.remove('active');
  }

  // Auto-play AI move
  if (!state.winner) {
    if (isAIMode) {
      // Both players are AI - always auto-play
      setTimeout(playAIMove, 500);
    } else if (state.currentPlayer === aiPlayer) {
      // Single AI player
      setTimeout(playAIMove, 500);
    }
  }
}

function checkWin(player) {
  return WINNING_COMBOS.some(combo =>
    combo.every(i => state.board[i] === player)
  );
}

function handleClick(index) {
  if (state.winner || state.currentPlayer === aiPlayer) return;

  if (state.phase === 'placement') {
    handlePlacement(index);
  } else {
    handleMovement(index);
  }

  saveState();
  render();
  updateUI();
}

function handlePlacement(index) {
  if (state.board[index] !== EMPTY) return;
  const player = state.currentPlayer;
  if (state.piecesPlaced[player] >= 3) return;

  state.board[index] = player;
  state.piecesPlaced[player]++;

  if (checkWin(player)) {
    state.winner = player;
    return;
  }

  if (state.piecesPlaced[1] === 3 && state.piecesPlaced[2] === 3) {
    state.phase = 'movement';
  }

  state.currentPlayer = player === P1 ? P2 : P1;
}

function handleMovement(index) {
  const player = state.currentPlayer;

  if (state.selected === null) {
    if (state.board[index] === player) {
      state.selected = index;
    }
    return;
  }

  if (state.selected === index) {
    state.selected = null;
    return;
  }

  if (state.board[index] !== EMPTY) {
    if (state.board[index] === player) {
      state.selected = index;
    }
    return;
  }

  const adj = ADJACENT[state.selected];
  if (!adj.includes(index)) return;

  state.board[index] = player;
  state.board[state.selected] = EMPTY;
  state.selected = null;

  if (checkWin(player)) {
    state.winner = player;
    return;
  }

  state.currentPlayer = player === P1 ? P2 : P1;
}

// ============= IA LOGIC =============

function getValidMoves(board, player, phase, piecesPlaced) {
  const moves = [];
  
  if (phase === 'placement') {
    for (let i = 0; i < 9; i++) {
      if (board[i] === EMPTY && piecesPlaced[player] < 3) {
        moves.push({ from: null, to: i, type: 'placement' });
      }
    }
  } else {
    for (let from = 0; from < 9; from++) {
      if (board[from] === player) {
        const adj = ADJACENT[from];
        for (let to of adj) {
          if (board[to] === EMPTY) {
            moves.push({ from, to, type: 'movement' });
          }
        }
      }
    }
  }
  
  return moves;
}

function simulateMove(board, move, player, piecesPlaced) {
  const newBoard = board.slice();
  const newPiecesPlaced = JSON.parse(JSON.stringify(piecesPlaced));
  
  if (move.type === 'placement') {
    newBoard[move.to] = player;
    newPiecesPlaced[player]++;
  } else {
    newBoard[move.to] = player;
    newBoard[move.from] = EMPTY;
  }
  
  return { newBoard, newPiecesPlaced };
}

function evaluateBoard(board) {
  // Check if P1 wins
  if (WINNING_COMBOS.some(combo => combo.every(i => board[i] === P1))) {
    return 100;
  }
  // Check if P2 wins
  if (WINNING_COMBOS.some(combo => combo.every(i => board[i] === P2))) {
    return -100;
  }
  // Neutral
  return 0;
}

function minimax(board, depth, isMax, piecesPlaced, phase, alpha, beta) {
  const evaluation = evaluateBoard(board);
  if (evaluation !== 0) return evaluation;
  if (depth === 0) return 0;

  const player = isMax ? P1 : P2;
  const moves = getValidMoves(board, player, phase, piecesPlaced);
  
  if (moves.length === 0) return 0;

  if (isMax) {
    let maxEval = -Infinity;
    for (let move of moves) {
      const { newBoard, newPiecesPlaced } = simulateMove(board, move, player, piecesPlaced);
      const newPhase = phase === 'placement' && newPiecesPlaced[1] === 3 && newPiecesPlaced[2] === 3 
        ? 'movement' : phase;
      const eval_score = minimax(newBoard, depth - 1, false, newPiecesPlaced, newPhase, alpha, beta);
      maxEval = Math.max(maxEval, eval_score);
      alpha = Math.max(alpha, eval_score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of moves) {
      const { newBoard, newPiecesPlaced } = simulateMove(board, move, player, piecesPlaced);
      const newPhase = phase === 'placement' && newPiecesPlaced[1] === 3 && newPiecesPlaced[2] === 3 
        ? 'movement' : phase;
      const eval_score = minimax(newBoard, depth - 1, true, newPiecesPlaced, newPhase, alpha, beta);
      minEval = Math.min(minEval, eval_score);
      beta = Math.min(beta, eval_score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getAIMove(board, player, phase, piecesPlaced, difficulty) {
  const moves = getValidMoves(board, player, phase, piecesPlaced);
  
  if (moves.length === 0) return null;
  
  if (difficulty === 'easy') {
    // Random move
    return moves[Math.floor(Math.random() * moves.length)];
  } else {
    // Minimax with depth 4
    let bestScore = player === P1 ? -Infinity : Infinity;
    let bestMove = moves[0];
    const depth = 4;
    
    for (let move of moves) {
      const { newBoard, newPiecesPlaced } = simulateMove(board, move, player, piecesPlaced);
      const newPhase = phase === 'placement' && newPiecesPlaced[1] === 3 && newPiecesPlaced[2] === 3 
        ? 'movement' : phase;
      const score = minimax(newBoard, depth - 1, player === P1 ? false : true, newPiecesPlaced, newPhase, -Infinity, Infinity);
      
      if (player === P1 && score > bestScore) {
        bestScore = score;
        bestMove = move;
      } else if (player === P2 && score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }
}

function playAIMove() {
  if (state.winner) return;

  let difficulty;
  
  if (isAIMode) {
    // IA vs IA mode - use the difficulty from gameMode
    difficulty = gameMode.includes('easy') ? 'easy' : 'hard';
  } else {
    // Human vs IA mode
    difficulty = gameMode.includes('easy') ? 'easy' : 'hard';
  }

  const move = getAIMove(state.board, state.currentPlayer, state.phase, state.piecesPlaced, difficulty);
  
  if (!move) return;

  if (move.type === 'placement') {
    state.board[move.to] = state.currentPlayer;
    state.piecesPlaced[state.currentPlayer]++;
    
    if (checkWin(state.currentPlayer)) {
      state.winner = state.currentPlayer;
    } else if (state.piecesPlaced[1] === 3 && state.piecesPlaced[2] === 3) {
      state.phase = 'movement';
    }
  } else {
    state.board[move.to] = state.currentPlayer;
    state.board[move.from] = EMPTY;
    
    if (checkWin(state.currentPlayer)) {
      state.winner = state.currentPlayer;
    }
  }

  state.currentPlayer = state.currentPlayer === P1 ? P2 : P1;
  saveState();
  render();
  updateUI();
}

// ============= GAME MODE =============

function startGame(mode) {
  gameMode = mode;
  isAIMode = false;
  
  // Determine AI player
  if (mode === 'hvh') {
    aiPlayer = null;
  } else if (mode === 'hvai-easy' || mode === 'hvai-hard') {
    aiPlayer = P2; // Player 1 is human, Player 2 is AI
  } else if (mode === 'aivai-easy' || mode === 'aivai-hard') {
    isAIMode = true; // Both are AI - auto-play mode
    aiPlayer = null; // Mark as special mode
  }

  // Update UI labels
  const p1NameEl = document.getElementById('p1Name');
  const p2NameEl = document.getElementById('p2Name');
  
  if (mode === 'hvh') {
    p1NameEl.textContent = 'Joueur 1';
    p2NameEl.textContent = 'Joueur 2';
  } else if (mode === 'hvai-easy' || mode === 'hvai-hard') {
    p1NameEl.textContent = 'Vous';
    p2NameEl.textContent = mode === 'hvai-easy' ? 'IA Facile' : 'IA Difficile';
  } else if (mode === 'aivai-easy' || mode === 'aivai-hard') {
    const level = mode === 'aivai-easy' ? 'Facile' : 'Difficile';
    p1NameEl.textContent = 'IA ' + level;
    p2NameEl.textContent = 'IA ' + level;
  }

  // Hide menu, show game
  document.getElementById('modeMenu').classList.remove('active');
  document.getElementById('gameBoard').classList.add('active');

  // Initialize game
  initState();
  history = [];
  historyIndex = -1;
  createBoard();
  saveState();
  render();
  updateUI();
}

function goToMenu() {
  document.getElementById('modeMenu').classList.add('active');
  document.getElementById('gameBoard').classList.remove('active');
  gameMode = null;
  aiPlayer = null;
  isAIMode = false;
}

// ============= EVENT LISTENERS =============

document.addEventListener('DOMContentLoaded', () => {
  // Mode selection buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      startGame(mode);
    });
  });

  // Undo/Redo buttons
  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('redoBtn').addEventListener('click', redo);

  // Reset button (back to menu)
  document.getElementById('resetBtn').addEventListener('click', goToMenu);

  // Win overlay restart button
  document.getElementById('winRestartBtn').addEventListener('click', () => {
    if (gameMode) startGame(gameMode);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    } else if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      redo();
    }
  });
});

