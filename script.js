const game = new Chess();
const board = Chessboard('board', {
  draggable: true,
  position: 'start',
  onDrop: onDrop
});

const statusEl = document.getElementById('status');

// Start Stockfish
const stockfish = STOCKFISH();
stockfish.onmessage = function (event) {
  if (typeof event === "string" && event.startsWith("bestmove")) {
    const move = event.split(" ")[1];
    game.move({ from: move.substring(0,2), to: move.substring(2,4), promotion: 'q' });
    board.position(game.fen());
    updateStatus();
  }
};

function onDrop(source, target) {
  // Try to make move
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';

  board.position(game.fen());
  updateStatus();

  // Send position to Stockfish
  stockfish.postMessage("position fen " + game.fen());
  stockfish.postMessage("go depth 12");
}

function updateStatus() {
  let status = '';

  if (game.in_checkmate()) {
    status = 'Game over, ' + (game.turn() === 'w' ? 'Black' : 'White') + ' wins!';
  } else if (game.in_draw()) {
    status = 'Game over, drawn position';
  } else {
    status = (game.turn() === 'w' ? 'White' : 'Black') + ' to move';
    if (game.in_check()) {
      status += ', in check';
    }
  }

  statusEl.innerText = status;
}
