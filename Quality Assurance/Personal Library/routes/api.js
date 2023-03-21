/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);
const books = client.db("library").collection("books");

module.exports = function (app) {
  app
    .route("/api/books")
    .get(function (req, res) {
      getBooks(req, res);
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post(function (req, res) {
      addBook(req, res);
      //response will contain new book object including atleast _id and title
    })

    .delete(function (req, res) {
      deleteAll(req, res);
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      let id = req.params.id;
      getBooks(req, res, id);
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function (req, res) {
      let id = req.params.id;
      let comment = req.body.comment;
      addComment(req, res, id, comment);
      //json res format same as .get
    })

    .delete(function (req, res) {
      let id = req.params.id;
      deleteBook(req, res, id);
      //if successful response will be 'delete successful'
    });
};

async function getBooks(req, res, id) {
  if (!id) {
    const findAll = await books.find().toArray();
    const response = findAll.map((book) => ({
      title: book.title,
      _id: book._id,
      commentcount: book.commentcount
    })); // transform all the books into one object
    return res.json(response);
  } // if the id is empty return all books
  try {
    id = new ObjectId(id);
  } catch (err) {
    if (err) return res.send("no book exists");
  } // Here we try to create a new ObjectId, if is a valid string for it proceeds for search
  const response = await books.findOne({ _id: new ObjectId(id) });
  if (response === null) return res.send("no book exists");
  return res.json(response);
}

async function addBook(req, res) {
  const title = req.body.title;
  if (title === "" || title === null || title === undefined) {
    return res.send("missing required field title");
  } // verify if the title is missing
  const result = await books.insertOne({ title: req.body.title, commentcount: 0, comments: [] });
  const response = await books.findOne({ _id: result.insertedId });
  return res.send({ title: response.title, _id: response._id });
}

async function addComment(req, res, id, comment) {
  try {
    id = new ObjectId(id);
  } catch (err) {
    if (err) return res.send("no book exists");
  }
  if (!comment) return res.send("missing required field comment");
  await books.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $push: { comments: comment }, $inc: { commentcount: 1 } }
  );
  const response = await books.findOne({ _id: id });
  if (response === null) return res.send("no book exists");
  res.json(response);
}

async function deleteBook(req, res, id) {
  try {
    id = new ObjectId(id);
  } catch (err) {
    if (err) return res.send("no book exists");
  }
  const result = await books.findOneAndDelete({ _id: id });
  if (!result.value) return res.send("no book exists");
  return res.send("delete successful");
}

async function deleteAll(req, res) {
  books.deleteMany({});
  res.send("complete delete successful");
}
