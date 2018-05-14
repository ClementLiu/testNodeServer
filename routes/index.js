var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var path = require('path');

// Set The Storage Engine
var storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var uploading = multer({
    storage: storage,
    limits: { fileSize: 1000000, files: 1 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({}, {}, function(e, docs) {
        res.render('userlist', {
            "userlist": docs
        });
    });
});
/* GET Imglist page. */
router.get('/imglist', function(req, res) {
    var db = req.db;
    var collection = db.get('imgs');
    collection.find({}, {}, function(e, docs) {
        res.render('imglist', {
            "imglist": docs
        });
    });
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});


/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username": userName,
        "email": userEmail
    }, function(err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        } else {
            // And forward to success page
            res.redirect("userlist");
        }
    });
});

/* GET New User page. */
router.get('/upload-img', function(req, res) {
    res.render('upload-img', { title: 'Add Imges' });
});

router.post('/upload', uploading.single('image'), function(req, res, next) {
    var db = req.db;
    var imgName = req.file.filename;
    var imgs = db.get('imgs');
    imgs.insert({
        "imgname": imgName,
    }, function(err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        } else {
            // And forward to success page
            res.redirect("helloworld");
        }
    });

});

module.exports = router;