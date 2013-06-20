'use strict';

/* state object
 * state.pieces - all pieces that are already on the bottom
 * of the field and are not moving
 * state.occupiedField - a field with sections marked as
 * occipied by state.pieces
 * state.currentPiece - the current active piece controlled
 * by the "key module"
 * state.nextPiece - the next piece that will come after state.currentPiece
 * state.lines - a quantity of cleared lines
 * state.level - a difficulty level. The higher the level the more
 * frequently the timeTick function is called */

/* 1) module key
 * up(). down(), left(). right()
 * Catches keyboard events and calls the move module */

function watchKeys() {
  function key(event) {
    var event = event || window.event;

    switch (event.keyCode) {
      case 37:
        key.left();
        break;
      case 39:
        key.right();
        break;
      case 38:
        key.up();
        break;
      case 40:
        key.down();
        break;
    }
  }

  key.up = function() {
    console.log('key up pressed');
  };

  key.down = function() {
    console.log('key down pressed');
  };

  key.left = function() {
    console.log('key left pressed');
  };

  key.right = function() {
    console.log('key right pressed');
  };

  return key;
}


document.onkeydown = watchKeys();


/* 2) module move
 * up(), down(), left(), right()
 * Moves the last piece in the field by generating newCoords, then checks
 * newCoords with the check function. If the check function returns true,
 * replaces currentCoords with newCoords and calls the drawGame function. */

/* 3) function check(coords)
 * Returns true if coords are within field and are not occupied by
 * other pieces */

/* 4) timeTick function
 * Tries to call move.down(). If fails then pushes it into state.pieces,
 * updates state.occupiedField, calls the clearLine function and calls
 * the createRandomPiece function */

/* 5) createRandomPiece function
 * Creates new random piece, puts it in window as a next piece,
 * takes the next piece out of that window and puts it in the array of pieces */

/* 6) drawGame function
 * Draws all pieces on the field
 * there are subfunctions:
 *  to draw state.pieces
 *  to draw state.currentPiece
 *  to draw state.nextPiece
 *  to animate a cleared line */

/* 7) clearLine function
 * Removes a full line consisting of state.pieces and unshifts their coordinates
 * filling them with an empty line */
