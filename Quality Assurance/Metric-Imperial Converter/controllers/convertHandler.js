const { evaluate } = require("mathjs");

function ConvertHandler(input) {
  this.getNum = function (input) {
    if (!input) return console.error("invalid number");
    const regex1 = new RegExp(/[1-9]\/\/[1-9]|[1-9]\*\*[1-9]/, "");
    const regex2 = new RegExp(/\d+\/\d+\/|\d+\.?\/\d+\.\d+\//, "");
    let result = input.replace(/[A-z]/g, "");
    if (regex1.test(result)) return "invalid number";
    if (regex2.test(result)) return "invalid number";
    if (!result) return 1;
    return evaluate(result);
  };

  this.getUnit = function (input) {
    if (!input) return console.error("invalid unit");
    let result = input.match(/[A-z]/g, "");
    if (result.join("") === "l" || result.join("") === "L") return result.join("").toUpperCase();
    return result.join("").toLowerCase();
  };

  this.getReturnUnit = function (initUnit) {
    if (!initUnit) return "invalid unit";
    const units = {
      gal: "L",
      L: "gal",
      mi: "km",
      km: "mi",
      lbs: "kg",
      kg: "lbs",
    };
    let result = units[initUnit];
    if (!result) return "invalid unit";
    return result;
  };

  this.spellOutUnit = function (unit) {
    if (!unit) return console.error("invalid unit");
    const unitsName = {
      gal: "gallons",
      L: "liters",
      mi: "miles",
      km: "kilometers",
      lbs: "pounds",
      kg: "kilograms",
    };
    let result = unitsName[unit];
    return result;
  };

  this.convert = function (initNum, initUnit) {
    if (initUnit === "invalid unit") return "invalid unit";
    if (initNum === "invalid number") return "invalid number";
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;
    if (initUnit === "gal") return Number((initNum * galToL).toFixed(5));
    if (initUnit === "L") return Number((initNum / galToL).toFixed(5));
    if (initUnit === "lbs") return Number((initNum * lbsToKg).toFixed(5));
    if (initUnit === "kg") return Number((initNum / lbsToKg).toFixed(5));
    if (initUnit === "mi") return Number((initNum * miToKm).toFixed(5));
    if (initUnit === "km") return Number((initNum / miToKm).toFixed(5));
  };

  this.getString = function (initNum, initUnit, returnNum, returnUnit) {
    if (returnUnit === "invalid unit" && initNum === "invalid number") return "invalid number and unit";
    if (returnUnit === "invalid unit") return "invalid unit";
    if (initNum === "invalid number") return "invalid number";
    if (!initNum || !initUnit || !returnNum || !returnUnit) return console.error("Something is invalid!");

    let result = `${initNum} ${this.spellOutUnit(initUnit)} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
    return result;
  };

  this.initNum = this.getNum(input);
  this.initUnit = this.getUnit(input);
  this.returnUnit = this.getReturnUnit(this.initUnit);
  this.returnNum = this.convert(this.initNum, this.initUnit);
  this.string = this.getString(this.initNum, this.initUnit, this.returnNum, this.returnUnit);
}

module.exports = ConvertHandler;
