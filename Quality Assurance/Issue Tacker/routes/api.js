"use strict";
require("dotenv").config();
const { query } = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      findIssue(project, req, res);
    })

    .post(function (req, res) {
      insertIssue(req, res);
    })

    .put(function (req, res) {
      if (!req.body._id) {
        res.send({ error: "missing _id" }); // if _id is not filled, return a error
      } else {
        updateIssue(req, res);
      }
    })

    .delete(function (req, res) {
      if (!req.body._id) {
        res.send({ error: "missing _id" }); // if _id is not filled, return a error
      } else {
        deleteIssue(req, res);
      }
    });
};

async function findIssue(project, req, res) {
  const issues = client.db("issuesTracker").collection("issues");
  let query = req.query;
  if (query.open) {
    query.open === "true" ? (query.open = true) : (query.open = false);
  } // transform the open string to a boolean
  if (query._id) {
    query._id = new ObjectId(query._id);
  } // trasnform the id string to a ObjectId
  const search = () => {
    if (Object.keys(query).length !== 0) return { project: project, ...query };
    return { project: project };
  }; // search for the project, and then concat the query to the search if is given any value
  const cursor = issues.find(search());
  if ((await issues.countDocuments(search())) === 0) {
    const err = { error: "no documents found" };
    return res.json(err);
  } // if the number of issues is 0 return a error.
  return res.json(await cursor.toArray());
}

async function insertIssue(req, res) {
  const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
  if (!issue_title || !issue_text || !created_by) {
    const err = { error: "required field(s) missing" };
    return res.json(err);
  } // verify if the required fields is filled
  const issues = client.db("issuesTracker").collection("issues");
  const doc = {
    issue_title: issue_title,
    issue_text: issue_text,
    created_on: new Date().toISOString(),
    updated_on: new Date().toISOString(),
    created_by: created_by,
    assigned_to: assigned_to || "",
    open: true,
    status_text: status_text || "",
    project: req.params.project
  };
  const result = await issues.insertOne(doc); // insert the issue in db
  const response = await issues.findOne({ _id: result.insertedId }); // take the response from inserting and find that in db, returning the issue to client
  res.send(response);
}

async function updateIssue(req, res) {
  const issues = client.db("issuesTracker").collection("issues");
  const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

  const body = {
    issue_title: issue_title,
    issue_text: issue_text,
    created_by: created_by,
    assigned_to: assigned_to,
    status_text: status_text
  };
  Object.keys(body).forEach((k) => !body[k] && delete body[k]); // Remove the keys that are empty from const body
  if (Object.keys(body).length === 0)
    return res.send({ error: "no update field(s) sent", _id: _id }); // Searching things to update, if didn't find return a error

  const issue = await issues.find({ _id: new ObjectId(_id) }).toArray(); // Search for the issue
  if (issue.length === 0) return res.send({ error: "could not update", _id: _id }); // return a error if didn't find the issue in db
  const issueOpen = issue[0].open; // then separe to check if the issue is open

  open === undefined ? (body.open = true) : (body.open = false); // transforming the body strings to boolean
  if (issueOpen === body.open && Object.keys(body).length === 0)
    return res.send({ error: "could not update", _id: _id }); // If the body.open is equal to the issue.open in db and there is nothing to modify, is returned a error

  body.updated_on = new Date().toISOString(); // If we didn't find a error we set the update
  await issues.findOneAndUpdate({ _id: new ObjectId(_id) }, { $set: body }); // Send the modifications to db
  res.send({ result: "successfully updated", _id: _id }); // Finally is returned the sucessful update
}

async function deleteIssue(req, res) {
  const issues = client.db("issuesTracker").collection("issues");
  const { _id } = req.body;
  const result = await issues.findOneAndDelete({ _id: new ObjectId(_id) }); // search for issue and try to delete it
  if (result.value === null) return res.send({ error: "could not delete", _id: _id }); // if the issue is not found in db or occurs a error, it return a error in client
  res.send({ result: "successfully deleted", _id: _id }); // if no errors return success
}
