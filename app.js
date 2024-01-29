require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB"); 

const schema  = new mongoose.Schema({
    username : String,
    password : String
});




const user = new mongoose.model("user",schema);

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");  
});

app.post("/register",function(req,res){
    
    bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
        const newuser = new user({
            username:req.body.username,
            password:hash
        });
        newuser.save().then(function(){
            res.render("secrets");
        }).catch(function(err){
            console.log("internal server error occured",err);
        });
    });

    
});

app.post("/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;
    user.findOne({'username':username}).then(function(found){
        if(found){
            bcrypt.compare(password, found.password, function(err, result) {
                console.log(result);
                if(result){
                    res.render("secrets");
                }else{
                    res.send("wrong password")
                }
            });
            
        }else{
            res.send("user not found");
        }
    }).catch(function(err){
        console.log("internal server error occured",err);
    });
});

app.listen(3000,function(){
    console.log("server is started at port 3000");
});