//Start server is test mode (New Server and IP)
process.env.NODE_ENV = 'test';

var mongoose = require("mongoose");

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

var User = require('../app/models/user');

chai.use(chaiHttp);

describe("Users Route: GET /user",function(){
  it('HTTP Responce is OK', (done) => {
    chai.request(server)
      .get('/user')
      .set('Authorization', "Basic dGVzdC5lbWFpbEBkZWFuLnRlY2hub2xvZ3k6UGFzc3dvcmQ=")
      .end(function(err, res) {
        res.status.should.eql(200);
        done();
      });
  });
  it('One User is Returned', (done) => {
    chai.request(server)
      .get('/user')
      .set('Authorization', "Basic dGVzdC5lbWFpbEBkZWFuLnRlY2hub2xvZ3k6UGFzc3dvcmQ=")
      .end(function(err, res) {
        res.body.should.have.length(1);
        done();
      });
  });
});
describe("Users Route: GET /user/all",function(){
  it('HTTP Responce is OK', (done) => {
    chai.request(server)
      .get('/user/all')
      .set('Authorization', "Basic dGVzdC5lbWFpbEBkZWFuLnRlY2hub2xvZ3k6UGFzc3dvcmQ=")
      .end(function(err, res) {
        res.status.should.eql(200);
        done();
      });
  });
  it('One User is Returned', (done) => {
    chai.request(server)
      .get('/user/all')
      .set('Authorization', "Basic dGVzdC5lbWFpbEBkZWFuLnRlY2hub2xvZ3k6UGFzc3dvcmQ=")
      .end(function(err, res) {
        res.body.should.have.length(1);
        done();
      });
  });
});

var u;
before(function(done){
  User.find({},function(error, user){
    u = user;
    done()
  });
});
describe("Users Route: GET /user/:id",function(){

  it('HTTP Responce is OK', (done) => {
    chai.request(server)
      .get('/user/'+u._id)
      .set('Authorization', "Basic dGVzdC5lbWFpbEBkZWFuLnRlY2hub2xvZ3k6UGFzc3dvcmQ=")
      .end(function(err, res) {
        res.status.should.eql(200);
        done();
      });
  });
  it('One User is Returned', (done) => {
    chai.request(server)
      .get('/user/'+u._id)
      .set('Authorization', "Basic dGVzdC5lbWFpbEBkZWFuLnRlY2hub2xvZ3k6UGFzc3dvcmQ=")
      .end(function(err, res) {
        done();
      });
  });
  it('User is Returned', (done) => {
    chai.request(server)
      .get('/user/'+u._id)
      .set('Authorization', "Basic dGVzdC5lbWFpbEBkZWFuLnRlY2hub2xvZ3k6UGFzc3dvcmQ=")
      .end(function(err, res) {
        res.body.should.be.a("object");
        done();
      });
  });
});
