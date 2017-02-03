var express = require("express");
var app = express();

var methodOverride = require("method-override");

var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var expressSanitizer = require("express-sanitizer");
var port = 3001;

//app config

mongoose.connect("mongodb://localhost/restful_blog_app");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


//mongoose model config
var blogShema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    date: {
        type: Date,
        default: Date.now
    }
});
var Blog = mongoose.model("Blog", blogShema);

//create initial blog

// Blog.create({
//     title: "Test Blog",
//     image: "https://farm8.staticflickr.com/7559/15756506355_b8ed9d39a2.jpg",
//     body: "This is my temporary first blog... fot testing"
// });


//RESTful route config

app.get("/", function (req, res) {
    res.redirect("blogs");
});


app.get("/blogs", function (req, res) {
    Blog.find({}, function (err, blogs) {
        if(err) {
            console.log("Error occurred!!!" + err);
        } else {
            res.render("index", {blogs: blogs});
        }
    })
});

//NEW route
app.get("/blogs/new", function (req, res) {
    res.render("new");
});


//CREATE route
app.post("/blogs", function (req, res) {
    // console.log(req.body);
    // console.log(req.body.blog);
    //take the body of the blog and sanitize it so that no one can run <script> in it and hack it
    req.body.blog.body = expressSanitizer(req.body.blog.body);

    Blog.create(req.body.blog, function (err, newBlog) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/blogs");
        }
    })
});

app.get("/blogs/:id", function (req, res) {
    // console.log(req.params);
    Blog.findById(req.params.id, function (err, foundBlog) {
        if(err){
            res.redirect("/blogs")
        } else {
            // console.log(foundBlog);
            res.render("show", {blog: foundBlog});
        }
    })
});

//EDIT route
app.get("/blogs/:id/edit", function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog})
        }
    })
});

//UPDATE route
app.put("/blogs/:id", function (req, res) {
    //take the body of the blog and sanitize it so that no one can run <script> in it and hack it
    req.body.blog.body = expressSanitizer(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, udpdatedBlog) {
        if(err) {
            res.redirect("/blogs")
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    })
});

app.delete("/blogs/:id", function (req, res) {
    Blog.findByIdAndRemove(req.params.id, function (err) {
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    })
});

app.listen(port, function () {
    console.log("RESTfullBlogApp is running at port: " + port);
});