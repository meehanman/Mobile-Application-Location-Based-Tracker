var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: { type: String, required: true, lowercase: true},
  email: { type: String, required: true, unique: true, lowercase: true},
  password: { type: String, required: true },
  admin: Boolean,
  location: String,
  image: String,
  groups: [{id: Number, name: String}],
  addedBy: {_id: Schema.Types.ObjectId, name: String},
  created_at: Date,
  updated_at: Date
});

userSchema.pre('save', function(next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    this.updated_at = now;
    next();
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
