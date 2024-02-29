const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const crypt = require('mongoose-encryption');
const app = express();
// Express initializes app to be a function handler that you can supply to an HTTP server
const { createServer } = require('node:http');
const server = createServer(app);
const { join } = require('node:path');
const { Server } = require('socket.io');
const io = new Server(server);

//
const session = require("express-session");
const passport = require('passport');
const { register } = require("node:module");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: "Parolasecreta.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/loginDB");
const userSchema = {
    email: String,
    password: String
};
const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save()
        .then(function () {
            console.log("User added " + req.body.username);
            // res.render("secrets");
            res.render("index",{username:req.body.username});
            //console.log(newUser.email);
        })
        .catch(function (err) {
            console.log(err);
        });
});

app.post("/login", function (req, res) {
    let username = req.body.username;
    const password = req.body.password;
    async function foundUsers() {
        const foundUser = await User.findOne({ email: username });
        if (foundUser) {
            if (foundUser.password === password) {
                //res.render("secrets");
                //res.render("chat");
                //res.sendFile(join(__dirname, 'index.html'),username=username);
                res.render("index",{ username: username });
            }
            else {
                console.log("wrong passwd : " + password);
                res.render("login");
            }
        } else {
            console.log("wrong user : " + username);
            res.render("login");
        }
    }
    foundUsers();
});

app.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

//Adding IO part:

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        //let username = req.body.username;
        console.log('message: ' + msg + '  from  '+socket.id);
      });
    console.log('a user connected');
});
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// app becomes server
server.listen(3000, function () {
    console.log("Server started on port 3000");
});
