from constants import NEIGHBORS

def generate_moves(board, player):

    moves = []

    if board.is_placement_phase():

        for pos in range(9):
            if board.is_empty(pos):
                moves.append(("place", pos))

        return moves

    player_board = board.x_board if player == "X" else board.o_board

    occupied = board.occupied()

    for src in range(9):

        if player_board & (1 << src):

            for dst in NEIGHBORS[src]:

                if not (occupied & (1 << dst)):
                    moves.append(("move", src, dst))

    return moves

def apply_move(board, player, move):

    if move[0] == "place":
        board.place_piece(player, move[1])

    else:
        board.move_piece(
            player,
            move[1],
            move[2]
        )

def move_piece(self, player, from_pos, to_pos):
    bit_from = 1 << from_pos
    bit_to = 1 << to_pos
    if player == "X":
        self.x_board &= ~bit_from  # clear old position
        self.x_board |= bit_to     # set new position
    else:
        self.o_board &= ~bit_from
        self.o_board |= bit_to