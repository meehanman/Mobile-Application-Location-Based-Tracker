var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
  name: { type: String, required: true},
  description: String,
  image: String,
  type: { type: String, required: true},
  max_people: Number,
  services: [{name: String,	description: String}],
  place: {
  	name: String,
  	floor: Number,
  	department: String,
  	room_number: String,
  	address: String
  },
  beacon: String,
  access_point: String,
  gps: { x: Number, y: Number },
  addedBy: {_id: Schema.Types.ObjectId, name: String},
  created_at: Date,
  updated_at: Date
});

locationSchema.pre('save', function(next) {
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
var Location = mongoose.model('Location', locationSchema);


// make this available to our users in our Node applications
module.exports = Location;
