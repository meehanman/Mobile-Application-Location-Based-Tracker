var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Place = mongoose.model('Place').schema;
var User = mongoose.model('User').schema;

var locationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        required: true
    },
    floor: Number,
    image: String,
    max_people: Number,
    services: [{
        name: String,
        description: String
    }],
    place: {type: Schema.Types.ObjectId, required: true, ref: 'Place'},
    image: String,
    beacon: String,
    access_point: String,
    gps: [],
    addedBy: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    created_at: Date,
    updated_at: Date
});

locationSchema.index({ gps: '2dsphere' });

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
