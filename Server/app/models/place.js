var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var placeSchema = new Schema({
  name: {type: String, required: true},
  description: String,
  address: {
    street: {type: String, required: true},
    city: {type: String, required: true},
    postcode: {type: String, required: true},
    country: {type: String, required: true}
  },
  parentPlace: {type: Schema.Types.ObjectId,required: false},
  addedBy: {type: Schema.Types.ObjectId,required: true},
  created_at: Date,
  updated_at: Date
});


placeSchema.pre('save', function(next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    this.updated_at = now;
    next();
});

var Place = mongoose.model('Place', placeSchema);
module.exports = Place;
