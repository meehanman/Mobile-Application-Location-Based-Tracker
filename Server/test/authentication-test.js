process.env.NODE_ENV = 'test';

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
    done();
  });
  it('HTTP Code 200', (done) => {
    done();
  });
  it('Contains 2 keys', (done) => {
    done();
  });
});

describe('#Default Routes: /whoami', () => {
  it('Returns Object', (done) => {
    done();
  });
  it('Doesn\'t allow access to anonymous users', (done) => {
    done();
  });
  it('Access to only logged in users', (done) => {
    done();
  });
  it('Contains 7 keys', (done) => {
    done();
  });
});
describe('#Default Routes: /whoami', () => {
  it('Returns Object', (done) => {
    done();
  });
  it('Doesn\'t allow access to anonymous users', (done) => {
    done();
  });
  it('Access to only logged in users', (done) => {
    done();
  });
  it('Contains 7 keys', (done) => {
    done();
  });
});

describe('#Default Routes: /favicon', () => {
  it('Returns Empty Object', (done) => {
    done();
  });
  it('Allows access to anonymous users', (done) => {
    done();
  });
});

describe('#Place Route: DELETE /place/:id', () => {
  it('Place deleted', (done) => {
    done();
  });
  it('Returns correct object', (done) => {
    done();
  });
  it('Doesn\'t allow access to anonymous users', (done) => {
    done();
  });
  it('Doesn\'t allow access to non-admin users', (done) => {
    done();
  });
});


describe('#Place Route: PUT /place', () => {
  it('Place edited with new name', (done) => {
    done();
  });
  it('Returns correct object', (done) => {
    done();
  });
  it('Doesn\'t allow access to anonymous users', (done) => {
    done();
  });
  it('Doesn\'t allow access to non-admin users', (done) => {
    done();
  });
});

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
