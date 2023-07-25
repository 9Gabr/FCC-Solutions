"use strict";

const Translator = require("../components/translator.js");

module.exports = function (app) {
  app.route("/api/translate").post((req, res) => {
    const { text, locale } = req.body;
    const validLocales = ["american-to-british", "british-to-american"];

    if (text === undefined || !locale) return res.send({ error: "Required field(s) missing" });

    if (!text) return res.send({ error: "No text to translate" });

    if (!validLocales.includes(locale)) {
      return res.send({ error: "Invalid value for locale field" });
    }
    
    const translator = new Translator(text, locale);
    return res.send({ text: text, translation: translator.translation });
  });
};
