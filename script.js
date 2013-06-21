'use strict';
// init section
var draw = drawGame();
var move = makeMoves();

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
 * frequently the timeTick function is called
 * state.intervalId - id to clear setInterval */

var state = {};
state.pieces = [];
state.occupiedField = getNewCoordinateSystem();
state.lines = 0;
state.level = 1;
state.intervalId = setInterval(timeTick, 1000);



function getNewCoordinateSystem() {
  var coords = [];

  for (var i = 0; i < 23; i++) {
    coords.push(new Array(10));
  }

  return coords;
}

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
    move.up();
  };

  key.down = function() {
    move.down();
  };

  key.left = function() {
    move.left();
  };

  key.right = function() {
    move.right();
  };

  return key;
}


document.onkeydown = watchKeys();


/* 2) module move
 * up(), down(), left(), right()
 * Moves the last piece in the field by generating newCoords, then checks
 * newCoords with the check function. If the check function returns true,
 * replaces currentCoords with newCoords and calls the drawGame function. */



function makeMoves() {
  var moves = {};
  moves.left = left;
  moves.right = right;
  moves.up = up;
  moves.down = down;

  return moves;


  function left() {
    var currentCoords = state.currentPiece.coords;
    var newCoords = getNewCoordinateSystem();

    for (var i = 0; i < currentCoords.length; i++) {
      for (var j = 0; j < currentCoords[i].length; j++) {
        if (!currentCoords[i][j]) continue;

        var newY = i;
        var newX = j - 1;

        if (!checkCoordinates(newY, newX)) {
          return false;
        }

        newCoords[newY][newX] = true;
      }
    }

    state.currentPiece.coords = newCoords;
    state.currentPiece.pivotPoint.x--;
    draw.currentPiece();
    return true;
  }


  function right() {
    var currentCoords = state.currentPiece.coords;
    var newCoords = getNewCoordinateSystem();

    for (var i = 0; i < currentCoords.length; i++) {
      for (var j = 0; j < currentCoords[i].length; j++) {
        if (!currentCoords[i][j]) continue;

        var newY = i;
        var newX = j + 1;

        if (!checkCoordinates(newY, newX)) {
          return false;
        }

        newCoords[newY][newX] = true;
      }
    }

    state.currentPiece.coords = newCoords;
    state.currentPiece.pivotPoint.x++;
    draw.currentPiece();
    return true;
  }


  function up() {
    var currentPiece = state.currentPiece;
    var currentCoords = currentPiece.coords;
    var type = currentPiece.type;

    switch (type) {
      case 'O':
        return true;
      case 'J':
      case 'L':
      case 'T':
        if (!rotateLeft()) {
          return false;
        }
        break;
      case 'I':
      case 'S':
      case 'Z':
        if (!currentPiece.rotated) {
          if (!rotateLeft()) {
            return false;
          }
          currentPiece.rotated = true;
        } else {
          if (!rotateRight()) {
            return false;
          }
          currentPiece.rotated = false;
        }

        break;
    }

    draw.currentPiece();
    return true;


    function rotateLeft() {
      var newCoords = getNewCoordinateSystem();
      var newX, newY;
      var pivotPoint = currentPiece.pivotPoint;

      for (var i = 0; i < currentCoords.length; i++) {
        for (var j = 0; j < currentCoords[i].length; j++) {
          if (!currentCoords[i][j]) continue;

          newY = pivotPoint.y - pivotPoint.x + j;
          newX = pivotPoint.y + pivotPoint.x - i;


          if (!checkCoordinates(newY, newX)) {
            return false;
          }

          newCoords[newY][newX] = true;
        }
      }

      state.currentPiece.coords = newCoords;
      return true;
    }


    function rotateRight() {
      var newCoords = getNewCoordinateSystem();
      var newX, newY;
      var pivotPoint = currentPiece.pivotPoint;

      for (var i = 0; i < currentCoords.length; i++) {
        for (var j = 0; j < currentCoords[i].length; j++) {
          if (!currentCoords[i][j]) continue;

          newY = pivotPoint.x + pivotPoint.y - j;
          newX = pivotPoint.x - pivotPoint.y + i;


          if (!checkCoordinates(newY, newX)) {
            return false;
          }

          newCoords[newY][newX] = true;
        }
      }

      state.currentPiece.coords = newCoords;
      return true;
    }

  }


  function down() {
    var currentCoords = state.currentPiece.coords;
    var newCoords = getNewCoordinateSystem();

    for (var i = 0; i < currentCoords.length; i++) {
      for (var j = 0; j < currentCoords[i].length; j++) {
        if (!currentCoords[i][j]) continue;

        var newY = i + 1;
        var newX = j;

        if (!checkCoordinates(newY, newX)) {
          return false;
        }

        newCoords[newY][newX] = true;
      }
    }

    state.currentPiece.coords = newCoords;
    state.currentPiece.pivotPoint.y++;
    draw.currentPiece();
    return true;

  }


  function checkCoordinates(y, x) {
    if (x < 0 || y < 0 || x > 9 || y > 22) {
      return false;
    }

    if (state.occupiedField[y][x]) {
      return false;
    }

    return true;
  }
}
/* 3) function check(coords)
 * Returns true if coords are within field and are not occupied by
 * other pieces */

/* 4) timeTick function
 * Tries to call move.down(). If fails then pushes it into state.pieces,
 * updates state.occupiedField, calls the clearLine function and calls
 * the createRandomPiece function */


function timeTick() {
  if (move.down()) {
    return;
  }

  state.pieces.push(state.currentPiece);
  updateOccupiedField();
  draw.fixedPiece();
  clearLine();
  getRandomPiece();


  function updateOccupiedField() {
    //console.log('updating field');
  }


  function clearLine() {
    //console.log('checking full lines, calling clear animation, shifting pieces');
  }
}

/* 5) createRandomPiece function
 * Creates new random piece, puts it in window as a next piece,
 * takes the next piece out of that window and puts it in the array of pieces */

// for development purposes to delete later
getRandomPiece();
getRandomPiece();
getRandomPiece();
//


function getRandomPiece() {
  var typeNumber = getRandomTypeNumber();
  var pieceType = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

  state.currentPiece = state.nextPiece;

  if (state.currentPiece) {
    state.currentPiece.specialClass = 'current';
    draw.currentPiece();
  }

  state.nextPiece = new Piece(pieceType[typeNumber]);
  state.nextPiece.specialClass = 'next';
  draw.nextPiece();


  function getRandomTypeNumber() {
    var min = 0;
    var max = 6;

    var randTypeNumber = min + Math.random() * (max + 1 - min);
    randTypeNumber = randTypeNumber ^ 0;

    return randTypeNumber;
  }
}

function Piece(type) {
  // Possible type variants: I, J, L, O, S, T, Z
  this.type = type;
  this.className = type + '-piece';
  this.className += ' cube';
  this.rotated = false;

  var self = this;
  createStartPosition();
  createStartPivotPoint();


  function createStartPosition() {
    self.coords = getNewCoordinateSystem();

    switch (type) {
      case 'I':
        self.coords[0][4] = true;
        self.coords[1][4] = true;
        self.coords[2][4] = true;
        self.coords[3][4] = true;
        break;
      case 'J':
        self.coords[0][4] = true;
        self.coords[1][4] = true;
        self.coords[2][4] = true;
        self.coords[2][3] = true;
        break;
      case 'L':
        self.coords[0][4] = true;
        self.coords[1][4] = true;
        self.coords[2][4] = true;
        self.coords[2][5] = true;
        break;
      case 'O':
        self.coords[0][4] = true;
        self.coords[1][4] = true;
        self.coords[0][3] = true;
        self.coords[1][3] = true;
        break;
      case 'S':
        self.coords[0][4] = true;
        self.coords[0][5] = true;
        self.coords[1][4] = true;
        self.coords[1][3] = true;
        break;
      case 'T':
        self.coords[0][4] = true;
        self.coords[0][5] = true;
        self.coords[0][3] = true;
        self.coords[1][4] = true;
        break;
      case 'Z':
        self.coords[0][4] = true;
        self.coords[0][3] = true;
        self.coords[1][4] = true;
        self.coords[1][5] = true;
        break;
    }
  }


  function createStartPivotPoint() {
    self.pivotPoint = {};

    switch (type) {
      case 'O':
        self.pivotPoint.y = 2;
        self.pivotPoint.x = 3;
        break;
      case 'I':
        self.pivotPoint.y = 2;
        self.pivotPoint.x = 3;
        break;
      case 'J':
      case 'L':
      case 'S':
      case 'T':
      case 'Z':
        self.pivotPoint.y = 0;
        self.pivotPoint.x = 4;
        break;
    }
  }
}


/* 6) drawGame function
 * Draws all pieces on the field
 * there are subfunctions:
 *  to draw state.pieces
 *  to draw state.currentPiece
 *  to draw state.nextPiece
 *  to animate a cleared line */

function drawGame() {
  var drawFunctions = {};

  drawFunctions.currentPiece = currentPiece;
  drawFunctions.nextPiece = nextPiece;
  drawFunctions.fixedPiece = fixedPiece;

  return drawFunctions;


  function currentPiece() {
    if (!state.currentPiece) return;

    clearPiece(state.currentPiece);
    drawPiece(state.currentPiece);
  }


  function nextPiece() {
    clearPiece(state.nextPiece);
    drawPiece(state.nextPiece);
  }


  function fixedPiece() {
    var pieces = state.pieces;
    var last = pieces.length - 1;
    pieces[last].specialClass = '';

    drawPiece(pieces[last]);
  }


  function clearPiece(piece) {
    var cubesToClear = document.getElementsByClassName(piece.specialClass);

    while (cubesToClear.length) {
      var last = cubesToClear.length - 1;
      cubesToClear[last].parentNode.removeChild(cubesToClear[last]);
    }
  }


  function drawPiece(piece) {
    var coords = piece.coords;
    var fieldElem = document.getElementById('field');

    for (var i = 0; i < coords.length; i++) {
      for (var j = 0; j < coords[i].length; j++) {
        if (!coords[i][j]) continue;

        var cube = document.createElement('div');
        var top = i;
        var left = j;
        addClass(cube, piece.className);
        addClass(cube, piece.specialClass);

        if (piece.specialClass == 'next') {
          top += 4;
          left += 9;
        }

        cube.style.top = top + 'em';
        cube.style.left = left + 'em';

        fieldElem.appendChild(cube);
      }
    }
  }


  function removeAllChildren() {
    var fieldElem = document.getElementById('field');
    while (fieldElem.lastChild) {
      fieldElem.removeChild(fieldElem.lastChild);
    }
  }


  function drawCurrentState() {
    var pieces = state.pieces;
    var fieldElem = document.getElementById('field');

    for (var k = 0; k < pieces.length; k++) {
      var piece = pieces[k];
      var pieceCoords = piece.coords;

      for (var i = 0; i < pieceCoords.length; i++) {
        for (var j = 0; j < pieceCoords[i].length; j++) {
          var cube = 0;
          if (!pieceCoords[i][j]) continue;

          cube = document.createElement('div');
          cube.style.top = i + 'em';
          cube.style.left = j + 'em';
          addClass(cube, piece.className);

          fieldElem.appendChild(cube);
        }
      }
    }
  }

  function addClass(el, cls) {
    var c = el.className ? el.className.split(' ') : [];
    for (var i = 0; i < c.length; i++) {
      if (c[i] == cls) return;
    }
    c.push(cls);
    el.className = c.join(' ');
  }


  function removeClass(el, cls) {
    var c = el.className.split(' ');
    for (var i = 0; i < c.length; i++) {
      if (c[i] == cls) c.splice(i--, 1);
    }

    el.className = c.join(' ');
  }


  function hasClass(el, cls) {
    for (var c = el.className.split(' '), i = c.length - 1; i >= 0; i--) {
      if (c[i] == cls) return true;
    }
    return false;
  }
}

/* 7) clearLine function
 * Removes a full line consisting of state.pieces and unshifts their coordinates
 * filling them with an empty line */
