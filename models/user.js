var mongoose                =require('mongoose'),
    passport                =require('passport'),
    localStrategy           =require('passport-local'),
    passportLocalMongoose   =require('passport-local-mongoose');
var user_schema=new mongoose.Schema({
    username:String,
    password:String
});
user_schema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',user_schema);