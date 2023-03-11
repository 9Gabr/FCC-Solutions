// FCC initial config
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
// FCC initial config
//
// Additional config
const bodyParser = require('body-parser')
app.use('/', bodyParser.urlencoded({ extended: false }))
// Additional config
//
// Moongose config
const { connect, Schema, model } = require('mongoose')
const uri = process.env['MONGO_URI'] // Mongo URI
connect(uri)

const userSchema = new Schema({
  username: { type: String, required: true },
  exercises: []
})
const user = model('user', userSchema)
// Moongose config
//
// FCC initial config
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
// FCC initial config
//
//
app.route('/api/users').post((req, res) => {
  const { username } = req.body

  const newUser = user({
    username: username
  })

  newUser.save(err => {
    if (err) return console.error(err);
    user.find({ username: username }, (err, data) => {
      if (err) return console.error(err);
      res.json({
        username: data[0]['username'],
        _id: data[0]['_id']
      })
    })
  })
}) // make new users

app.route('/api/users').get(async (_, res) => {
  user.find({}, "username _id ", (err, data) => {
    if (err) return console.error(err);
    res.send(data)
  })
}) // List all users

app.route('/api/users/:id/exercises').post(async (req, res) => {
  // I tried with :_id, and it failed, I think it's better always write the code of route with only numbers and letters.
  const userID = req.params.id
  const { description, duration, date } = req.body

  const checkDate = (time) => {
    if (time) {
      return new Date(time).toDateString()
    } else {
      return new Date(Date.now()).toDateString()
    }
  }
  const exercise = {
    description: description,
    duration: Number(duration),
    date: checkDate(date)
  }
  user.findById(userID, (err, doc) => {
    if (err) return console.error(err);
    doc.exercises.push(exercise)
    doc.save(err => {
      if (err) return console.error(err);
      user.findById({ _id: userID }, (err, doc) => {
        if (err) return console.error(err);
        res.json({
          username: doc.username,
          description: description,
          duration: Number(duration),
          date: checkDate(date),
          _id: doc._id
        })
      })
    })
  })
}) // Register exercises

app.route('/api/users/:id/logs').get(async (req, res) => {
  const userID = req.params.id
  const { from, to, limit } = req.query
  const date = {
    // 8640000000000000 is the maximum, and the minimum date.
    from: new Date(from !== undefined ? from : -8640000000000000),
    to: new Date(to !== undefined ? to : 8640000000000000)
  }

  user.findById(userID, (err, doc) => {
    if (err) return console.error(err);

    const exercisesArr = [...doc.exercises]

    const logExercises = () => {
      // here the filter will search for the dates to confirm it is between "from" and "to"
      return exercisesArr.filter(doc => { 
        return new Date(doc.date) >= date.from &&
        new Date(doc.date) <= date.to
      }).slice(0, limit) // if limit is undefined, the slice will cut to the final (arr.length)
    }

    const response = {
      username: doc.username,
      count: doc.exercises.length,
      _id: doc._id,
      log: logExercises()
    }

    res.json(response)
  })
}) // response with log
