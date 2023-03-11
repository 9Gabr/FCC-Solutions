const chai = require("chai");
let assert = chai.assert;
const ConvertHandler = require("../controllers/convertHandler.js");
let convertHandler = new ConvertHandler();
suite("Unit Tests", function () {
  suite("Correctly read", () => {
    test("Whole number input", () => {
      const input = "99mi";
      assert.equal(convertHandler.getNum(input), 99);
    });
    test("Decimal number input", () => {
      const input = "9.9mi";
      assert.equal(convertHandler.getNum(input), 9.9);
    });
    test("Fractional input", () => {
      const input = "9/9mi";
      assert.equal(convertHandler.getNum(input), 9 / 9);
    });
    test("Fractional input with a decimal", () => {
      const input = "9.9/9mi";
      assert.equal(convertHandler.getNum(input), 9.9 / 9);
    });
    test("Each valid input unit", () => {
      const input = ["gal", "L", "mi", "km", "lbs", "kg"];
      input.forEach((number) => assert.equal(convertHandler.getUnit(number), number));
    });
  });
  suite("Correctly return", () => {
    test("An error on a double-fraction", () => {
      const input = "9/9/9mi";
      assert.equal(convertHandler.getNum(input), "invalid number");
    });
    test("Default to a numerical input of 1 when no numerical input is provided", () => {
      const input = "mi";
      assert.equal(convertHandler.getNum(input), 1);
    });
    test("An error for an invalid input unit", () => {
      const input = "10px";
      assert.equal(convertHandler.getReturnUnit(convertHandler.getUnit(input)), "invalid unit");
    });
    test("The correct return unit for each valid input unit", () => {
      const input = ["gal", "L", "mi", "km", "lbs", "kg"];
      input.forEach((unit) => {
        if (input.indexOf(unit) % 2 === 0) {
          return assert.equal(convertHandler.getReturnUnit(unit), input[input.indexOf(unit) + 1]);
        }
        return assert.equal(convertHandler.getReturnUnit(unit), input[input.indexOf(unit) - 1]);
      });
    });
    test("the spelled-out string unit for each valid input unit.", () => {
      const input = ["gal", "L", "mi", "km", "lbs", "kg"];
      const unitsName = {
        gal: "gallons",
        L: "liters",
        mi: "miles",
        km: "kilometers",
        lbs: "pounds",
        kg: "kilograms",
      };
      input.forEach((unit) => assert.equal(convertHandler.spellOutUnit(unit), unitsName[unit]));
    });
  });
  suite("Correctly convert", () => {
    test("gal to L", () => {
      assert.equal(convertHandler.convert(1, "gal"), 3.78541);
    });
    test("L to gal", () => {
      assert.equal(convertHandler.convert(1, "L"), 0.26417);
    });
    test("mi to km", () => {
      assert.equal(convertHandler.convert(1, "mi"), 1.60934);
    });
    test("km to mi", () => {
      assert.equal(convertHandler.convert(1, "km"), 0.62137);
    });
    test("lbs to kg", () => {
      assert.equal(convertHandler.convert(1, "lbs"), 0.45359);
    });
    test("kg to lbs", () => {
      assert.equal(convertHandler.convert(1, "kg"), 2.20462);
    });
  });
});
