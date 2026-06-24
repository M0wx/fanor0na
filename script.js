const EMPTY = 0;
const HUMAN = 1;
const AI = 2;

const POSITIONS = [
    [16.67, 16.67],
    [50, 16.67],
    [83.33, 16.67],
    [16.67, 50],
    [50, 50],
    [83.33, 50],
    [16.67, 83.33],
    [50, 83.33],
    [83.33, 83.33]
];

const API_URL = "http://localhost:5000";

let state = {
    board: Array(9).fill(EMPTY),
    phase: "placement",
    currentPlayer: HUMAN,
    winner: null,
    selected: null,
    piecesPlaced: { 1: 0, 2: 0 }
};

// ─── Helpers ────────────────────────────────────────────────

function getMode() {
    return document.getElementById("modeSelect").value;
}

function isHvH() {
    return getMode() === "hvh";
}

function isAivAi() {
    return getMode() === "aivai";
}

function getDifficulty() {
    const mode = getMode();
    if (mode === "hvh" || mode === "aivai") return null;
    return mode;
}

// ─── Board rendering ────────────────────────────────────────

function createBoard() {
    const container = document.getElementById("intersections");
    container.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.className = "intersection";
        cell.dataset.index = i;
        cell.style.left = POSITIONS[i][0] + "%";
        cell.style.top = POSITIONS[i][1] + "%";
        cell.addEventListener("click", () => handleClick(i));
        container.appendChild(cell);
    }
}

function render() {
    const cells = document.querySelectorAll(".intersection");

    for (let i = 0; i < 9; i++) {
        const cell = cells[i];
        cell.innerHTML = "";
        cell.classList.remove("selected");

        if (state.selected === i) {
            cell.classList.add("selected");
        }

        if (state.board[i] !== EMPTY) {
            const piece = document.createElement("div");
            piece.className = "piece " + (state.board[i] === HUMAN ? "p1" : "p2");
            cell.appendChild(piece);
        }
    }
}

// Remplace updateUI() entièrement :
function updateUI() {
    document.getElementById("count1").textContent = state.piecesPlaced[1] + "/3";
    document.getElementById("count2").textContent = state.piecesPlaced[2] + "/3";

    document.getElementById("phaseBadge").textContent =
        state.phase === "placement" ? "Placement" : "Mouvement";

    if (isAivAi()) {
        const d1 = aiVsAiDifficulties[1];
        const d2 = aiVsAiDifficulties[2];
        document.getElementById("player2Name").textContent =
            "IA " + (d2 === "hard" ? "Difficile" : "Moyen");
        document.querySelector('[data-player="1"] .player-name').textContent =
            "IA " + (d1 === "hard" ? "Difficile" : "Moyen");
    } else {
        document.getElementById("player2Name").textContent =
            isHvH() ? "Joueur 2" : "IA";
        document.querySelector('[data-player="1"] .player-name').textContent =
            "Joueur 1";
    }

    const p1 = document.querySelector('[data-player="1"]');
    const p2 = document.querySelector('[data-player="2"]');
    p1.classList.toggle("active", state.currentPlayer === HUMAN && !state.winner);
    p2.classList.toggle("active", state.currentPlayer === AI && !state.winner);

    const msg = document.getElementById("statusMsg");

if (state.winner || state.draw) {
    if (state.draw) {
        msg.textContent = "Match nul — répétition de position !";
    } else if (isAivAi()) {
        const winnerDiff = aiVsAiDifficulties[state.winner];
        msg.textContent = `IA ${winnerDiff === "hard" ? "Difficile" : "Moyen"} a gagné !`;
    } else if (isHvH()) {
        msg.textContent = state.winner === HUMAN ? "Joueur 1 a gagné !" : "Joueur 2 a gagné !";
    } else {
        msg.textContent = state.winner === HUMAN ? "Vous avez gagné !" : "L'IA a gagné !";
    }
    return;
}

    if (isAivAi()) {
        const currentDiff = aiVsAiDifficulties[state.currentPlayer];
        msg.textContent = `IA ${currentDiff === "hard" ? "Difficile" : "Moyen"} réfléchit...`;
    } else if (isHvH()) {
        msg.textContent = state.currentPlayer === HUMAN
            ? "À vous de jouer, Joueur 1"
            : "À vous de jouer, Joueur 2";
    } else {
        msg.textContent = state.currentPlayer === HUMAN ? "À vous de jouer" : "L'IA réfléchit...";
    }
}

// ─── Bitboard conversion ────────────────────────────────────

function boardToBitboards(board) {
    let xBoard = 0;
    let oBoard = 0;

    for (let i = 0; i < 9; i++) {
        if (board[i] === HUMAN) xBoard |= (1 << i);
        if (board[i] === AI)    oBoard |= (1 << i);
    }

    return { x_board: xBoard, o_board: oBoard };
}

// ─── HvH local move (pas de serveur) ────────────────────────

function applyLocalMove(move) {
    // Sauvegarde pour undo
    undoStack.push(JSON.stringify(state));
    redoStack = [];
    updateUndoRedoButtons();

    const board = [...state.board];
    const player = state.currentPlayer;

    if (move.type === "place") {
        board[move.position] = player;
    } else {
        board[move.to] = player;
        board[move.from] = EMPTY;
    }

    const piecesPlaced = { ...state.piecesPlaced };
    if (move.type === "place") {
        piecesPlaced[player] = (piecesPlaced[player] || 0) + 1;
    }

    const nextPlayer = player === HUMAN ? AI : HUMAN;
    const winner = checkWinner(board, player) ? player : null;

    const p1Count = board.filter(c => c === HUMAN).length;
    const p2Count = board.filter(c => c === AI).length;
    const phase = (p1Count === 3 && p2Count === 3) ? "movement" : "placement";

    state = {
        board,
        phase,
        currentPlayer: winner ? player : nextPlayer,
        winner,
        selected: null,
        piecesPlaced
    };

    render();
    updateUI();
    updateUndoRedoButtons();
}

const WIN_MASKS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
    [0, 4, 8], [2, 4, 6]              // diagonales
];

function checkWinner(board, player) {
    return WIN_MASKS.some(mask =>
        mask.every(i => board[i] === player)
    );
}

// ─── API call (HvAI) ────────────────────────────────────────

async function sendMove(move) {
    const bits = boardToBitboards(state.board);

    // Sauvegarde pour undo avant d'envoyer
    undoStack.push(JSON.stringify(state));
    redoStack = [];
    updateUndoRedoButtons();

    const response = await fetch(API_URL + "/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            x_board: bits.x_board,
            o_board: bits.o_board,
            phase: state.phase,
            move: move,
            difficulty: getDifficulty()
        })
    });

    const data = await response.json();
    state = { ...data, selected: null };

    render();
    updateUI();
    updateUndoRedoButtons();
}

// ─── (AI vs AI) ────────────────────────────────────────
let aiVsAiRunning = false;
let aiVsAiDifficulties = {};  // { 1: "medium", 2: "hard" } ou inversé
let undoStack = [];
let redoStack = [];

function assignAiVsAiDifficulties() {
    const flip = Math.random() < 0.5;
    aiVsAiDifficulties = {
        1: flip ? "medium" : "hard",
        2: flip ? "hard" : "medium"
    };
}



async function runAiVsAi() {
    if (!isAivAi() || state.winner || state.draw) {
        aiVsAiRunning = false;
        return;
    }

    aiVsAiRunning = true;

    const currentPlayerIndex = state.currentPlayer;
    const difficulty = aiVsAiDifficulties[currentPlayerIndex];
    const bits = boardToBitboards(state.board);

    const response = await fetch(API_URL + "/ai_move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            x_board: bits.x_board,
            o_board: bits.o_board,
            phase: state.phase,
            current_player: currentPlayerIndex,
            difficulty: difficulty
        })
    });

    const data = await response.json();
    state = { ...data, selected: null };
    render();
    updateUI();

    if (!state.winner && !state.draw && isAivAi()) {
        setTimeout(runAiVsAi, 600);
    } else {
        aiVsAiRunning = false;
    }
}

// ─── Click handler ───────────────────────────────────────────

async function handleClick(index) {
    if (state.winner) return;
    if (isAivAi()) return;  // ← bloque les clics en mode IA vs IA


    // En mode HvH, les deux joueurs sont "HUMAN" et "AI" en alternance
    // On autorise toujours le clic (pas de blocage sur currentPlayer)
    if (!isHvH() && state.currentPlayer !== HUMAN) return;

    if (state.phase === "placement") {
        if (state.board[index] !== EMPTY) return;

        const move = { type: "place", position: index };

        if (isHvH()) {
            applyLocalMove(move);
        } else {
            await sendMove(move);
        }

        return;
    }

    // Phase mouvement
    if (state.selected === null) {
        if (state.board[index] === state.currentPlayer) {
            state.selected = index;
            render();
        }
        return;
    }

    if (state.selected === index) {
        state.selected = null;
        render();
        return;
    }

    const from = state.selected;
    state.selected = null;

    const move = { type: "move", from, to: index };

    if (isHvH()) {
        applyLocalMove(move);
    } else {
        await sendMove(move);
    }
}

// ─── Reset ───────────────────────────────────────────────────

async function resetGame() {
    aiVsAiRunning = false;
    undoStack = [];
    redoStack = [];

    if (isHvH()) {
        state = {
            board: Array(9).fill(EMPTY),
            phase: "placement",
            currentPlayer: HUMAN,
            winner: null,
            selected: null,
            piecesPlaced: { 1: 0, 2: 0 }
        };
        render();
        updateUI();
        updateUndoRedoButtons();
    } else if (isAivAi()) {
        assignAiVsAiDifficulties();
        const response = await fetch(API_URL + "/reset", { method: "POST" });
        state = { ...(await response.json()), selected: null };
        render();
        updateUI();
        updateUndoRedoButtons();
        setTimeout(runAiVsAi, 800);
    } else {
        const response = await fetch(API_URL + "/reset", { method: "POST" });
        state = { ...(await response.json()), selected: null };
        render();
        updateUI();
        updateUndoRedoButtons();
    }
}

// ─── Init ────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    createBoard();
    render();
    updateUI();
    updateUndoRedoButtons();

    document.getElementById("resetBtn").addEventListener("click", resetGame);
    document.getElementById("undoBtn").addEventListener("click", undo);
    document.getElementById("redoBtn").addEventListener("click", redo);
    document.getElementById("modeSelect").addEventListener("change", resetGame);

    // Raccourcis clavier
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "z") undo();
        if (e.ctrlKey && e.key === "y") redo();
    });
});


//_________UNDO           ___________________________________________________
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");

    // Pas de undo/redo en mode IA vs IA
    const allowed = !isAivAi();

    undoBtn.disabled = !allowed || undoStack.length === 0;
    redoBtn.disabled = !allowed || redoStack.length === 0;
}

function undo() {
    if (undoStack.length === 0 || isAivAi()) return;

    // Sauvegarde état actuel dans redo
    redoStack.push(JSON.stringify(state));

    // Restaure le dernier état
    state = JSON.parse(undoStack.pop());

    render();
    updateUI();
    updateUndoRedoButtons();
}

function redo() {
    if (redoStack.length === 0 || isAivAi()) return;

    // Sauvegarde état actuel dans undo
    undoStack.push(JSON.stringify(state));

    // Restaure l'état suivant
    state = JSON.parse(redoStack.pop());

    render();
    updateUI();
    updateUndoRedoButtons();
}