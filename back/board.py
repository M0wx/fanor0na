from constants import WIN_MASKS


class Board:

    def __init__(
        self,
        x_board=0,
        o_board=0
    ):

        self.x_board = x_board
        self.o_board = o_board

    def occupied(self):

        return (
            self.x_board |
            self.o_board
        )

    def is_empty(self, pos):

        return not (
            self.occupied()
            & (1 << pos)
        )

    def x_count(self):

        return bin(
            self.x_board
        ).count("1")

    def o_count(self):

        return bin(
            self.o_board
        ).count("1")

    def clone(self):

        return Board(
            self.x_board,
            self.o_board
        )

    def has_won(
        self,
        player
    ):

        board = (
            self.x_board
            if player == "X"
            else self.o_board
        )

        for mask in WIN_MASKS:

            if (
                board & mask
            ) == mask:

                return True

        return False

    def to_array(self):

        result = []

        for i in range(9):

            bit = 1 << i

            if self.x_board & bit:
                result.append(1)

            elif self.o_board & bit:
                result.append(2)

            else:
                result.append(0)

        return result
    
    def place_piece(self, player, position):
        if player == "X":
            self.x_board |= (1 << position)
        else:
            self.o_board |= (1 << position)

    def is_placement_phase(self):

        return self.x_count() < 3 or self.o_count() < 3
    
    def move_piece(self, player, from_pos, to_pos):
        bit_from = 1 << from_pos
        bit_to = 1 << to_pos
        if player == "X":
            self.x_board &= ~bit_from
            self.x_board |= bit_to
        else:
            self.o_board &= ~bit_from
            self.o_board |= bit_to