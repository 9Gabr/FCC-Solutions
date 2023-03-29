"use strict";

const SudokuSolver = require("../controllers/sudoku-solver.js");

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route("/api/check").post((req, res) => {
    const { puzzle, coordinate, value } = req.body;
    if (!puzzle || !coordinate || !value) return res.send({ error: "Required field(s) missing" }); // if is finded any empty spot, return error
    if (!solver.validate(puzzle)[0]) return res.send(solver.validate(puzzle)[1]); // if the puzzle ins't valid return error
    return res.send(solver.checkPlacement(puzzle, coordinate, value)); // here we check the value
  });

  app.route("/api/solve").post((req, res) => {
    const { puzzle } = req.body;
    if (!puzzle) return res.send({ error: "Required field missing" }); // if there is no puzzle in form return error
    if (!solver.validate(puzzle)[0]) return res.send(solver.validate(puzzle)[1]); // if the puzzle ins't valid return error
    return res.send(solver.solveResponse(puzzle)); // solve the puzzle
  });
};
