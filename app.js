var express         =require('express'),
    app             =express(),
    bodyParser      =require('body-parser'),
    mongoose        =require('mongoose'),
    methodOverride  =require('method-override');
port=process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.set('view engine','ejs');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// Local server
//  mongoose.connect('mongodb://localhost/bus_system');

// online server
mongoose.connect("mongodb+srv://akashhegde2012:Akash2012$@cluster0.lz6jd.mongodb.net/bus_system?retryWrites=true&w=majority").then(() =>{
   console.log('connected to db');
}).catch(err =>{
   console.log('error',err.message);
});

// schema
var seat_schema=new mongoose.Schema({
    bus_id:mongoose.Schema.Types.ObjectId,
    user_name:String,
    no:Number,

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
//     // image:'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQbqs9y9nTCCv-W3TX_6Y2ADL3dlngzgwdJpQ&usqp=CAU'
//     image:'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202008/londel.jpeg?gpbctu1f7afh.dBf15gkuEFvySVaszRN&size=770:433'
   

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



var user_schema=new mongoose.Schema({
    username:String,
    password:String
});

app.get('/',(req,res)=>{
    res.render('landing');

});

app.get('/bus',(req,res)=>{
    Bus.find({},(err,allBus)=>{

            res.render('bus',{bus:allBus});
    });
});
app.get('/bus/:id',(req,res)=>{

    Bus.findById(req.params.id,(err,foundBus)=>{
        res.render('seats',{bus:foundBus})
    });
}); 
app.get('/seat/:id',(req,res)=>{
    Seat.findById(req.params.id,(err,foundSeat)=>{
        res.render('booking',{seat:foundSeat});
    });
});
app.get('/bus/:id/:seat_id/edit',(req,res)=>{
    
    Seat.findById(req.params.seat_id,(err,foundSeat)=>{
        res.render('booking',{seat:foundSeat,});
    });

}); 
//edit
app.get('/seat/:id/edit',(req,res)=>{
    Seat.findById(req.params.id,(err,foundSeat)=>{
        res.render('seatEdit',{seat:foundSeat}) ;
    });

});

app.put('/seat/:id/:bus_id',(req,res)=>{

    Seat.findByIdAndUpdate(req.params.id,req.body.seat,(err,updatedSeat)=>{

        Bus.findById(req.params.bus_id,function(err,foundBus){
            foundBus.chair[updatedSeat.no-1]=updatedSeat;
            foundBus.save((err,bus)=>{
                console.log(bus);
            });
        });
        

        res.render('confirm',{seat:updatedSeat});

    });

});
app.put('/confirm/:id/:bus_id',(req,res)=>{

    Seat.findByIdAndUpdate(req.params.id,req.body.seat,(err,updatedSeat)=>{

        Bus.findById(req.params.bus_id,function(err,foundBus){
            foundBus.chair[updatedSeat.no-1]=updatedSeat;
            foundBus.save((err,bus)=>{
                console.log(bus);
            });
        });
        

        res.redirect('/bus/'+req.params.bus_id);

    });

});


app.listen(port,()=>{
    console.log('server started');
});