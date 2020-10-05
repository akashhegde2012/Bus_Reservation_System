var express                 =require('express'),
    app                     =express(),
    bodyParser              =require('body-parser'),
    mongoose                =require('mongoose'),
    methodOverride          =require('method-override'),
    passport                =require('passport'),
    localStrategy           =require('passport-local'),
    User                    =require('./models/user');
    passportLocalMongoose   =require('passport-local-mongoose');
port=process.env.PORT || 3000;
app.use(require('express-session')({
    secret:'rusty is the best dog',
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
});

app.set('view engine','ejs');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// Local server
mongoose.connect('mongodb://localhost/bus_system');

// online server


// schema
var seat_schema=new mongoose.Schema({
    bus_id:mongoose.Schema.Types.ObjectId,
    user_name:String,
    no:Number,
    owner:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username:String
    }

});
var Seat = mongoose.model('Seat',seat_schema);
var bus_schema=new mongoose.Schema({
    name:String,
    image:String,
    chair:[seat_schema]
});
var Bus = mongoose.model('Bus',bus_schema);
// var newBus=new Bus(
//     {name:'Bus 3',
//     // image:'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTtQSvkdqsnHrr7Dnm5J2Omx_YbXBf-25WcbQ&usqp=CAU'
//      //image:'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQbqs9y9nTCCv-W3TX_6Y2ADL3dlngzgwdJpQ&usqp=CAU'
//     image:'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202008/londel.jpeg?gpbctu1f7afh.dBf15gkuEFvySVaszRN&size=770:433'
//     //image:'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSytXolTsSoS57ZaYwuYpxIrC5_thdp0RxrgA&usqp=CAU'
   
// });
// newSeat=[];
// for (var i=0;i<10;i++)
// {
//     var seat=new Seat(
//         {
//             bus_id:newBus._id,
//             user_name:'',
//             no:i+1
//         }
//     );
//     newSeat[i]=seat;
//     // newBus.chair.push(newSeat);
//      seat.save((err,seat)=>{
//          // console.log(seat);
        
        
//      });
//      newSeat[i]=seat;

// }
// newBus.chair=newSeat
// newBus.save((err,bus)=>{
//     console.log(bus);
// });
//Landing page
app.get('/',(req,res)=>{
    res.render('landing');

});
// bus page
app.get('/bus',(req,res)=>{
    Bus.find({},(err,allBus)=>{

            res.render('bus',{bus:allBus});
    });
});
//displaying seats
app.get('/bus/:id',(req,res)=>{

    Bus.findById(req.params.id,(err,foundBus)=>{
        res.render('seats',{bus:foundBus})
    });
}); 
//edit book seat
app.get('/seat/:id/edit',isLoggedIn,(req,res)=>{
    Seat.findById(req.params.id,(err,foundSeat)=>{
        res.render('seatEdit',{seat:foundSeat}) ;
    });

});

app.put('/seat/:id/:bus_id',isLoggedIn,(req,res)=>{

    Seat.findByIdAndUpdate(req.params.id,req.body.seat,(err,updatedSeat)=>{
        updatedSeat.owner.id=req.user._id;
        updatedSeat.owner.username=req.user.username;
        updatedSeat.save()
        console.log(updatedSeat)
        Bus.findById(req.params.bus_id,function(err,foundBus){
            foundBus.chair[updatedSeat.no-1]=updatedSeat;
            foundBus.save((err,bus)=>{
                //console.log(bus);
            });
        });
        

        res.render('confirm',{seat:updatedSeat});

    });

});
app.put('/confirm/:id/:bus_id',isLoggedIn,(req,res)=>{

    Seat.findByIdAndUpdate(req.params.id,req.body.seat,(err,updatedSeat)=>{

        Bus.findById(req.params.bus_id,function(err,foundBus){
            foundBus.chair[updatedSeat.no-1]=updatedSeat;
            foundBus.save((err,bus)=>{
                //console.log(bus);
            });
        });
        

        res.redirect('/bus/'+req.params.bus_id);

    });

});
//cancell seat
app.delete('/seat/:id/:bus_id',checkUser,(req,res)=>{
    var seatno=0
    Seat.findById(req.params.id,(err,deleteSeat)=>{
        seatno=deleteSeat.no;
    });

    Bus.findById(req.params.bus_id,function(err,foundBus){
        var seat=new Seat(
            {
                bus_id:foundBus._id,
                user_name:'',
                no:seatno
            }
        );
        seat.save((err,seat)=>{
                     // console.log(seat);
                     });

        foundBus.chair[seatno-1]=seat;
        foundBus.save((err,bus)=>{
            console.log(bus);
        });
    });
    Seat.findByIdAndRemove(req.params.id,(err)=>{
        res.redirect('/bus/'+req.params.bus_id);
    });
});

// authorization routes
// show register form
app.get('/register',(req,res)=>{
    res.render('register');
});
//signup
app.post('/register',(req,res)=>{
    var newUser=new User({username:req.body.username});
    User.register(newUser,req.body.password,(err,user)=>{
        if(err){
            console.log(err);
            return res.render('register');
        }
        else {
            passport.authenticate('local')(req,res,function(){
                res.redirect('/bus');
            });
        }
    });
});
// login
app.get('/login',(req,res)=>{
    res.render('login',{currentUser:req.user});
});
app.post('/login',passport.authenticate('local',
    {
        successRedirect:'/bus',
        failureRedirect:'/login',

    }),
    (req,res)=>{
    
});
//logout
app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/');
});
// middleware to check whether user owns the seat
function checkUser(req,res,next){
    if (req.isAuthenticated()){
        Seat.findById(req.params.id,(err,foundSeat)=>{
            if (err){
                res.redirect('back');
            }
            else{
                //does the seat belongs to the user
                if(foundSeat.owner.id.equals(req.user._id)){
                    next();
                }
                else{
                    res.redirect('back');
                }
            }
        });
    }
}
//middleware to check whether user is logged in
function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}
app.listen(port,()=>{
    console.log('server started');
});