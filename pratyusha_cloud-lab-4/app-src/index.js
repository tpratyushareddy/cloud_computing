const express = require('express')
const app = express()
var port = process.env.PORT || 8080;
const cors= require('cors')
app.use(cors())
app.use(express.static('static'))
app.use(express.urlencoded({extended: false}))
//app.listen(port, () => 
    //console.log(`HTTP Server with Express.js is listening on port:${port}`)
//)
const http = require('http').Server(app).listen(port)

app.get('/', (req, res) =>{
    res.sendFile('./app-src/static/chatclient/index.html');
});
app.get('/echo.php', function (req, res){
    var data = req.query.data
    res.send(data)
})
app.post('/echo.php', function (req, res){
    var data = req.body['data']
    res.send(data)
})
app.get('/uscities-search', (req, res)=>{
    res.send("US city search Microservice by Pratyusha Reddy Thammineni !!!!!!!. Usage: URL/uscities-search/:zips(\\\\d{1,5})");
})
let fields = {_id: false,
    zips : true,
    city : true,
    state_id: true,
    state_name: true,
    county_name: true,
    timezone: true};
app.get ('/uscities-search/:zips(\\d{1,5})', function (req, res) {
    const db = dbClient.db();
    let zipRegEx = new RegExp(req.params.zips);
    const cursor = db.collection("uscities") .find ({zips:zipRegEx}).project(fields);
    cursor.toArray(function(err, results){
    console.log(results); // output all records for debug only
    res.send(results);
    });
});
app.get ('/uscities-search/:city', function (req, res) {
    const db = dbClient.db() ;
    let cityRegEx = new RegExp(req.params.city, 'i');
    const cursor = db.collection("uscities").find ({city:cityRegEx}).project(fields);
    // ensure that you have defined the fields variable previously
    cursor.toArray (function(err, results){
        console.log (results); // output all records
        res.send(results);
    });
});
const MongoClient = require ('mongodb').MongoClient;
const mongourl="mongodb+srv://cca-thamminenip1:kanna@cca-thamminenip1.uulfm.mongodb.net/cca-labs?retryWrites=true&w=majority"; //from previous step
const dbClient= new MongoClient (mongourl,{useNewUrlParser: true, useUnifiedTopology: true}) ;
dbClient.connect (err => {
    if (err) throw err;
    console.log ("Connected to the MongoDB cluster and Database") ;
})
const io = require('socket.io')(http);
console.log("Socket.io server is running on the port "+port);

app.get("/chat", (req,res)=>{
    res.sendFile(__dirname + '/static/chatclient/index.html')
});
io.on('connection', (socketclient) => {
    console.log('A new client is connected !!');
    socketclienthandler(socketclient);
});
function socketclienthandler(socketclient){
    /* Code to handle should be written here */
};
function socketclienthandler(socketclient){
    socketclient.on("message", (data)=>{
        console.log('Data from a client: ' + data)
        io.emit("message", `${socketclient.id} says: ${data}`);
    });
    socketclient.on("typing", () => {
        console.log(`${socketclient.id} is typing ...`)
        socketclient.broadcast.emit("typing", `${socketclient.id} is typing...`);
    });
    var onlineClients = Object.keys(io.sockets.sockets).length
    var welcomemessage = `${socketclient.id} is connected! Number of connected clients: ${onlineClients}`;
    console.log(welcomemessage);
    io.emit("online", welcomemessage);

    socketclient.on("disconnect", ()=>{
        var onlineClients = Object.keys(io.sockets.sockets).length
        var byemessage = `${socketclient.id} is disconnected! Number of connected clients: ${onlineClients}`;
        console.log(byemessage);
        io.emit("online", byemessage);
    });    
}