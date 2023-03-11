"use strict";

const expect = require("chai").expect;
const ConvertHandler = require("../controllers/convertHandler.js");

module.exports = function (app) {
  app.route("/api/convert").get((req, res) => {
    const input = req.query.input;
    let convertHandler = new ConvertHandler(input);
    let response = () => {
      if (convertHandler.returnUnit === "invalid unit" && convertHandler.initNum === "invalid number") return "invalid number and unit";
      if (convertHandler.returnUnit === "invalid unit") return "invalid unit";
      if (convertHandler.initNum === "invalid number") return "invalid number";
      return convertHandler;
    };
    res.json(response());
  });
};
