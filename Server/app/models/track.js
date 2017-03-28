var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/**
Stores all tracking information we recieve on a user
**/
var trackSchema = new Schema({
    user:  {_id: Schema.Types.ObjectId, name: String},
    beacon: String,
    access_point: String,
    gps: { x: Number, y: Number },
    created_at: Date,
    updated_at: Date
});

trackSchema.pre('save', function(next) {
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
var Track = mongoose.model('Track', trackSchema);


// make this available to our users in our Node applications
module.exports = Track;
