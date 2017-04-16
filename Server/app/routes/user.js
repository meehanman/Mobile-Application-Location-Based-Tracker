module.exports = function(server) {
    var User = require('../models/user');
    var passwordhash = require('password-hash-and-salt');

    //Returns all users
    server.get('/user', function(req, res) {
        User.findOne({}, function(error, users) {
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

    //Returns all users
    server.get('/user/all', function(req, res) {
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
                    name: user.name.replace(/\b\w/g, l => l.toUpperCase()),
                    email: user.email,
                    location: user.location,
                    image: user.image
                })
            }
            res.json(out);
        });
    });

    //Returns a user by their ID
    server.get('/user/:id', function(req, res) {
        User.findOne({
            _id: req.params.id
        }, function(error, user) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not find user with id:" + req.params.id,
                    error: error
                });
            }
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                admin: user.admin,
                location: user.location,
                image: user.image
            });
        });
    });

    //Adding a User
    server.post('/user', function(req, res, next) {
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
                    admin: !!req.body.admin,
                    location: req.body.location,
                    image: req.body.image,
                    groups: {
                        id: 0,
                        name: "CS"
                    },
                    addedBy: req.user._id
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

    server.del('/user/:id', function(req, res, next) {
        User.findByIdAndRemove({
            _id: req.params.id
        }, function(error, removed) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not delete user",
                    error: error
                });
            }
            res.json({
                title: "Success",
                message: removed.name + " deleted.",
                user: removed
            });
        });
    });

    server.put('/user/:id', function(req, res, next) {
        User.findById(req.params.id, function(error, user) {
            if (error) {
                res.json({
                    title: "Failed",
                    message: "Could not edit user",
                    error: error
                });
                console.log("ERROR");
            }

            var save = function() {
                user.name = req.body.name;
                user.location = req.body.location;
                user.admin = !!req.body.admin;

                user.save(function(error, updated) {
                    if (error) {
                        console.log("Save3");
                        res.json({
                            title: "Failed",
                            message: "Could not edit User",
                            error: error
                        });
                        return;
                    }
                    res.json({
                        title: "Success",
                        message: user.name + " edited",
                    });
                });
            }

            //If the image begins with data: then it's a new image to upload
            if (req.body.image != undefined && req.body.image.startsWith("data:")) {
                server.upload(req.body.image, function(img) {
                    if (img != false) {
                        user.image = img;
                    } else {
                        delete req.body.image;
                    }
                    save();
                });
            } else {
                save();
            }
        });
    });
}
