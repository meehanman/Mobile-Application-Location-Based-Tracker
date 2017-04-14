var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = mongoose.model('User').schema;
var Location = mongoose.model('Location').schema;

var eventSchema = new Schema({
  name: { type: String, required: true},
  description: String,
  owner: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
  image: String,
  type: { type: String, required: true, enum: ["meeting","event","party","conference","lecture","other"]},
  location: {type: Schema.Types.ObjectId, required: true, ref: 'Location'},
  attendees: [{user: {type: Schema.Types.ObjectId, required: true, ref: 'User'}, status: {type: String, required: true, enum: ["invited","accepted","declined","attended"]}}],
  starts_at: { type: Date, required: true},
  ends_at: { type: Date, required: true},
  addedBy: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
  created_at: Date,
  updated_at: Date
});

eventSchema.pre('save', function(next) {
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
var Event = mongoose.model('Event', eventSchema);

// make this available to our users in our Node applications
module.exports = Event;
