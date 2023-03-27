const express = require('express')
const app = express()
const cors = require('cors')
const axios = require('axios')
app.use(cors())
app.use(express.static('static'))
app.use (express.urlencoded({extended: false}))
// app.listen(port) 
var port = process.env.PORT || 8082;
console.log("Express server is running on port " + port)

const http = require('http').Server(app).listen(port)

const io = require('socket.io')(http);
console.log("socket.io server is running on port" + port);
app.get("/chat", (req,res)=>{
    res.sendFile(__dirname + '/static/chatclient/index.html')
})
 io.on('connection', (socketclient) => {    

    socketclienthandler(socketclient)
 })
function socketclienthandler(socketclient){
    var onlineClients = Object.keys(io.sockets.sockets).length;
    
    socketclient.on("typing", () => {
        console.log(`${socketclient.id} is typing ...`)
        socketclient.broadcast.emit("typing", `${socketclient.id} is typing...`);
    });
    
    socketclient.on('disconnect', () => {
        var onlineClients = Object.keys(io.sockets.sockets).length;
        var byemessage = `${socketclient.id} is disconnected! Number of connected client: ${onlineClients}`;
        console.log(byemessage);
        io.emit("online", byemessage);
    });

    socketclient.on("signup",(data)=>{
        axios({
            method:'post',
            url:'https://webchatp1.herokuapp.com/signup',
            data:data
    })
    .then(res =>{
        if(res.data.code == 200){
            io.emit("signupsuccess",res.data);
        }
        else{
            io.emit("sd",res.data);
        }
    }).catch(e=>{
        throw e;
    })
    })

    socketclient.on("login",(data) =>{
    console.log(data)
    axios({
            method:'post',
            url:'https://webchatp1.herokuapp.com/login',
            data:data
    })
    .then(res =>{
        console.log(res.data.code);
        if(res.data.code == 200){
            socketclient.authenticated = true;
            console.log(socketclient.authenticated);
            io.emit("loginsuccess",res.data);
            var welcomemessage = `${socketclient.id} is connected! Number of connected client: ${onlineClients}`;
            console.log(welcomemessage);
            io.emit("online", welcomemessage);
        }
        else{
            io.emit("loginerror",res.data)
        }
                
    })
    .catch(e => {
        console.log(e)
    })
    })
    

    socketclient.on("message", (data)=>{
                console.log('Data from a client: ' + data)
                io.emit("message", `${socketclient.id} says: ${data}`);
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

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/static/chatclient/index.html');
})


