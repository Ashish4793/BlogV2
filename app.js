//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const homeStartingContent = "Welcome to the Blog Website!";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret : process.env.hue,
  resave : false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set("strictQuery" ,false);

mongoose.connect(process.env.MONGO_URI,function(err){
  if(err){
      console.log(err);
  } else {
      console.log("Connection to Database Estabhlished!!!");
  }
});

const userSchema = new mongoose.Schema({
  username : {type: String, unique : true},
  password : String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User" , userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const postSchema = {
  title : String,
  content : String
};


const Post = mongoose.model("Post" , postSchema);


app.get("/" ,function (req,res){
  if (req.isAuthenticated()){
    Post.find({}, function(err, posts){
      res.render("home", {
        startingContent : homeStartingContent,
        posts : posts
      })
    });
  } else {
    res.redirect("/ucoption");
  }
 
});

app.get("/login", function(req,res){
  if (req.isAuthenticated()){
    res.redirect("/");
  } else {
    res.render("login");
  }
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/verify", function(req,res){
  if (req.isAuthenticated()){
    res.render("verify", {hue : " "});
  } else {
    res.render("verify" , {hue : " not"});
  }
});

app.get("/ucoption", function(req,res){
  res.render("ucoption");
});


app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  if (req.isAuthenticated()){
    res.render("compose");
  } else {
    res.redirect("/ucoption");
  }
});

app.get("/logout" , function(req,res){
  req.logout(function(err){});
  res.redirect("/verify");
});

app.post("/register" , function(req,res){
  User.register({username : req.body.username} , req.body.password , function(err,user){
    if(err){
      res.redirect("/error");
    } else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/");
      });
    }
  });
});


app.post("/login", passport.authenticate("local",{
  successRedirect: "/",
  failureRedirect: "/error2"
}), function(req, res){
  
});

app.post("/compose", function(req, res){
  const post = new Post ({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save(function(err){
    if (!err) {
      res.redirect("/");
    }
  });


});

app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId} , function(err, post){
    res.render("post",{
      title:post.title,
      content : post.content
    })
  });
});

app.get("/error", function(req,res){
  res.render("error");
});
app.get("/error2", function(req,res){
  res.render("error2");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
