//Start server is test mode (New Server and IP)
process.env.NODE_ENV = 'test';

var mongoose = require("mongoose");

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

describe('#Polling Route: /poll', () => {
  it('Returns String', (done) => {
    done();
  });
  it('BSSID: User is marked attended to event 58f8fd6c4cb8b419b35008d3', (done) => {
    done();
  });
  it('GPS: User is marked attended to event 58f8fd6c4cb8b419b35008d3', (done) => {
    done();
  });
  it('GPS Location out of Range: User is marked accepted to event 58f8fd6c4cb8b419b35008d3', (done) => {
    done();
  });
  it('Beacon: User is marked attended to event 58f8fd6c4cb8b419b35008d3', (done) => {
    done();
  });
  it('Doesn\'t allow access to anonymous users', (done) => {
    done();
  });
});
