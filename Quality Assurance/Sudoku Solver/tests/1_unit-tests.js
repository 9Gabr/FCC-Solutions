const chai = require("chai");
const { response } = require("express");
const { puzzlesAndSolutions } = require("../controllers/puzzle-strings.js");
const SudokuSolver = require("../controllers/sudoku-solver.js");
const assert = chai.assert;

let solver = new SudokuSolver();
let [
  [puzzle1, solution1],
  [puzzle2, solution2],
  [puzzle3, solution3],
  [puzzle4, solution4],
  [puzzle5, solution5]
] = puzzlesAndSolutions;

suite("Unit Tests", () => {
  test("Logic handles a valid puzzle string of 81 characters", () => {
    assert.isTrue(solver.validate(puzzle1)[0]);
  });

  test("Logic handles a puzzle string with invalid characters (not 1-9 or .)", () => {
    const invalidPuzzle =
      "1.5..2.84..63.12.7.2..5.AA..9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.";
    assert.isNotTrue(solver.validate(invalidPuzzle)[0]);
    assert.equal(solver.validate(invalidPuzzle)[1]["error"], "Invalid characters in puzzle");
  });

  test("Logic handles a puzzle string that is not 81 characters in length", () => {
    const invalidPuzzle = "..2..3..4..5..";
    assert.equal(
      solver.validate(invalidPuzzle)[1]["error"],
      "Expected puzzle to be 81 characters long"
    );
  });

  test("Logic handles a valid row placement", () => {
    const [board, row, value] = [puzzle2, 0, 6];
    assert.isTrue(solver.checkRowPlacement(board, row, value));
  });

  test("Logic handles an invalid row placement", () => {
    const [board, row, value] = [puzzle2, 0, 5];
    assert.isNotTrue(solver.checkRowPlacement(board, row, value));
  });

  test("Logic handles a valid column placement", () => {
    const [board, col, value] = [puzzle2, 1, 6];
    assert.isTrue(solver.checkColPlacement(board, col, value));
  });

  test("Logic handles an invalid column placement", () => {
    const [board, col, value] = [puzzle2, 1, 5];
    assert.isNotTrue(solver.checkColPlacement(board, col, value));
  });

  test("Logic handles a valid region (3x3 grid) placement", () => {
    const [board, row, column, value] = [puzzle2, 0, 1, 6];
    assert.isTrue(solver.checkRegionPlacement(board, row, column, value));
  });

  test("Logic handles an invalid region (3x3 grid) placement", () => {
    const [board, row, column, value] = [puzzle2, 0, 1, 5];
    assert.isNotTrue(solver.checkRegionPlacement(board, row, column, value));
  });

  test("Valid puzzle strings pass the solver", () => {
    assert.equal(solver.solveResponse(puzzle1)["solution"], solution1);
    assert.equal(solver.solveResponse(puzzle2)["solution"], solution2);
    assert.equal(solver.solveResponse(puzzle3)["solution"], solution3);
    assert.equal(solver.solveResponse(puzzle4)["solution"], solution4);
    assert.equal(solver.solveResponse(puzzle5)["solution"], solution5);
  });

  test("Invalid puzzle strings fail the solver", () => {
    assert.equal(
      solver.solveResponse(
        "6.159.....9..1............4.7.314..6.24.....5..3....1...6.....3...9.2.4......16.."
      )["error"],
      "Puzzle cannot be solved"
    );
  });

  test("Solver returns the expected solution for an incomplete puzzle", () => {
    const puzzle =
      "8...4..6...16..89...98315.749.157.............53..4...96.415..81..7632..3...28.51";
    assert.equal(solver.solveResponse(puzzle)["solution"], solution5);
  });
});
