db = require("./myModule");
var DB = new myDB("./data");


var util = require('util'),

    twitter = require('twitter');
var tweet = new twitter({
    consumer_key: '1nZVPdBqHfii4yOwAXliw36iK',
    consumer_secret: 'k5uvQ7pbIVCiPt8ktO4Fvyi55rnnhUx3dJSXJXzxCy6OKVCJ1j',
    access_token_key: '78948870-sofa6mkaz6DW6NJpQJCkH7Px6ErVEQeAfRtW18QJe',
    access_token_secret: 'Gt7Lp99EjrXZgpxLkN3cQxuSimturDWeFWS9UMsZiBRCM'
});

//tweet.get('search/tweets.json',{q:'patata'},function(error,data,status){
//        console.log(util.inspect(data))
//});



function saveTweets(query,DB){
    var json = {"creator":"yo","about":query,"type":"","timestamp":""};

    DB.createDataset(query,json);
    tweet.get('search/tweets.json',{q:query},function(error,data,status){
                //insert data into the DB
                var x;
                for(x in data){
                    for(j in data[x]){
                        DB.insertObject(query,{'id': data[x][j].id, 'text' : data[x][j].text, 'coordinates' : data[x][j].coordinates});
                    }
                    break;
                }
            });
}


function countWords(name, DB) {
    DB.countWords(name, function (data) {
        console.log("Numero de palabras: " + data["result"]);
    });

}

function countNumberOfWords(name, DB){
    DB.countNumberOfWords(name, function(data){
        console.log("Palabras y numeros: "+data["result"]);
    });
}

function wordPolarity(name, DB){
    DB.wordPolarity(name, function (data){
        console.log("Polaridad: "+data);
    });
}

function streamPolarity(name, DB){
    DB.streamPolarity(name,function(data){
        console.log("Polaridad: "+data["result"]);
    })
}


//saveTweets('patata',DB);
//countNumberOfWords('camiones',DB);
//countWords('coches',DB);
//wordPolarity('volcar',DB);
streamPolarity('patata', DB);



