from move_generator import generate_moves, apply_move
from evaluation import evaluate


class MinimaxAI:

    def __init__(self, depth=4):

        self.depth = depth

        self.transposition = {}

    def best_move(self, board):

        best_score = float("-inf")
        best_move = None

        moves = generate_moves(board, "O")

        for move in moves:

            child = board.clone()

            apply_move(child, "O", move)

            score = self.minimax(
                child,
                self.depth - 1,
                False
            )

            if score > best_score:

                best_score = score
                best_move = move

        return best_move

    def minimax(
        self,
        board,
        depth,
        maximizing
    ):

        key = (
            board.x_board,
            board.o_board,
            depth,
            maximizing
        )

        if key in self.transposition:
            return self.transposition[key]

        if board.has_won("O"):
            return 1000

        if board.has_won("X"):
            return -1000

        if depth == 0:
            return evaluate(board)

        player = "O" if maximizing else "X"

        moves = generate_moves(board, player)

        if not moves:
            return evaluate(board)

        if maximizing:

            value = float("-inf")

            for move in moves:

                child = board.clone()

                apply_move(
                    child,
                    player,
                    move
                )

                value = max(
                    value,
                    self.minimax(
                        child,
                        depth - 1,
                        False
                    )
                )

        else:

            value = float("inf")

            for move in moves:

                child = board.clone()

                apply_move(
                    child,
                    player,
                    move
                )

                value = min(
                    value,
                    self.minimax(
                        child,
                        depth - 1,
                        True
                    )
                )

        self.transposition[key] = value

        return value