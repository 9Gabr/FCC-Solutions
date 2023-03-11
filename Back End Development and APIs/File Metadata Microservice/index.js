// FCC config
var express = require('express');
var cors = require('cors');
require('dotenv').config()
var app = express();
// FCC config
// Requires
const path = require('path');
const fs = require("fs");
const multer = require("multer")
const { lookup } = require('mime-types')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
app.use('/', bodyParser.urlencoded({ extended: false }))
// Requires
// Mongoose
const mongo_url = process.env['mongodb']
const { connect, Schema, model } = mongoose
connect(mongo_url)

const fileSchema = new Schema({
  file: { data: Buffer, contentType: String }
})
const fileModel = model('file', fileSchema)
// Mongoose
// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: async (req, file, cb) => {
    const typeArr = file.mimetype.split('/')
    const type = typeArr[typeArr.length - 1]
    cb(null, `${file.originalname}`)
  }
})
const upload = multer({ storage })
// Multer
// FCC config
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Your app is listening on port ' + port)
});
// FCC config

app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  const file_path = req.file.path
  const file = fs.readFileSync(file_path)
  const fileEncoded = file.toString('base64')
  const fileFinal = {
    contentType: req.file.mimetype,
    data: Buffer.from(fileEncoded, 'base64')
  }
  fileModel.create(fileFinal, err => {
    if (err) return console.error(err);
    res.json({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    })
  })

})

