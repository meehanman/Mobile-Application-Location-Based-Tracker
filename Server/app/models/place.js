var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var placeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    address: {
        streetAddress: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    parentPlace: String,
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

// the schema is useless so far
// we need to create a model using it
var Place = mongoose.model('Place', placeSchema);


// make this available to our users in our Node applications
module.exports = Place;
