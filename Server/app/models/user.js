var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  first_name: String,
  surname: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String, required: true },
  admin: Boolean,
  location: String,
  picture: Buffer,
  groups: [{id: Number, name: String}],
  created_at: Date,
  updated_at: Date
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
