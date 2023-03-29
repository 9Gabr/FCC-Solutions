class SudokuSolver {
  buildBoard(boardString) {
    let puzzleArr = boardString.split("");
    let arr2push = [];
    let board = [];
    for (let i = 0; i < puzzleArr.length; i++) {
      if (puzzleArr[i] === ".") puzzleArr[i] = 0;
      if (puzzleArr[i] !== ".") puzzleArr[i] = Number(puzzleArr[i]);
      arr2push.push(puzzleArr[i]);
      if (arr2push.length === 9) {
        board.push(arr2push);
        arr2push = [];
      }
    }
    return board;
  } // here is created the board 
  // that consists in a array with nine arrays that represents the rows, and nine numbers inside that represents the cells

  validate(boardString) {
    if (boardString.length !== 81)
      return [false, { error: "Expected puzzle to be 81 characters long" }]; // validate length

    if (boardString.search(/[^.1-9]/g) !== -1)
      return [false, { error: "Invalid characters in puzzle" }]; // validate characters

    let board = this.buildBoard(boardString);
    let checkBoard = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== 0) checkBoard.push(board[r][c]);
      }
      if (checkBoard.length !== new Set(checkBoard).size)
        return [false, { error: "Puzzle cannot be solved" }]; // if the set length is bigger then checkBoard length, that means it has duplicate numbers
      checkBoard = [];
    } // validate rows
    for (let c = 0; c < 9; c++) {
      for (let r = 0; r < 9; r++) {
        if (board[r][c] !== 0) checkBoard.push(board[r][c]);
      }
      if (checkBoard.length !== new Set(checkBoard).size)
        return [false, { error: "Puzzle cannot be solved" }]; // if the set length is bigger then checkBoard length, that means it has duplicate numbers
      checkBoard = [];
    } // validadte columns

    return [true];
  }

  checkRowPlacement(board, row, value) {
    if (typeof board === "string") board = this.buildBoard(board);
    for (let i = 0; i < 9; i++) if (board[row][i] === value) return false;
    return true;
  }

  checkColPlacement(board, column, value) {
    if (typeof board === "string") board = this.buildBoard(board);

    for (let i = 0; i < 9; i++) if (board[i][column] === value) return false;

    return true;
  }

  checkRegionPlacement(board, row, column, value) {
    if (typeof board === "string") board = this.buildBoard(board);

    let boxRow = Math.floor(row / 3) * 3; // here we will make the square, first we take the row
    let boxCol = Math.floor(column / 3) * 3; // then the col
    // the math behind this is that the calc will return 0, 3, 6 and in the for loop whe add 0, 1 or 2 to make check in square

    for (let r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        if (board[boxRow + r][boxCol + c] === value) return false;
      }
    }

    return true;
  }

  checkValue(board, row, column, value) {
    if (
      this.checkRowPlacement(board, row, value) &&
      this.checkColPlacement(board, column, value) &&
      this.checkRegionPlacement(board, row, column, value)
    ) {
      return true;
    }
    return false;
  } // here is a shortcut, so we don't have to write text per test

  checkEmpty(board) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          return [r, c];
        }
      }
    }
    return [-1, -1];
  } // find the next empty value in board, if there ins't any value we return -1 to tell the solve that table is already completed

  checkPlacement(board, coordinate, value) {
    const rows = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8 };
    if (typeof board === "string") board = this.buildBoard(board);

    if (coordinate.length !== 2) return { error: "Invalid coordinate" }; // if the coordinate ins't valid return error
    if (isNaN(Number(value))) return { error: "Invalid value" }; // return error if the value ins't a number

    let row = rows[coordinate.split("")[0]];
    let column = Number(coordinate.split("")[1] - 1);
    let val = Number(value);

    if (row < 0 || row > 8 || column < 0 || column > 8) return { error: "Invalid coordinate" }; // prevent wrong values
    if (isNaN(row) || isNaN(column)) return { error: "Invalid coordinate" }; // if row or column ins't a number return error
    if (val < 1 || val > 9) return { error: "Invalid value" }; // prevent wrong values

    if (this.checkValue(board, row, column, val)) return { valid: true }; // check row, column and region, if any of these return a error, we try to find where is the wrong placement
    if (board[row][column] === val) return { valid: true }; // if the value already is in the cell, we return valid, the table is verified before, so we are secure that the number is ok to place

    let conflictArr = [];
    if (!this.checkRowPlacement(board, row, val)) conflictArr.push("row"); // check the row
    if (!this.checkColPlacement(board, column, val)) conflictArr.push("column"); // check the column
    if (!this.checkRegionPlacement(board, row, column, val)) conflictArr.push("region"); // check the region

    return { valid: false, conflict: conflictArr }; // finally is returned the response
  }

  solveResponse(board) {
    const solved = this.solve(board);
    if (!solved) return { error: "Puzzle cannot be solved" }; // if the solve don't return a board, it means that we failed to complete, and the puzzle is wrong
    return { solution: solved.flat().join("") };
  }

  solve(board) {
    if (typeof board === "string") board = this.buildBoard(board);

    let [emptyRow, emptyCol] = this.checkEmpty(board); // here we take the emtpy cells coords

    if (emptyRow === -1 || emptyCol === -1) return board; // if the row returned from empty is -1 that mean that we filled all the cells

    for (let value = 1; value <= 9; value++) {
      if (this.checkValue(board, emptyRow, emptyCol, value)) {
        board[emptyRow][emptyCol] = value; // if the value is ok to be placed we fill the cell with
        if (this.solve(board)) { // Then whe check if the board can continue to progress
          return this.solve(board); // if it's okay to continue the solve is called again
        }
        board[emptyRow][emptyCol] = 0; // if the board find any problem, we backtrack that number and continue try numbers till find the response
      }
    } // this is the most complex, for me :(, part of the solver

    return false;
  } // solve with backtracking algorithm 
}

module.exports = SudokuSolver;
