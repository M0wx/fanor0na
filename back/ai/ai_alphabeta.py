from move_generator import generate_moves, apply_move
from evaluation import evaluate


class AlphaBetaAI:

    def __init__(self, depth=6):

        self.depth = depth

        self.transposition = {}

    def best_move(self, board):

        best_score = float("-inf")
        best_move = None

        alpha = float("-inf")
        beta = float("inf")

        moves = generate_moves(board, "O")

        for move in moves:

            child = board.clone()

            apply_move(child, "O", move)

            score = self.alphabeta(
                child,
                self.depth - 1,
                alpha,
                beta,
                False
            )

            if score > best_score:

                best_score = score
                best_move = move

            alpha = max(alpha, score)

        return best_move

    def alphabeta(
        self,
        board,
        depth,
        alpha,
        beta,
        maximizing
    ):

        key = (
            board.x_board,
            board.o_board,
            depth,
            alpha,
            beta,
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
                    self.alphabeta(
                        child,
                        depth - 1,
                        alpha,
                        beta,
                        False
                    )
                )

                alpha = max(
                    alpha,
                    value
                )

                if beta <= alpha:
                    break

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
                    self.alphabeta(
                        child,
                        depth - 1,
                        alpha,
                        beta,
                        True
                    )
                )

                beta = min(
                    beta,
                    value
                )

                if beta <= alpha:
                    break

        self.transposition[key] = value

        return value