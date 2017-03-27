var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({
  name: { type: String, required: true},
  owner: {_id: Schema.Types.ObjectId, name: String},
  description: String,
  image: String,
  type: { type: String, required: true, enum: ["meeting","event","party","converence","lecture","other"]},
  location: {_id: {type: Schema.Types.ObjectId, required: true}, name: String},
  addedBy: {_id: {type: Schema.Types.ObjectId, required: true}, name: String},
  attendees: [{_id: {type: Schema.Types.ObjectId, required: true}, status: {type: String, required: true, enum: ["invited","accepted","declined","attended"]}}],
  starts_at: { type: Date, required: true},
  ends_at: { type: Date, required: true},
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
