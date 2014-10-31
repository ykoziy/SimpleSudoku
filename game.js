//
// File: game.js
// Desc: Game logic for 4x4 Sudoku
// Author: Yuriy koziy
//

"use strict";
var moveCounter;
var moveHistory = [];
var originalHTML;

// document.getElementById wrapper
var $ = function(id) {
	return document.getElementById(id);
};

//check if the board is full
function checkFull(state) {
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
    $("btnUndo").disabled = true;
}

//enables undo
function enableUndo() {
    $("btnUndo").disabled = false;
}

//marks a cell with selected number
function markCell(cell, value) {
    var element = $('c' + cell),
        string = "<table id='" + cell + "'> <span>" + value + "</span> </table>";
    element.innerHTML = string;
}

//reset board to original state
function resetBoard() {
    var element = $("board"),
        data = $("mcount");
    element.innerHTML = originalHTML;
    data.innerHTML = 0;
}

// set hint based on number, row wumber and cell number
function setHint(cellNum, num, rowNum) {
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
        //element = $(cell).rows[0].cells['n' + num];
        element = $(cell).rows[0].getElementsByClassName('n' + num)[0];
        if (element !== undefined) {
            element.outerHTML = '<td></td>';
        }
    }
    if (num > 2 && num < 5) {
        //element = $(cell).rows[1].cells['n' + num];
        element = $(cell).rows[1].getElementsByClassName('n' + num)[0];
        if (element !== undefined) {
           element.outerHTML = '<td></td>';
        }
    }
}

//check for duplicates in a row and sets hints
function checkRow(board, row) {
	var hit = [0, 0, 0, 0, 0],
		emptyCells = [],
		ret = 1;

	for(var col = 0; col < 4; col += 1) {
		if(board[row][col] !== 0) {
			if(hit[board[row][col]] === 1) {
				ret = 0;
			}
			hit[board[row][col]] = 1
		} else {
			emptyCells.push(col);
		}
	}

	//set hints
	if (emptyCells.length !== 4) {
		for (var m = 0; m < hit.length; m += 1) {
			if (hit[m] == 1) {
				for (var z = 0; z < emptyCells.length; z += 1) {
					setHint(emptyCells[z], m , row);
				}
            }
        }
    }
	if(ret === 0) {
		return false;
	}
	return true;
}

//check for duplicates in a column and sets hints
function checkColumn(board, col) {
	var hit = [0, 0, 0, 0, 0],
		emptyCells = [],
		ret = 1;

	for(var row = 0; row < 4; row += 1) {
		if(board[row][col] !== 0) {
			if(hit[board[row][col]] === 1) {
				ret = 0;
			}
			hit[board[row][col]] = 1
		} else {
			emptyCells.push(row);
		}
	}

	//set hints
	if (emptyCells.length !== 4) {
		for (var m = 0; m < hit.length; m += 1) {
			if (hit[m] == 1) {
				for (var z = 0; z < emptyCells.length; z += 1) {
					setHint(col, m, emptyCells[z]);
				}
            }
        }
    }
	if(ret === 0) {
		return false;
	}
	return true;
}

//check for duplicates in quadrants and sets hints
function checkQuadrant(board, row, col) {
	var hit = [0, 0, 0, 0, 0],
	emptyCells = [],
	ret = 1;

	for(var i = row; i < row+2; i += 1) {
		for(var j = col; j < col+2; j += 1) {
			if(board[i][j] !== 0) {
				if(hit[board[i][j]] === 1) {
					ret = 0;
				}
				hit[board[i][j]] = 1
			} else {
				emptyCells.push({r: i, c: j});
			}
		}
	}

	//set hints
	if(emptyCells.length !== 4)
	{
		for(var m = 0; m < hit.length; m += 1) {
			if(hit[m] == 1) {
				for(i in emptyCells) {
					setHint(emptyCells[i].c, m, emptyCells[i].r);
				}
			}
		}
	}
	if(ret === 0) {
		return false;
	}
	return true;
}

//read board state and returns an array of current board state
function readState() {
    var state = [], array = [], i = 0, element, data;
    for (i = 0; i < 16; i += 1) {
        element = $('c' + i);
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
    moveCounter += 1;
    var data = $("mcount");
    data.innerHTML = moveCounter;
}

//undo a move and decrement move counter
function undo() {
    if (moveCounter > 0) {
        moveCounter -= 1;
        var data = $("mcount");
        data.innerHTML = moveCounter;
        if (moveCounter === 0) {
            resetBoard();
            moveHistory = [];
            applyState(initBoard);
            checkSudoku(initBoard);
            disableUndo();
        } else {
            moveHistory.pop();
            resetBoard();
            applyState(moveHistory[moveCounter - 1]);
            checkSudoku(moveHistory[moveCounter - 1]);
        }
    }
}

//initialize the game board
function initialize() {
    originalHTML = $("board").innerHTML;
    applyState(initBoard);
    moveCounter = 0;
    disableUndo();
    checkSudoku(initBoard);
}

//check if sudoku was completed
function checkBoard(currState) {
    if (checkSudoku(currState) === true) {
        if (checkFull(currState) === 0) {
            alert("Victory!");
            resetBoard();
            initialize();
        }
    }
}

function checkSudoku(currState) {

	for(var col = 0; col < 4; col += 1) {
		if(checkColumn(currState, col) === false) {
			return false;		
		}
	}

	for(var row = 0; row < 4; row += 1) {
		if(checkRow(currState, row) === false) {
			return false;		
		}
	}

	for(row = 0; row < 4; row += 2) {
		for(col = 0; col < 4; col += 2) {
			if(checkQuadrant(currState, row, col) === false) {
				return false;
			}			
		}
	}
	return true;
}

//handles click events for each number in a cell
function clickNumber(cell, value) {
    markCell(cell, value);
    addMove();
    enableUndo();
    moveHistory.push(readState());
    checkBoard(moveHistory[moveHistory.length - 1]);
}
