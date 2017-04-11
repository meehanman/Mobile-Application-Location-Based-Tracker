module.exports = function(server) {
    var User = require('../models/user');
    var passwordhash = require('password-hash-and-salt');
    
    //Returns all users
    server.get('/user', function(req, res) {
        User.find({}, function(error, users) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not list all users.",
                    error: error
                });
            }
            var out = [];
            for (i in users) {
                var user = users[i];
                out.push({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    location: user.location,
                    image: user.image
                })
            }
            res.json(out);
        });
    });

    //Returns a user by their ID
    server.get('/user/:_id', function(req, res) {
        User.findOne({
            _id: req.params._id
        }, function(error, user) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not find user with id:" + req.params._id,
                    error: error
                });
            }
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                admin: user.admin,
                groups: user.groups
            });
        });
    });

    //Adding a User
    server.post('/user', function(req, res, next) {
        console.log(req.body);
        //Salt and Hash Password
        passwordhash(req.body.password).hash(function(error, hash) {
            if (error) {
                console.log("Could not hash password")
                res.json({
                    title: "Failed",
                    message: "Could not hash password.",
                    error: error
                });
            }
            //Upload image and get callnack of image url
            server.upload(req.body.image, function(img) {
                if (img != false) {
                    req.body.image = img;
                } else {
                    delete req.body.image;
                }

                var user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash,
                    admin: true,
                    location: req.body.location,
                    image: req.body.image,
                    groups: {
                        id: 0,
                        name: "CS"
                    },
                    addedBy: {
                        _id: req.user._id,
                        name: req.user.name
                    }
                })

                user.save(function(error) {
                    if (error) {
                        res.json({
                            title: "Failed",
                            message: "User Add Failed",
                            error: error
                        });
                    }
                    res.json({
                        title: "Success",
                        username: req.body.name,
                        message: "User Successfully Added"
                    });
                });
            });
        });
    });
}
