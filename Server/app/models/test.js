var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var testSchema = new Schema({
  name: String
});

// the schema is useless so far
// we need to create a model using it
var Test = mongoose.model('Test', testSchema);

// make this available to our users in our Node applications
module.exports = Test;
