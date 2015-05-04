var application_root=__dirname,
    express = require("express"),
    path = require("path")

var app = express();

var util = require('util'),

    twitter = require('twitter');
var tweet = new twitter({
    consumer_key: '1nZVPdBqHfii4yOwAXliw36iK',
    consumer_secret: 'k5uvQ7pbIVCiPt8ktO4Fvyi55rnnhUx3dJSXJXzxCy6OKVCJ1j',
    access_token_key: '78948870-sofa6mkaz6DW6NJpQJCkH7Px6ErVEQeAfRtW18QJe',
    access_token_secret: 'Gt7Lp99EjrXZgpxLkN3cQxuSimturDWeFWS9UMsZiBRCM'
});


var MongoClient = require('mongodb');
var assert=require("assert");

app.use(express.static(path.join(application_root,"public")));

var bodyparser=require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

var db=require('./myModule');
var DB=new myDB('./data');

DB.getDictionaryWordsDatasets();
DB.getStreamsCount();
DB.getHeaders();


app.get('/',function(req,res){
    res.sendFile("public/myMashup.html",{root:application_root});
});

app.get('/index.html',function(req,res){
    res.sendFile("public/myMashup.html",{root:application_root});
});

app.get('/public/:fname',function(req,res){
	res.sendFile("public/"+req.params.fname,{root:application_root});
});

app.get('/stream',function(req,res){
    res.send({result: DB.numberLinesDic});
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

app.post('/stream/',function(req,res){
    console.log("Json: "+ req.body);
    var json = {"@id":req.body.id,"@context":"http://schema.org/","@type":"SearchAction",
        "agent":{"@type":"Person","name":req.body.agent},
        "query":req.body.data,"sameAs":req.body.sameAs,"location":req.body.location,"url":"localhost:8000/"+req.body.id};
    DB.createDataset(req.body.id,json);

   // DB.getDatasetInfo(req.body.id,function(data){});
    saveTweets(req.body.data);

    MongoClient.connect("mongodb://localhost:27017/twitter", {native_parser:true},
        function(err, db) {
            assert.equal(null, err);
            db.collection('jsonld').insertOne(json,
                function(err, result) {
                    assert.equal(null, err);
                    console.log(result.insertedId);
                    db.close();
                });
        });

    if(DB.datasets.indexOf(req.body.data)!=-1){
        setTimeout(function() {
            DB.getDictionaryWordsDatasets();
            DB.getStreamsCount();
            DB.getHeaders();
        }, 5000);

        res.send({result:'Success'});
    }
    else {
        res.send({error: 'ERROR'});
    }
});

function saveTweets(query){
    tweet.get('search/tweets.json',{q:query},function(error,data,status){
        var x;
        for(x in data){
            for(j in data[x]){
                var last = (j == data[x].length-1);
                DB.insertObject(last,query,{'id': data[x][j].id_str, 'text' : data[x][j].text, 'coordinates' : data[x][j].coordinates});
            }
            break;
        }
    });

}

function updateTweets(query){
    tweet.get('search/tweets.json',{q:query},function(error,data,status){
        var x;
        DB.insertLine(query);
        for(x in data){
            for(j in data[x]){
                var last = (j == data[x].length-1);
                DB.insertObject(last,query,{'id': data[x][j].id_str, 'text' : data[x][j].text, 'coordinates' : data[x][j].coordinates});
            }
            break;
        }
    });

}

app.get('/stream/:name/words/',function(req,res){
   DB.orderDictionary(req.params.name,req.query.top,function(data){
       res.send(data);
   });
});

app.get('/stream/:name/polarity/',function(req,res){
    DB.streamPolarity(req.params.name,function(data){
        res.send(data);
    });
});

app.get('/stream/:name/', function(req, res){
    DB.getLastTweets(req.params.name,req.query.limit, function(data){
        res.send(data);
    });
});

app.put('/stream/:name',function(req,res){
    updateTweets(req.params.name);
    setTimeout(function() {
        DB.getDictionaryWordsDatasets();
        DB.getStreamsCount();
        DB.getHeaders();
    }, 5000);

    res.send({result:'OK'});

});

app.get('/stream/:name/geo/',function(req,res){
    DB.getTweetsWithGeo(req.params.name,function(data){
        res.send(data);
    });
});

app.get('/stream/graph/',function(req,res){
    console.log(DB.headers);
    res.send({result:DB.headers});
});


console.log("Web server running on port 8000 fuck yeah!");

app.listen(8000);


