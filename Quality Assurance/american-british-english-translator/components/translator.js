const americanOnly = require("./american-only.js");
const americanToBritishSpelling = require("./american-to-british-spelling.js");
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require("./british-only.js");
const britishToAmericanSpelling = Object.fromEntries(
  Object.entries(americanToBritishSpelling).map(([key, value]) => [value, key])
);
const britishToAmericanTitles = Object.fromEntries(
  Object.entries(americanToBritishTitles).map(([key, value]) => [value, key])
);

class Translator {
  constructor(text, locale) {
    this.text = text;
    this.locale = locale;
    this.translation = this.translate();
  }

  translate() {
    const rSpelling = this.checkSpelling(this.text);
    const rHours = this.checkHours(rSpelling);
    const rTitles = this.checkTitles(rHours);
    if (this.locale === "american-to-british") {
      const american2British = this.american2British(rTitles);
      return this.responseText(american2British);
    }

    if (this.locale === "british-to-american") {
      const british2American = this.british2American(rTitles);
      return this.responseText(british2American);
    }

    return this.responseText(rTitles);
  }

  checkSpelling(text) {
    if (this.locale === "american-to-british") {
      const textArr = text.split(/\W/g);
      let returnString = text;
      textArr.forEach((word) => {
        if (americanToBritishSpelling[word]) {
          returnString = returnString.replace(word, `+++/${americanToBritishSpelling[word]}/+++`);
        }
      });
      return returnString;
    }

    if (this.locale === "british-to-american") {
      const textArr = text.split(/\W/g);
      let returnString = text;

      textArr.forEach((word) => {
        if (britishToAmericanSpelling[word]) {
          returnString = returnString.replace(word, `+++/${britishToAmericanSpelling[word]}/+++`);
        }
      });

      return returnString;
    }
  }

  checkHours(text) {
    if (this.locale === "american-to-british") {
      return text.replace(/(\d\d):(\d\d)/g, `+++/$1.$2/+++`);
    }

    if (this.locale === "british-to-american") {
      return text.replace(/(\d?\d).(\d\d)/g, `+++/$1:$2/+++`);
    }
  }

  checkTitles(text) {
    if (this.locale === "american-to-british") {
      const textArr = text.toLowerCase().match(/\w+[.]/g);
      let returnString = text;
      if (textArr) {
        textArr.forEach((word) => {
          if (americanToBritishTitles[word]) {
            const regexp = new RegExp(`${word}`, `gi`);
            returnString = returnString.replace(
              regexp,
              `+++/${
                americanToBritishTitles[word][0].toUpperCase() +
                americanToBritishTitles[word].slice(1)
              }/+++`
            );
          }
        });
      }
      return returnString;
    }

    if (this.locale === "british-to-american") {
      const textArr = text.toLowerCase().match(/\w+[.]/g);
      let returnString = text;

      if (textArr) {
        textArr.forEach((word) => {
          if (britishToAmericanTitles[word]) {
            const regxp = new RegExp(`${word}`, `gi`);
            returnString = returnString.replace(
              regxp,
              `+++/${
                britishToAmericanTitles[word][0].toUpperCase() +
                britishToAmericanTitles[word].slice(1)
              }`
            );
          }
        });
      }
      return returnString;
    }
  }

  british2American(text) {
    const textArr = text.split(/\W/g);
    let returnString = text;
    textArr.forEach((word) => {
      if (britishOnly[word]) {
        returnString = returnString.replace(word, `+++/${britishOnly[word]}/+++`);
      }
      if (britishOnly[word.toLowerCase()]) {
        returnString = returnString.replace(word, `+++/${britishOnly[word.toLowerCase()]}/+++`);
      }
    });
    return returnString;
  }

  american2British(text) {
    const textArr = text.split(/\W/g);
    let returnString = text;
    textArr.forEach((word) => {
      if (americanOnly[word]) {
        returnString = returnString.replace(word, `+++/${americanOnly[word]}/+++`);
      }

      if (americanOnly[word.toLowerCase()]) {
        returnString = returnString.replace(word, `+++/${americanOnly[word.toLowerCase()]}/+++`);
      }
    });
    return returnString;
  }

  responseText(text) {
    if (text === this.text || !text) {
      return "Everything looks good to me!";
    }
    return text.replace(/\+\+\+\//g, `<span class="highlight">`).replace(/\/\+\+\+/g, `</span>`);
  }
}

module.exports = Translator;
