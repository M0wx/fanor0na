import random

from move_generator import generate_moves


class RandomAI:

    def best_move(self, board):

        moves = generate_moves(board, "O")

        if not moves:
            return None

        return random.choice(moves)