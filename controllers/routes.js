var express = require("express");
var router = express.Router();
var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");
var cheerio = require("cheerio");
var request = require("request");


router.get("/",function(req,res){

  Article.find({})
  .populate("comments")

  .exec(function(error, doc) {

    if (error) {
      console.log(error);
    }
    else {
      console.log("all article with comments: "+ doc);
      res.render("index",{articles: doc});
    }
  });



});




router.get("/scrape", function(req, res) {
    request("http://www.npr.org/sections/world/", function(error, response, html) {
        
        
          var $ = cheerio.load(html);

          $(".has-image").each(function(i, element) {
        
            var result ={};
            result.link = $(element).children(".item-info").children(".title").children().attr("href");
      
            result.title =$(element).children(".item-info").children(".title").children().text();
            result.snipText=$(element).children(".item-info").children(".teaser").children("a").text();
            result.imageLink = $(element).children(".item-image").children(".imagewrap").children("a").children("img").attr("src");
            

            Article.findOne({title:result.title},function(err,data){
                if (!data)
                {
                    var entry = new Article(result);
                    
                          entry.save(function(err, doc) {
                            if (err) {
                              console.log(err);
                            }
                        
                            else {
                              console.log("saving article, title: "+ doc.title);
                            }
                          });

                }
                else
                {
                    console.log("this aritcle is already in db: "+ data.title);
                }
            });
        });
      
          $(".no-image").each(function(i, element) {
            
            var result ={};
  
               result.link = $(element).children(".item-info").children(".title").children().attr("href");
          
                result.title =$(element).children(".item-info").children(".title").children("a").text();
                result.snipText=$(element).children(".item-info").children(".teaser").children().text();
                result.imageLink="no image";


                Article.findOne({title:result.title},function(err,data){
                  
                    if (!data)
                    {
                        var entry = new Article(result);
                        
                          
                              entry.save(function(err, doc) {
                         
                                if (err) {
                                  console.log(err);
                                }
                              
                                else {
                                  console.log("saving article, title: " + doc.title);
                                }
                              });
    
                    }
                    else
                    {
                        console.log("this aritcle is already in db: "+ data.title);
                    }
                });

              });
      
        res.redirect("/");
      });
    
  });

  
  router.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Or send the doc to the browser as a json object
      else {
        res.json(doc);
      }
    });
  });


router.post("/article/:id", function(req, res) {

    var newComment = new Comment(req.body);

    newComment.save(function(error, doc) {
        if (error) {
            console.log(error);
          }
  
          else {
            Article.findOneAndUpdate({ "_id": req.params.id }, { $push:{"comments": doc._id }},{new:true},function(err,doc){
                if (err)
                    {
                        console.log("add comment to article: "+ err);
                    }
                else{
                    res.redirect("/");
                }
            
            });
          }
      
    });
  });
  

  module.exports=router;