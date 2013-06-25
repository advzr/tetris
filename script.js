'use strict';
// init section
var draw = makeDrawFunctions();
var move = makeMoveFunctions();
document.onkeydown = makeKeyboardControls();

/* state object
 * state.pieces - all pieces that are already on the bottom
 * of the field and are not moving
 * state.occupiedField - a field with sections marked as
 * occipied by state.pieces
 * state.currentPiece - the current active piece controlled
 * by the "key module"
 * state.nextPiece - the next piece that will come after state.currentPiece
 * state.lines - a quantity of cleared lines
 * state.prevLines - previous cleared lines number
 * state.score - game score
 * state.level - a difficulty level. The higher the level the more
 * frequently the mainLoop function is called
 * state.preGameOver - becomes true if move.down() fails
 * and false if move.down() succeeds afterwards
 * state.intervalId - id to clear setInterval
 * state.firstStart - when the game starts for the first time this property
 * is true in order to do something one time before the game is started */

var state = {};
state.pieces = [];
state.occupiedField = getNewCoordinateSystem();
state.lines = 0;
state.prevLines = 0;
state.score = 0;
state.level = 0;
state.preGameOver = false;
state.paused = false;
state.firstStart = true;

if (showStartMenu()) {
  startGame();
}


function startGame() {
  if (state.firstStart) {
    getRandomPiece();
    getRandomPiece();
    state.firstStart = false;
  }
  state.intervalId = setInterval(mainLoop, (1000 - 10 * state.level));
}


function getNewCoordinateSystem() {
  var coords = [];

  for (var i = 0; i < 23; i++) {
    var tmpArr = [];

    for (var j = 0; j < 10; j++) {
      tmpArr.push(false);
    }

    coords.push(tmpArr);
  }

  return coords;
}

/* 1) module key
 * up(). down(), left(). right()
 * Catches keyboard events and calls the move module */

function makeKeyboardControls() {
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
      case 80:
        key.pause();
        break;
    }
  }

  key.up = function() {
    move.up();
  };

  key.down = function() {
    if (move.down()) {
      state.preGameOver = false;
    }
  };

  key.left = function() {
    move.left();
  };

  key.right = function() {
    move.right();
  };

  key.pause = function() {
    pause();
  };

  return key;
}




/* 2) module move
 * up(), down(), left(), right()
 * Moves the last piece in the field by generating newCoords, then checks
 * newCoords with the check function. If the check function returns true,
 * replaces currentCoords with newCoords and calls the makeDrawFunctions function. */



function makeMoveFunctions() {
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

/* 4) mainLoop function
 * Tries to call move.down(). If fails then pushes it into state.pieces,
 * updates state.occupiedField, calls the clearLine function and calls
 * the createRandomPiece function */


function mainLoop() {
  if (move.down()) {
    state.preGameOver = false;
    return;
  }

  state.pieces.push(state.currentPiece);
  updateOccupiedField();
  draw.fixedPiece();

  clearLine();

  if (state.preGameOver) {
    gameOver();
  }

  manageLevel();

  getRandomPiece();


  function updateOccupiedField() {
    var pieces = state.pieces;
    var last = pieces.length - 1;
    var piece = pieces[last];
    var coords = piece.coords;

    for (var i = 0; i < coords.length; i++) {
      for (var j = 0; j < coords[i].length; j++) {
        if (!coords[i][j]) continue;

        state.occupiedField[i][j] = true;
      }
    }
  }


  function clearLine() {
    var occupiedField = state.occupiedField;
    var fullLines = 0;

    for (var i = 0; i < occupiedField.length; i++) {
      if (occupiedField[i].every(isTrue)) {
        clearLineInOccupiedField(i);
        clearLineInFixedPieces(i);
        draw.allFixedPieces();

        state.lines++;
        fullLines++;
      }
    }

    draw.clearedLinesNumber();
    calculateScore();



    function isTrue(a) {
      return !!a;
    }


    function clearLineInOccupiedField(lineNum) {
      clearLineInCoords(lineNum, state.occupiedField);
    }


    function clearLineInFixedPieces(lineNum) {
      var pieces = state.pieces;

      for (var i = 0; i < pieces.length; i++) {
        clearLineInCoords(lineNum, pieces[i].coords);
      }
    }


    function clearLineInCoords(lineNum, coords) {
      coords.splice(lineNum, 1);

      var tmpArr = [];

      for (var i = 0; i < 10; i++) {
        tmpArr.push(false);
      }

      coords.unshift(tmpArr);
    }


    function calculateScore() {
      var score = 0;

      switch (fullLines) {
        case 1:
          score = 40 * (state.level + 1);
          break;
        case 2:
          score = 100 * (state.level + 1);
          break;
        case 3:
          score = 300 * (state.level + 1);
          break;
        case 4:
          score = 1200 * (state.level + 1);
          break;
      }

      if (score) {
        state.score += score;
        draw.score();
      }
    }
  }


  function manageLevel() {
    if (state.prevLines != state.lines && state.lines % 2 == 0) {
      state.level++;
      draw.level();

      state.prevLines = state.lines;

      clearInterval(state.intervalId);
      startGame();
    }
  }
}

/* 5) createRandomPiece function
 * Creates new random piece, puts it in window as a next piece,
 * takes the next piece out of that window and puts it in the array of pieces */


function getRandomPiece() {
  var typeNumber = getRandomTypeNumber();
  var pieceType = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

  state.preGameOver = true;

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
        self.coords[0][5] = true;
        self.coords[1][5] = true;
        self.coords[0][4] = true;
        self.coords[1][4] = true;
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


/* 6) makeDrawFunctions function
 * Draws all pieces on the field
 * there are subfunctions:
 *  to draw state.pieces
 *  to draw state.currentPiece
 *  to draw state.nextPiece
 *  to animate a cleared line */

function makeDrawFunctions() {
  var drawFunctions = {};

  drawFunctions.currentPiece = currentPiece;
  drawFunctions.nextPiece = nextPiece;
  drawFunctions.fixedPiece = fixedPiece;
  drawFunctions.allFixedPieces = allFixedPieces;
  drawFunctions.clearedLinesNumber = clearedLinesNumber;
  drawFunctions.score = score;
  drawFunctions.level = level;

  return drawFunctions;


  function currentPiece() {
    if (!state.currentPiece) return;

    clearPiecesBySpecialClass(state.currentPiece.specialClass);
    drawPiece(state.currentPiece);
  }


  function nextPiece() {
    clearPiecesBySpecialClass(state.nextPiece.specialClass);
    drawPiece(state.nextPiece);
  }


  function fixedPiece() {
    var pieces = state.pieces;
    var last = pieces.length - 1;
    pieces[last].specialClass = 'fixed';

    drawPiece(pieces[last]);
  }


  function allFixedPieces() {
    var pieces = state.pieces;

    clearPiecesBySpecialClass(pieces[0].specialClass);

    for (var i = 0; i < pieces.length; i++) {
      drawPiece(pieces[i]);
    }
  }


  function clearedLinesNumber() {
    var linesElem = document.getElementById('lines');
    linesElem.innerHTML = state.lines;
  }


  function score() {
    var scoreElem = document.getElementById('score');
    scoreElem.innerHTML = state.score;
  }


  function level() {
    var levelElem = document.getElementById('level');
    levelElem.innerHTML = state.level;
  }



  function clearPiecesBySpecialClass(specialClass) {
    var cubesToClear = document.getElementsByClassName(specialClass);

    while (cubesToClear.length) {
      var last = cubesToClear.length - 1;
      cubesToClear[last].parentNode.removeChild(cubesToClear[last]);
    }
  }


  function drawPiece(piece) {
    var coords = piece.coords;
    var fieldElem = document.getElementById('field');
    var fieldForNextPiece = document.getElementById('next-piece-wrapper');

    for (var i = 0; i < coords.length; i++) {
      for (var j = 0; j < coords[i].length; j++) {
        if (!coords[i][j]) continue;

        var cube = document.createElement('div');
        addClass(cube, piece.className);
        addClass(cube, piece.specialClass);

        var top = i;
        var left = j;

        if (piece.specialClass == 'next') {
          top += 2;
          left -= 2;
          fieldForNextPiece.appendChild(cube);
        } else {

          fieldElem.appendChild(cube);
        }

        cube.style.top = top + 'em';
        cube.style.left = left + 'em';
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



function gameOver() {
  clearInterval(state.intervalId);
  alert('Game Over');
}


function pause() {
  if (state.paused) {
    startGame();
    state.paused = false;
  } else {
    clearInterval(state.intervalId);
    state.paused = true;
  }
}


function showStartMenu() {
  return confirm('Welcome!\n\nControls:\nkeyboard arrows\nP - pause\n\nStart Game?');
}
