// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();
// Luxon me parece mais fácil para formatar e trabalhar com datas. Mas o projeto também poderia ser feito sem ele.
// Luxon seems to me easier to format and work with dates. But the project could also be done without him.
const { DateTime } = require("luxon");

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function(req, res) {
  res.json({ greeting: 'hello API' });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

// Crio o caminho para reconhecer datas recebidas
// Create the path to recognize received dates
app.get("/api/:date?", (req, res) => {
  const param = req.params.date
  const response = {}
  if (!Number(param) === true) {
    // Se o "param" tiver qualquer caractere que não seja um número, !Number() vai retornar true.
    // If "param" has any character other than a number, !Number() will return true
    if (typeof (param) === "undefined") {
      // Aqui é pego parametros vazios, retornando a hora atual
      // Here empty parameters are taken, returning the current time
      const date = DateTime.now()
      response['unix'] = date.toMillis()
      response['utc'] = date.toHTTP()
    } else {
      // Aqui é pego qualquer outro caractere e é transformado em data, primeiro pelo JS, e depois Luxon
      // Here, any other character is taken and transformed into a date, first by JS, and then by Luxon
      const date = DateTime.fromJSDate(new Date(param))
      response['unix'] = date.toMillis()
      response['utc'] = date.toHTTP()
    }
  } else if (!Number(param) === false) {
    // Aqui é transformado de milisegundos para Data
    // Here it is transformed from milliseconds to Date
    const date = DateTime.fromMillis(Number(param))
    response['unix'] = date.toMillis()
    response['utc'] = date.toHTTP()
  }
  // A última etapa é validar os resultados, se qualquer um dos resultados apresentar "null", a resposta do servidor vai ser um objeto error, informando que a data está invalida.
  // The last step is to validate the results, if any of the results show "null", the server's response will be an error object, informing that the date is invalid
  !response.unix ? res.json({ error: "Invalid Date" })
    : !response.utc ? res.json({ error: "Invalid Date" })
      : res.json(response)
})

// Esse é um backup para caso não seja enviado uma data. Irá retornar assim como em cima o horario atual
// This is a backup in case a date is not sent. It will return the current time as above
app.get("/api", (req, res) => {
  const date = DateTime.now()
  res.json({ unix: date.toMillis(), utc: date.toHTTP() })
})
