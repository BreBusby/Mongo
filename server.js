
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.Promise = Promise;

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));


var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");



app.use(express.static("public"));


mongoose.connect("mongodb://heroku");
var db = mongoose.connection;


db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});


db.once("open", function() {
  console.log("Mongoose connection successful.");
});


var routes = require("./controllers/routes.js");
app.use("/",routes);


app.listen(port, function() {
    console.log("App running on " + port);
  });