from constants import WIN_MASKS

def evaluate(board):

    if board.has_won("O"):
        return 1000

    if board.has_won("X"):
        return -1000

    score = 0

    if board.o_board & (1 << 4):
        score += 20

    if board.x_board & (1 << 4):
        score -= 20

    for mask in WIN_MASKS:

        ai_count = bin(board.o_board & mask).count("1")
        human_count = bin(board.x_board & mask).count("1")

        if ai_count == 2:
            score += 50

        if human_count == 2:
            score -= 50

    return score