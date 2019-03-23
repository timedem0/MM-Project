// 1 = foot
// 2 = nuke
// 3 = roach

export function computeResult(player1, player2) {

  if ((player1 == player2) && (player1 != 'Nuke')) {
    return 'tie';
  } else if ((player1 == player2) && (player2 == 'Nuke')) {
    return 'nuke';
  } else if (player1 == 'Foot' && player2 == 'Nuke') {
    return 'lose';
  } else if (player1 == 'Foot' && player2 == 'Roach') {
    return 'win';
  } else if (player1 == 'Nuke' && player2 == 'Foot') {
    return 'win';
  } else if (player1 == 'Nuke' && player2 == 'Roach') {
    return 'lose';
  } else if (player1 == 'Roach' && player2 == 'Foot') {
    return 'lose';
  } else if (player1 == 'Roach' && player2 == 'Nuke') {
    return 'win';
  }
}
