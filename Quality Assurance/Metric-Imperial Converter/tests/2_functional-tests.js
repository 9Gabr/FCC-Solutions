const chaiHttp = require("chai-http");
const chai = require("chai");
let assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("Convert a valid input: 10L", (done) => {
    chai
      .request(server)
      .get("/api/convert?input=10L")
      .end((err, res) => {
        const { string } = JSON.parse(res.text);
        assert.equal(res.status, 200);
        assert.equal("10 liters converts to 2.64172 gallons", string);
        done();
      });
  });
  test("Convert an invalid input: 32g", (done) => {
    chai
      .request(server)
      .get("/api/convert?input=32g")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '"invalid unit"');
        done();
      });
  });
  test("Convert an invalid number: 3/7.2/4", (done) => {
    chai
      .request(server)
      .get("/api/convert?input=3/7.4/4kg")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '"invalid number"');
        done();
      });
  });
  test("Convert an invalid number AND unit: 3/7.2/4kilomegagram", (done) => {
    chai
      .request(server)
      .get("/api/convert?input=3/7.4/4kilomegagram")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.text, '"invalid number and unit"');
        done();
      });
  });
  test("Convert with no number: kg", (done) => {
    chai
      .request(server)
      .get("/api/convert?input=kg")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.typeOf(JSON.parse(res.text), "object");
        done();
      });
  });
});
