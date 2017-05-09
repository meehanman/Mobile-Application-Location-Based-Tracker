//Start server is test mode (New Server and IP)
process.env.NODE_ENV = 'test';

var mongoose = require("mongoose");

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

describe("Location Route: GET /location",function(){
  it('HTTP Responce is OK', (done) => {
    chai.request(server)
      .get('/location')
      .set('Authorization', "Basic dGVzdC5lbWFpbEBkZWFuLnRlY2hub2xvZ3k6UGFzc3dvcmQ=")
      .end(function(err, res) {
        res.status.should.eql(200);
        done();
      });
  });
});
