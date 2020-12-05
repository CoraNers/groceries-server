// Set up
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cors = require('cors');

// Configuration
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/finalProject");

app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride());
app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, POST, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Model
var OnTheMenu = mongoose.model('OnTheMenu', {
    name: String,
    isFavorite: Boolean
});


// Get all items on the menu
app.get('/api/onTheMenu', function (req, res) {

    console.log("Fetching all items on the current menu");

    //use mongoose to get all items on the menu in the database
    OnTheMenu.find(function (err, onTheMenuItems) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }
        res.json(onTheMenuItems); // return all items on the menu in JSON format
    });
});

// Add a recipe to the menu
app.post('/api/onTheMenu', function (req, res) {
    console.log("Adding recipe to the menu");

    OnTheMenu.create({
        name: req.body.name,
        isFavorite: false,
        done: false
    }, function (err, item) {
        if (err) {
            res.send(err);
        }

        // create and return all the items on the menu
        OnTheMenu.find(function (err, onTheMenuItems) {
            if (err)
                res.send(err);
            res.json(onTheMenuItems);
        });
    });

});

// Make a menu item a favorite or undoing a favorite
app.put('/api/onTheMenu/:id', function (req, res) {
    const menuItem = {
        name: req.body.name,
        isFavorite: req.body.isFavorite
    };
    console.log("Updating menu item id - ", req.params.id);
    console.log("Updating menu item name - ", req.params.name);
    console.log("Updating menu item isFavorite- ", req.params.isFavorite);

    var ObjectId = require('mongodb').ObjectId;
    var oid = new ObjectId(req.params.id);

    OnTheMenu.update({"_id": oid}, menuItem, function (err, raw) {
        if (err) {
            res.send(err);
        }
    });
    OnTheMenu.find(function (err, onTheMenuItems) {
        if (err)
            res.send(err);
        res.json(onTheMenuItems);
    });
});


// Delete a menu Item
app.delete('/api/onTheMenu/:id', function (req, res) {
    OnTheMenu.remove({
        _id: req.params.id
    }, function (err, menuItem) {
        if (err) {
            console.error("Error deleting menuItem ", err);
        }
        else {
            OnTheMenu.find(function (err, onTheMenuItems) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.json(onTheMenuItems);
                }
            });
        }
    });
});


// Start app and listen on port 8080  
app.listen(process.env.PORT || 8080);
console.log("Final Project server listening on port  - ", (process.env.PORT || 8080));