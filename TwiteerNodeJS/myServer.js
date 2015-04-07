var application_root=__dirname,
    express = require("express"),
    path = require("path")

var app = express();

app.use(express.static(path.join(application_root,"public")));

var bodyparser=require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

var db=require('./myModule');
var DB=new myDB('./data');


app.get('/',function(req,res){
    res.sendFile("public/myMashup.html",{root:application_root});
});

app.get('/index.html',function(req,res){
    res.sendFile("public/myMashup.html",{root:application_root});
});

app.get('/public/:fname',function(req,res){
	res.sendFile("public/"+req.params.fname,{root:application_root});
});

app.get('/blog',function(req,res){
    res.send({result: DB.getDatasets()});
});

app.get('/blog/delete/:name',function(req,res){
    if (DB.deleteDataset(req.params.name)){
        res.send({result:'OK'})
    }
    else{
        res.send({error:'some DB error'});
    }  
});

app.post('/blog',function(req,res){
    if (req.body !== null && req.body.title !== null){
        if (DB.createDataset(req.body.title,req.body)){
            res.send({result:'OK'});
        }
        else{ res.send({error:'this dataset already exists'}) }
        
    }
    else { res.send({error:'missing title'}) }
});

app.get('/blog/:name',function(req,res){
    n = (req.query.n == null) ? 10 : parseInt(req.query.n);
    DB.getLastObjects(req.params.name,n,function(data){
        res.send(data);
    })
})

app.post('/blog/:name',function(req,res){
    if (req.body !== null && req.params.name.length>0){
        if (DB.insertObject(req.params.name,req.body)){
            res.send({result:'OK'})
        }
        else { res.send({error:'some DB error'}); }
    }
    else { res.send({error:'no data provided'});}
});

//GET /blog/:name/words

//GET /blog/search

//GET /blog/:name/info

console.log("Web server running on port 8000");

app.listen(8000);


