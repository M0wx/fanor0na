from flask import Flask, request, jsonify
from flask_cors import CORS

from board import Board
from move_generator import apply_move

from ai.ai_random import RandomAI
from ai.ai_minimax import MinimaxAI
from ai.ai_alphabeta import AlphaBetaAI

app = Flask(__name__)
CORS(app)

# Variable globale pour tracker l'historique en mode IA vs IA
position_history = []


@app.route("/play", methods=["POST"])
def play():
    try:
        data = request.json
        print("DATA =", data)

        board = Board(data["x_board"], data["o_board"])
        phase = data["phase"]
        player_move_dict = data["move"]
        difficulty = data.get("difficulty", "medium")

        # Convert dict → tuple that move_generator expects
        if player_move_dict["type"] == "place":
            player_move = ("place", player_move_dict["position"])
        else:
            player_move = ("move", player_move_dict["from"], player_move_dict["to"])

        apply_move(board, "X", player_move)

        if board.has_won("X"):

            return jsonify(
                build_state(
                    board,
                    phase,
                    winner=1
                )
            )

        if difficulty == "easy":
            ai = RandomAI()
        elif difficulty == "hard":
            ai = AlphaBetaAI(depth=6)
        else:
            ai = MinimaxAI(depth=4)  # medium par défaut

        ai_move = ai.best_move(board)

        print("AI MOVE =", ai_move)

        if ai_move:

            apply_move(
                board,
                "O",
                ai_move
            )

        winner = None

        if board.has_won("O"):
            winner = 2

        result = build_state(
            board,
            phase,
            winner
        )

        print("RESULT =", result)

        return jsonify(result)

    except Exception as e:

        import traceback

        traceback.print_exc()

        return jsonify({
            "error": str(e)
        }), 500


@app.route("/reset", methods=["POST"])
def reset():
    global position_history
    position_history = []  # reset l'historique
    board = Board()
    return jsonify(build_state(board, "placement"))


def build_state(
        board,
        phase,
        winner=None):

    state = {
        "board": board.to_array(),
        "phase": phase,
        "winner": winner,
        "currentPlayer": 1,  # ← toujours 1 !
        "piecesPlaced": {
            "1": board.x_count(),
            "2": board.o_count()
        }
    }

    if (
        board.x_count() == 3 and
        board.o_count() == 3
    ):
        state["phase"] = "movement"

    return state



@app.route("/ai_move", methods=["POST"])
def ai_move():
    global position_history

    try:
        data = request.json

        current_player = data["current_player"]
        difficulty = data["difficulty"]
        phase = data["phase"]

        if difficulty == "easy":
            ai = RandomAI()
        elif difficulty == "hard":
            ai = AlphaBetaAI(depth=6)
        else:
            ai = MinimaxAI(depth=4)

        if current_player == 1:
            board = Board(data["o_board"], data["x_board"])
        else:
            board = Board(data["x_board"], data["o_board"])

        move = ai.best_move(board)

        if move:
            apply_move(board, "O", move)

        winner = None
        if board.has_won("O"):
            winner = current_player

        if current_player == 1:
            final_board = Board(board.o_board, board.x_board)
        else:
            final_board = Board(board.x_board, board.o_board)

        # Détection de nulle par répétition
        draw = False
        if phase == "movement" and not winner:
            position_key = (final_board.x_board, final_board.o_board)
            position_history.append(position_key)

            # Nulle si une position apparaît 3 fois
            if position_history.count(position_key) >= 3:
                draw = True
                position_history = []  # reset pour la prochaine partie

        result = build_state(final_board, phase, winner)
        result["currentPlayer"] = 2 if current_player == 1 else 1
        result["draw"] = draw

        print(f"AI_MOVE → player={current_player} move={move} winner={winner} draw={draw}")

        return jsonify(result)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    


    

if __name__ == "__main__":
    app.run(debug=True)