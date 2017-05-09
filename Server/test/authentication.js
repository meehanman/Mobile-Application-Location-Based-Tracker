//Start server is test mode (New Server and IP)
process.env.NODE_ENV = 'test';

var mongoose = require("mongoose");
var User = require('../app/models/user');

var passwordhash = require('password-hash-and-salt');

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

describe('Authentication', function() {

  it('Returns http 403 with no header', (done) => {
    chai.request(server)
      .get('/whoami')
      .end(function(err, res) {
        res.status.should.eql(403);
        done();
      });
  });

  it('Returns http 200 with correct authorization header', (done) => {
    chai.request(server)
      .get('/whoami')
      .set('Authorization', "Basic dGVzdC5lbWFpbEBkZWFuLnRlY2hub2xvZ3k6UGFzc3dvcmQ=")
      .end(function(err, res) {
        res.status.should.eql(200);
        done();
      });
  });
  it('Returned Object is the correct user', (done) => {
    chai.request(server)
      .get('/whoami')
      .set('Authorization', "Basic dGVzdC5lbWFpbEBkZWFuLnRlY2hub2xvZ3k6UGFzc3dvcmQ=")
      .end(function(err, res) {
        res.body.name.should.eql("Admin User");
        done();
      });
  });
});
