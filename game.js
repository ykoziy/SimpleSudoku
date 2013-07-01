//
// File: game.js
// Desc: Game logic for 4x4 Sudoku
// Author: Yuriy koziy
//

var moveCounter;
var moveHistory = [];
var originalHTML;

//check if the board is full
function checkFull(state) {
    "use strict";
    var array = [], i = 0, j = 0;
    for (i = 0; i < state.length; i += 1) {
        array = state[i];
        for (j = 0; j < state.length; j += 1) {
            if (array[j] === 0) {
                return 1;
            }
        }
    }
    return 0;
}

//disables undo
function disableUndo() {
    "use strict";
    document.getElementById("btnUndo").disabled = true;
}

//enables undo
function enableUndo() {
    "use strict";
    document.getElementById("btnUndo").disabled = false;
}

// set hint based on number, row wumber and cell number
function setHint(cellNum, num, rowNum) {
    "use strict";
    var element, cell;
    if (rowNum === 0) {
        cell = 'c' + cellNum;
    } else if (rowNum === 1) {
        cellNum = cellNum + 4;
        cell = 'c' + cellNum;
    } else if (rowNum === 2) {
        cellNum = cellNum + 8;
        cell = 'c' + cellNum;
    } else if (rowNum === 3) {
        cellNum = cellNum + 12;
        cell = 'c' + cellNum;
    }
    if (num > 0 && num < 3) {
        element = document.getElementById(cell).rows[0].cells['n' + num];
        if (element !== undefined) {
            element.outerHTML = '';
        }
    }
    if (num > 2 && num < 5) {
        element = document.getElementById(cell).rows[1].cells['n' + num];
        if (element !== undefined) {
            element.outerHTML = '';
        }
    }
}

//marks a cell with selected number
function markCell(cell, value) {
    "use strict";
    var element = document.getElementById('c' + cell),
        string = "<table border=0 id='" + cell + "'> <span>" + value + "</span> </table>";
    element.innerHTML = string;
}

//reset board to original state
function resetBoard() {
    "use strict";
    var element = document.getElementById("board"),
        data = document.getElementById("mcount");
    element.innerHTML = originalHTML;
    data.innerHTML = 0;
}

//check for duplicates in a row and sets hints
function checkRow(state) {
    "use strict";
    var flags = [0, 0, 0, 0],
        emptyCells = [],
        array = [],
        ret = 0,
        rowNum = 0,
        i = 0,
        j = 0,
        z = 0,
        m = 0,
        k = 0;

    for (i = 0; i < state.length; i += 1) {
        array = state[i];
        for (j = 0; j < state.length; j += 1) {
            if (array[j] !== 0) {
                k = array[j] - 1;
                if (flags[k] !== 1) {
                    flags[k] = 1;
                } else {
                    ret = 1;
                }
            } else {
                emptyCells.push(j);
            }

        }

        //set hints for the row
        for (z = 0; z < emptyCells.length; z += 1) {
            for (m = 0; m < flags.length; m += 1) {
                if (flags[m] === 1) {
                    setHint(emptyCells[z], m + 1, rowNum);
                }
            }
        }
        rowNum += 1;
        emptyCells = [];
        flags = [0, 0, 0, 0];
    }
    if (ret === 0) {
        return 0;
    }
    return 1;
}

//check for duplicates in a column and sets hints
function checkColumn(state) {
    "use strict";
    var flags = [0, 0, 0, 0],
        emptyCells = [],
        colNum = 0,
        ret = 0,
        i = 0,
        j = 0,
        k = 0,
        m = 0,
        z = 0;

    for (i = 0; i < state.length; i += 1) {
        for (j = 0; j < state.length; j += 1) {
            if (state[j][colNum] !== 0) {
                k = state[j][colNum] - 1;
                if (flags[k] !== 1) {
                    flags[k] = 1;
                } else {
                    ret = 1;
                }
            } else {
                emptyCells.push(j);
            }
        }

        //set hints for the column
        if (emptyCells.length !== 4) {
            for (m = 0; m < flags.length; m += 1) {
                if (flags[m] === 1) {
                    for (z = 0; z < emptyCells.length; z += 1) {
                        setHint(colNum, m + 1, emptyCells[z]);
                    }
                }
            }
        }
        emptyCells = [];
        colNum += 1;
        flags = [0, 0, 0, 0];
    }
    if (ret === 0) {
        return 0;
    }
    return 1;
}

//check for duplicates in quadrants and sets hints
function checkQuadrants(state) {
    "use strict";
    var quads = [[state[0][0], state[0][1], state[1][0], state[1][1]], [state[0][2], state[0][3], state[1][2], state[1][3]], [state[2][0], state[2][1], state[3][0], state[3][1]], [state[2][2], state[2][3], state[3][2], state[3][3]]],
        emptyCells = [],
        array = [],
        flags = [0, 0, 0, 0],
        ret = 0,
        i = 0,
        j = 0,
        k = 0,
        z = 0,
        m = 0,
        em = 0;

    for (i = 0; i < quads.length; i += 1) {
        array = quads[i];
        for (j = 0; j < quads.length; j += 1) {
            if (array[j] !== 0) {
                k = array[j] - 1;
                if (flags[k] !== 1) {
                    flags[k] = 1;
                } else {
                    ret = 1;
                }
            } else {
                emptyCells.push(j);
            }
        }

        //set hints for the quadrants
        for (z = 0; z < emptyCells.length; z += 1) {
            for (m = 0; m < flags.length; m += 1) {
                if (flags[m] === 1) {
                    em = emptyCells[z];
                    if (i === 0 || i === 1) {
                        if (em >= 0 && em <= 1) {
                            if (i === 1) {
                                setHint(em + 2, m + 1, 0);
                            } else {
                                setHint(em, m + 1, 0);
                            }
                        }
                        if (em >= 2 && em <= 3) {
                            if (i === 0) {
                                setHint(em - 2, m + 1, 1);
                            } else {
                                setHint(em, m + 1, 1);
                            }
                        }
                    }
                    if (i === 2 || i === 3) {
                        if (em >= 0 && em <= 1) {
                            if (i === 3) {
                                setHint(em + 2, m + 1, 2);
                            } else {
                                setHint(em, m + 1, 2);
                            }
                        }
                        if (em >= 2 && em <= 3) {
                            if (i === 2) {
                                setHint(em - 2, m + 1, 3);
                            } else {
                                setHint(em, m + 1, 3);
                            }
                        }
                    }
                }
            }
        }
        flags = [0, 0, 0, 0];
        emptyCells = [];
    }
    if (ret === 0) {
        return 0;
    }
    return 1;
}

//read board state and returns an array of current board state
function readState() {
    "use strict";
    var state = [], array = [], i = 0, element, data;
    for (i = 0; i < 16; i += 1) {
        element = document.getElementById('c' + i);
        data = element.getElementsByTagName("span");
        if (data[0] !== undefined) {
            array.push(data[0].innerHTML);
            if ((i + 1) % 4 === 0) {
                state.push(array);
                array = [];
            }
        } else {
            array.push(0);
            if ((i + 1) % 4 === 0) {
                state.push(array);
                array = [];
            }
        }
    }
    return state;
}

//apply state from array to the board
function applyState(state) {
    "use strict";
    var cellCount = 0, i = 0, j = 0, array = [];
    for (i = 0; i < state.length; i += 1) {
        array = state[i];
        for (j = 0; j < state.length; j += 1) {
            if (array[j] !== 0) {
                markCell(cellCount, array[j]);
            }
            cellCount += 1;
        }
    }
}

//increment move counter
function addMove() {
    "use strict";
    moveCounter += 1;
    var data = document.getElementById("mcount");
    data.innerHTML = moveCounter;
}

//undo a move and decrement move counter
function undo() {
    "use strict";
    if (moveCounter > 0) {
        moveCounter -= 1;
        var data = document.getElementById("mcount");
        data.innerHTML = moveCounter;
        if (moveCounter === 0) {
            resetBoard();
            moveHistory = [];
            applyState(initBoard);
            checkColumn(initBoard);
            checkRow(initBoard);
            checkQuadrants(initBoard);
            disableUndo();
        } else {
            moveHistory.pop();
            resetBoard();
            applyState(moveHistory[moveCounter - 1]);
            checkColumn(moveHistory[moveCounter - 1]);
            checkRow(moveHistory[moveCounter - 1]);
            checkQuadrants(moveHistory[moveCounter - 1]);
        }
    }
}

//initialize the game board
function initialize() {
    "use strict";
    originalHTML = document.getElementById("board").innerHTML;
    applyState(initBoard);
    moveCounter = 0;
    disableUndo();
    checkColumn(initBoard);
    checkRow(initBoard);
    checkQuadrants(initBoard);
}

//check if sudoku was completed
function checkBoard(currState) {
    "use strict";
    if (checkColumn(currState) === 0 && checkRow(currState) === 0 && checkQuadrants(currState) === 0) {
        if (checkFull(currState) === 0) {
            alert("Victory!");
            resetBoard();
            initialize();
        }
    }
}

//handles click events for each number in a cell
function clickNumber(cell, value) {
    "use strict";
    markCell(cell, value);
    addMove();
    enableUndo();
    moveHistory.push(readState());
    checkBoard(moveHistory[moveHistory.length - 1]);
}
