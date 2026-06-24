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

// Configuration pour le développement local
const API_URL = "http://localhost:5000";

let state = {
    board: Array(9).fill(EMPTY),
    phase: "placement",
    currentPlayer: HUMAN,
    winner: null,
    selected: null,
    piecesPlaced: { 1: 0, 2: 0 }
};

let isGameOverAlerted = false; 

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

function updateUI() {
    const count1Elem = document.getElementById("count1");
    const count2Elem = document.getElementById("count2");
    const phaseBadge = document.getElementById("phaseBadge");
    const player2Name = document.getElementById("player2Name");
    const p1NameElem = document.querySelector('[data-player="1"] .player-name');
    const msg = document.getElementById("statusMsg");

    if (count1Elem) count1Elem.textContent = state.piecesPlaced[1] + "/3";
    if (count2Elem) count2Elem.textContent = state.piecesPlaced[2] + "/3";
    if (phaseBadge) phaseBadge.textContent = state.phase === "placement" ? "Placement" : "Mouvement";

    if (isAivAi()) {
        const d1 = aiVsAiDifficulties[1];
        const d2 = aiVsAiDifficulties[2];
        if (player2Name) player2Name.textContent = "IA " + (d2 === "hard" ? "Difficile" : "Moyen");
        if (p1NameElem) p1NameElem.textContent = "IA " + (d1 === "hard" ? "Difficile" : "Moyen");
    } else {
        if (player2Name) player2Name.textContent = isHvH() ? "Joueur 2" : "IA";
        if (p1NameElem) p1NameElem.textContent = "Joueur 1";
    }

    const p1 = document.querySelector('[data-player="1"]');
    const p2 = document.querySelector('[data-player="2"]');
    if (p1) p1.classList.toggle("active", state.currentPlayer === HUMAN && !state.winner);
    if (p2) p2.classList.toggle("active", state.currentPlayer === AI && !state.winner);

    if (state.winner || state.draw) {
        let finalMessage = "";

        if (state.draw) {
            finalMessage = "Match nul — répétition de position !";
        } else if (isAivAi()) {
            const winnerDiff = aiVsAiDifficulties[state.winner];
            finalMessage = `IA ${winnerDiff === "hard" ? "Difficile" : "Moyen"} a gagné !`;
        } else if (isHvH()) {
            finalMessage = state.winner === HUMAN ? "Joueur 1 a gagné !" : "Joueur 2 a gagné !";
        } else {
            finalMessage = state.winner === HUMAN ? "Vous avez gagné !" : "L'IA a gagné !";
        }

        if (msg) msg.textContent = finalMessage;

        if (!isGameOverAlerted) {
            isGameOverAlerted = true;
            setTimeout(() => {
                showCustomAlert(finalMessage, state.winner);
            }, 100);
        }
        return;
    }

    if (msg) {
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
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function checkWinner(board, player) {
    return WIN_MASKS.some(mask =>
        mask.every(i => board[i] === player)
    );
}

// ─── API call (HvAI) ────────────────────────────────────────

async function sendMove(move) {
    const bits = boardToBitboards(state.board);

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
let aiVsAiDifficulties = {};  
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
    if (isAivAi()) return;  

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
    isGameOverAlerted = false; 
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

    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "z") undo();
        if (e.ctrlKey && e.key === "y") redo();
    });
});

// ─── UNDO / REDO ─────────────────────────────────────────────

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");
    const allowed = !isAivAi();

    if (undoBtn) undoBtn.disabled = !allowed || undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = !allowed || redoStack.length === 0;
}

function undo() {
    if (undoStack.length === 0 || isAivAi()) return;
    redoStack.push(JSON.stringify(state));
    state = JSON.parse(undoStack.pop());
    render();
    updateUI();
    updateUndoRedoButtons();
}

function redo() {
    if (redoStack.length === 0 || isAivAi()) return;
    undoStack.push(JSON.stringify(state));
    state = JSON.parse(redoStack.pop());
    render();
    updateUI();
    updateUndoRedoButtons();
}

// ─── CUSTOM ALERT DIALOG ──────────────────────────────────────

function showCustomAlert(message, winnerCode) {
    const overlay = document.createElement("div");
    overlay.className = "custom-alert-overlay";

    const box = document.createElement("div");
    box.className = "custom-alert-box";

    // Choix dynamique de la couleur claire
    let themeColor = "#6c757d"; // Gris par défaut
    if (winnerCode === 1) {
        themeColor = "#2e7d32"; // Vert si Joueur 1 gagne
    } else if (winnerCode === 2) {
        themeColor = "#d32f2f"; // Rouge si Joueur 2 gagne
    }

    box.style.setProperty('--alert-color', themeColor);

    box.innerHTML = `
        <h2>Fin de la partie</h2>
        <p>${message}</p>
        <button class="custom-alert-btn">Nouvelle partie</button>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    box.querySelector(".custom-alert-btn").addEventListener("click", () => {
        overlay.remove();
        resetGame(); // Relance automatiquement le plateau de jeu
    });
}