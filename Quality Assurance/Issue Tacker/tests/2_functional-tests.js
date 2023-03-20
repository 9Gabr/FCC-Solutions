const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("Create an issue with every field", (done) => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "Every field",
        issue_text: "test with every field",
        created_by: "gabriel",
        assigned_to: "gabriel",
        status_text: "done"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.issue_title, "Every field");
        assert.equal(res.body.issue_text, "test with every field");
        assert.equal(res.body.created_by, "gabriel");
        assert.equal(res.body.assigned_to, "gabriel");
        assert.equal(res.body.status_text, "done");
        done();
      });
  });

  test("Create an issue with only required fields", (done) => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "required fields",
        issue_text: "test with only required fields",
        created_by: "gabriel"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.issue_title, "required fields");
        assert.equal(res.body.issue_text, "test with only required fields");
        assert.equal(res.body.created_by, "gabriel");
        done();
      });
  });

  test("Create an issue with missing required fields", (done) => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "missing fields"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });

  test("View issues on a project", (done) => {
    chai
      .request(server)
      .get("/api/issues/apitest")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(Array.isArray(res.body), true);
        done();
      });
  });

  test("View issues on a project with one filter", (done) => {
    chai
      .request(server)
      .get("/api/issues/apitest?created_by=Gabriel")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(Array.isArray(res.body), true);
        assert.equal(res.body[0].created_by, "Gabriel");
        done();
      });
  });

  test("View issues on a project with multiple filters", (done) => {
    chai
      .request(server)
      .get("/api/issues/apitest?issue_title=ABC&assigned_to=myself")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(Array.isArray(res.body), true);
        assert.equal(res.body[0].issue_title, "ABC");
        assert.equal(res.body[0].assigned_to, "myself");
        done();
      });
  });

  test("Update one field on an issue", (done) => {
    const numberGen = () => {
      return Math.floor(Math.random() * 100000);
    };
    const randomNumber = numberGen();
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: "64124480c6932714f13b569b",
        issue_text: randomNumber
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.result, "successfully updated");
        done();
      });
  });

  test("Update multiple fields on an issue", (done) => {
    const numberGen = () => {
      return Math.floor(Math.random() * 100000);
    };
    const randomNumber = numberGen();
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: "64124480c6932714f13b569b",
        issue_text: randomNumber,
        issue_title: randomNumber
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.result, "successfully updated");
        done();
      });
  });

  test("Update an issue with missing _id", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        issue_text: "ABCDEFG"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

  test("Update an issue with no fields to update", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: "64124480c6932714f13b569b"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "no update field(s) sent");
        done();
      });
  });

  test("Update an issue with an invalid _id", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({
        _id: "64124480c6932714f13b559b",
        issue_text: "ABCDEFGH"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "could not update");
        done();
      });
  });

  test("Delete an issue", (done) => {
    chai
      .request(server)
      .get("/api/issues/apitest")
      .end((err, res) => {
        const id = res.body[res.body.length - 1]._id;
        chai
          .request(server)
          .delete("/api/issues/apitest")
          .send({ _id: id })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, "application/json");
            assert.equal(res.body.result, "successfully deleted");
          });
        done();
      });
  });

  test("Delete an issue with an invalid _id", (done) => {
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({
        _id: "64124480c6932714f13b559b"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "could not delete");
        done();
      });
  });

  test("Delete an issue with missing _id", (done) => {
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.type, "application/json");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
