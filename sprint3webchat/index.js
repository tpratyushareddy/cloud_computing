const express= require('express');
const app =express()
const axios=require('axios');
var port=process.env.PORT || 8080;
const server =require('http').createServer(app);
const io= require('socket.io')(server);
app.use(express.static('static'))
app.use(express.urlencoded({extended:false}))
server.listen(port,()=>
    console.log(`HTTP Server with Express.js is listening on port:${port}`))
app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/static/chatclient/index.html');
})



io.on('connection',(socketclient) =>{
    var onlineClients= Object.keys(io.sockets.sockets).length;
    // console.log(onlineClients)

    socketclient.on("login",(data)=>{
        // console.log(data);
        
        axios({
                    method: 'post',
                    url: 'https://sprint2-chat.herokuapp.com/login',
                    data: data
        })
        .then(async (result) => {
            // console.log(result.data);
            if(result.data.code == 200){
                socketclient.authenticated=true;
                socketclient.user=result.data;
                await socketclient.emit('loginsuccess', { code: result.data.code, message: result.data.message,username:result.data.username,fullname:result.data.fullname});
                // console.log('success login');
                
                await addOnlineUser();
                // console.log('Added online user');

            }else{
                socketclient.emit("loginfail", { code: result.data.code, message: result.data.message});
            }
            return;
        })
        .catch(err => {
            socketclient.emit("loginerror", { code: 500, message: 'Server error'});

            
        });
    })
    socketclient.on("signup",(data)=>{

                axios({
                    method: 'post',
                    url: 'https://sprint2-chat.herokuapp.com/signup',
                    data: data
                })
                .then(data =>{
                    // console.log(data);
                    
                      socketclient.emit('signedup',{ code: data.data['code'], message: data.data['message'] })
                    })
                .catch(err=>{
                        // console.log(err);
                      socketclient.emit('signuperror',err)
                    });;
    });
    // console.log('A new client is connected!')
    
    socketclient.on("message",(data)=>{
        // console.log("Data From client:" + data);
        // console.log("msg here")
        if(socketclient.authenticated === true) {
            let event = "messagereceived";
        var sockets=io.sockets.sockets
        for(var id in sockets){
            const socketclient= sockets[id];
            if(socketclient && socketclient.authenticated){
                socketclient.emit(event,data);
            }
            }
        }
        
    });
    socketclient.on("requestChatHistory",(receiver)=>{
        let sender=socketclient.user.username
        console.log(receiver);
        console.log(sender)
        let requestData={
            sender:sender,
            receiver:receiver
        }
        axios({
            method: 'post',
            url: 'https://sprint2-chat.herokuapp.com/requestMsgs',
            data: requestData
        })
        .then(async (result) => {
            console.log('111111', result);
            let chathistoryinfo={
                currentuser:socketclient.user.username,
                otheruser:receiver,
                chat:result.data.chats
            }
            socketclient.emit("sendChatHistory",chathistoryinfo)
        })
        .catch(err=>{
            console.log(err);
        })
    })
    socketclient.on("newPrivateMsg",(data)=>{
        var sockets=io.sockets.sockets
        data['sender']=socketclient.user.username;
        // console.log("jay");
        
        if(data.receiver=="chatbot"){
            
            let message=data.msg.trim()
            console.log(message)   
            console.log()         
            let datachatbot={"message":message}
            
            axios({
            method: 'post',
            url: `http://sprint2-chat.herokuapp.com/chatbot`, 
            data: datachatbot
            })
        .then(async (result) => {
           // console.log(result);
            socketclient.emit("chatbotmessage",result.data.chats);
            let requestData = {
                sender:'chatbot',
                receiver:socketclient.user.username,
                message:result.chats
            }
        // console.log(result)
            
        

            axios({
                method: 'post',
                url: 'https://sprint2-chat.herokuapp.com/saveMessage',
                data: requestData
            })
            .then(async (result) => {
                // console.log(result);
            })
            .catch(err=>{
                // console.log(err);
            })
            })
            .catch(err=>{
                // console.log(err);
            })
           
        }
        else
        {
            for(var id in sockets){
            const eachsocket= sockets[id];
                if(eachsocket && eachsocket.authenticated && eachsocket.user.username==data.receiver){
                    eachsocket.emit('newIncomingMsg',data);
                }
            }
        }
        

        let requestData = {
            sender:data['sender'],
            receiver:data.receiver,
            message:data.msg
        }
        axios({
            method: 'post',
            url: 'https://sprint2-chat.herokuapp.com/saveMessage',
            data: requestData
        })
        .then(async (result) => {
            //console.log(result);
        })
        .catch(err=>{
            // console.log(err);
        })
        
    })
    socketclient.on("typing",()=>{
        // console.log("Someone is typing...");
        io.emit("typing",`${socketclient.id} is typing ...`);
    });
    socketclient.on('disconnect',()=>{
        var onlineClients = Object.keys(io.sockets.sockets).length;
        addOnlineUser();
        
    });
     function addOnlineUser(){
        var allSockets=io.sockets.sockets
    // console.log('adding online user');
    
        var onlineUsers=[]
        onlineUsers.push({"username":"chatbot","fullname":"chatbot"})
        for(let id in allSockets){
            let eachsocket= allSockets[id];
            if(eachsocket && eachsocket.authenticated){
                onlineUsers.push(eachsocket.user)
                
            }
        }
        // console.log(onlineUsers)
        for(let id in allSockets){
            let eachsocket= allSockets[id];
            if(eachsocket && eachsocket.authenticated){
                // console.log("onlone users")
                eachsocket.emit("updatedUsers",onlineUsers)
            }
        }
    }
});
