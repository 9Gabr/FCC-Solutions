//requires
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dns = require('dns');

// express
const app = express();

// Mongoose
const { Schema, model } = mongoose; 
// Exporto os modulos que vou utilizar para criar um Schema e um Model
// I export the modules that I will use to create a Schema and a Model

const mongo_uri = process.env['MONGO_URI']; 
// URI secreto através do sistema do replit
// Secret URI through the replit system

mongoose.connect(mongo_uri); 
// Conectando ao mongoDB Cloud
// Connecting to mangoDB Cloud

const urlSchema = new Schema({
  original_url: { type: String, required: true, unique: true }, 
  // Ao criar o esquema eu optei por colocar as urls originais como únicas para não ocupar muito da DB
  // When creating the schema I chose to put the original urls as unique so as not to take up too much of the DB
  short_url: { type: Number, unique: true }
  // "Unique" aqui serve para certificar que não vai ser criado uma short_url repetida
  // "Unique" here is to make sure that a repeated short_url is not created
});
const Shortner = model('Shortner', urlSchema);
// Model criado
// Model created

// Basic Configuration
app.use('/', bodyParser.urlencoded({ extended: false }))

const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

//
app.route("/api/shorturl").post(async (req, res) => {
  // A função precisa ser Async para eu conseguir executar "estimatedDocumentCount()" que retorna o número de documentos na DB
  // The function needs to be Async for me to be able to execute "estimatedDocumentCount()" which returns the number of documents in the DB
  const { url } = req.body 
  // Url enviada pelo body
  // Url sent by the body
  const shortGen = await Shortner.estimatedDocumentCount() 
  // Informa o número de itens na DB, assim adicionando mais um, eu tenho números únicos em sequencia
  // Informs the number of items in the DB, so adding one more, I have unique numbers in sequence
  const domain = new URL(url) 
  // Crio um novo objeto de URL para que eu possa trabalhar mais fácil com ele
  // I create a new URL object so I can work with it easier
  const hostname = domain.hostname.replace('www.', '') 
  // ".hostname" seguido do ".replace" faz com que a url venha assim: "exemplo.com"
  // ".hostname" followed by ".replace" makes the url look like this: "example.com"

  dns.lookup(hostname, (err) => {
    // "dns.lookup" vai checar se o endereço é correto
    // "dns.lookup" will check if the address is correct
    if (err) return res.json({ error: 'invalid url' });
    // Caso não for ele retorna um JSON informando o erro
    // If not, it returns a JSON reporting the error
    if (!err) {
      // Se tudo estiver certo prossegue criando o novo Model
      // If everything is ok proceed creating the new Model
      const newShortUrl = new Shortner({
        original_url: url,
        short_url: shortGen + 1
      });

      newShortUrl.save(err => {
        // Aqui é salvo o model
        // Here the model is saved
        if (err) return console.error(err)
        Shortner.find({ original_url: url }, (err, data) => {
          // Depois de salvar sem erros, o documento é procurado
          // After saving without errors, the document is searched
          if (err) return console.error(err);
          res.json({
            // E se for achado com sucesso retornamos ele em JSON
            // And if it is found successfully, we return it in JSON
            original_url: data[0]['original_url'],
            short_url: data[0]['short_url']
          });
        });
      });
    }
  });
});

app.route("/api/shorturl/:shorted?").get(async (req, res) => {
  // Aqui é onde o client é redirecionado para outro URL se informar o "short_url" correto.
  // This is where the client is redirected to another URL if it enters the correct "short_url".
  const shorted = req.params.shorted
  Shortner.find({ short_url: shorted }, (err, data) => {
    if(err) return console.error(err);
    res.redirect(data[0]['original_url'])
  })
})
