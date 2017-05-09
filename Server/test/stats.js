//Start server is test mode (New Server and IP)
process.env.NODE_ENV = 'test';

var mongoose = require("mongoose");

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

describe('#Statistics Route: /stats/location/:id', () => {
  it('Returns correct location object', (done) => {
    done();
  });
  it('Returns array of events', (done) => {
    done();
  });
  it('Returns correct amount of events', (done) => {
    done();
  });
});
