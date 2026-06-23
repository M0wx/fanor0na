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
    msg.textContent = 'À vous de jouer, Joueur ' + state.currentPlayer;
  }
}

function checkWin(player) {
  return WINNING_COMBOS.some(combo =>
    combo.every(i => state.board[i] === player)
  );
}

function handleClick(index) {
  if (state.winner) return;

  if (state.phase === 'placement') {
    handlePlacement(index);
  } else {
    handleMovement(index);
  }

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

function resetGame() {
  initState();
  render();
  updateUI();
}

document.addEventListener('DOMContentLoaded', () => {
  initState();
  createBoard();
  render();
  updateUI();
  document.getElementById('resetBtn').addEventListener('click', resetGame);
});
