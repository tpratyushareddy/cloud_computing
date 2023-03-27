const express= require('express');
const cors=require('cors');
var bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express()
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var port=process.env.PORT || 8080;
app.use(cors());
app.use(express.static('/'))
app.listen(port);
console.log("Express starting on port:"+port);
app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html'); 
});
const mongourl = "mongodb+srv://cca-thamminenip1:kanna@cca-thamminenip1.uulfm.mongodb.net/cca-labs?retryWrites=true&w=majority"
    const dbClient = new MongoClient(mongourl,{useNewUrlParser:true,useUnifiedTopology:true});
    dbClient.connect((err)=>{
        if(err) throw err;
        console.log("Connected to the MongoDB cluster and Database !");
    });
    app.post('/login', urlencodedParser, function (req, res) {
        let username=req.body.username
        let password=req.body.password
        const db =dbClient.db();
        db.collection("users").findOne({username:username}).then(results=>{
            console.log(results);
            console.log(username,password);
    
            if(results && results['username']==username && results['password']==password){
                res.json({"status":200,"message":"Success"});
            }else{
                res.json({"status":503,"message":"Invalid"})
            }
        });        
    })

    app.post('/signup', urlencodedParser, function (req, res){
        let data={
            username:req.body.reg_username,
            password:req.body.reg_password,
            fullName:req.body.fullname,
            email:req.body.email
        }
        try {
            const db =dbClient.db();
            db.collection("users").insertOne(data);
            res.json({"status":200,"message":"Registered Successfully"})
        } catch (e) {
            console.log(e);
            res.json({"status":503,"message":"Invalid"})
        }
    });