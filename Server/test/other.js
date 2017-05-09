//Start server is test mode (New Server and IP)
process.env.NODE_ENV = 'test';

var mongoose = require("mongoose");

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

/*
 * Test the /GET route
 */
describe('#Other Routes: /', () => {
  it('Returns version number and author', (done) => {
    chai.request(server)
      .get('/')
      .end(function(err, res) {
        res.should.be.a("object");
        res.body.should.have.all.keys(['version', 'author']);
        done();
      });
  });
  it('Returns HTTP OK', (done) => {
    chai.request(server)
      .get('/')
      .end(function(err, res) {
        res.should.have.status("200");
        done();
      });
  });
});

describe('#Other Routes: /favicon', () => {
  it('should return an empty object', (done) => {
    chai.request(server)
      .get('/')
      .end(function(err, res) {
        res.body.should.be.a("object");
        done();
      });
  });
  it('Returns HTTP OK', (done) => {
    chai.request(server)
      .get('/')
      .end(function(err, res) {
        res.should.have.status("200");
        done();
      });
  });
});
