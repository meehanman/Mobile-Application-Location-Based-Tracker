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

beforeEach(function(done) {
  //Create admin user
  passwordhash("Password").hash(function(error, hash) {
    if (error) {
      console.log("Could not hash password")
      res.json({
        title: "Failed",
        message: "Could not hash password.",
        error: error
      });
    }
    user = new User({
      name: "Admin User",
      email: "test.email@dean.technology",
      password: hash,
      admin: true,
      location: "Test Location",
      image: "http://dean.technology/images/LinkedInProfileImage.png"
    });

    user.save(function(error, user) {
      u = user;
      console.log("User Added");
      done();
    });
  });
});
afterEach(function(done) {
  User.remove({}, function(error) {
    done();
  });
});
