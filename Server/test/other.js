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
describe('#Default Routes: /', () => {
  it('Returns version number and author', (done) => {
    chai.request(server)
      .get('/')
      .end(function(err, res) {
        res.should.be.a("object");
        res.body.should.have.all.keys(['version','author']);
        done();
      });
  });
  it('HTTP Code 200', (done) => {
    chai.request(server)
      .get('/')
      .end(function(err, res) {
        res.should.have.status("200");
        done();
      });
  });
});

describe('#Default Routes: /whoami', () => {
  it('Returns Object', (done) => {
    chai.request(server)
      .get('/whoami')
      .end(function(err, res) {
        res.should.be.a("object");
        done();
      });
  });
  it('Doesn\'t allow access to anonymous users', (done) => {
    chai.request(server)
      .get('/whoami')
      .end(function(err, res) {
        res.should.be.a("object");
        done();
      });
  });
  it('Access to only logged in users', (done) => {
    done();
  });
  it('Contains 7 keys', (done) => {
    done();
  });
});
