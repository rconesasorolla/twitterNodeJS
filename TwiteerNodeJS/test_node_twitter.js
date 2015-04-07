var gb = require('glob');
var fs = require('fs');
var sf = require('slice-file');
var split = require('split');

db = require("./myModule");
var DB = new myDB("./data");
DB.wordPolarity();
var linesDic ={};
var util = require('util'),

    twitter = require('twitter');
var tweet = new twitter({
    consumer_key: '1nZVPdBqHfii4yOwAXliw36iK',
    consumer_secret: 'k5uvQ7pbIVCiPt8ktO4Fvyi55rnnhUx3dJSXJXzxCy6OKVCJ1j',
    access_token_key: '78948870-sofa6mkaz6DW6NJpQJCkH7Px6ErVEQeAfRtW18QJe',
    access_token_secret: 'Gt7Lp99EjrXZgpxLkN3cQxuSimturDWeFWS9UMsZiBRCM'
});



/*tweet.get('search/tweets.json',{q:'patata'},function(error,data,status){
    var x;
    for(x in data){
        for(j in data[x]){
        console.log(data[x][j].id);
                }
        break;
    }
        //console.log(util.inspect(data))

});*/

var json;

function createDataset(query,DB){
    var json = {"creator":"yo","about":query,"type":"","timestamp":""};
    DB.createDataset(query,json);

    DB.getDatasetInfo(query,function(data){
        console.log(data.result);
    });
}


function saveTweets(query,DB){
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

function wordPolarity(name, DB){
    DB.wordPolarity(name, function (data){
        console.log("Polaridad: "+data);
    });
}

function streamPolarity(name, DB){
    DB.streamPolarity(name,function(data){
        console.log("Polaridad positiva:"+ data.positive + " Polaridad neutral:" + data.neutral+ " Polaridad negativa:" + data.negative);
    })
}

function countNumberOfWords(query,DB){
    DB.getNumberOfLines(query,function(data){
        console.log(data.result);
    })
}

function getLastTweets(query,number,DB){
    DB.getLastObjects(query,number,function(data){
        console.log(data.result);
    });
}
//DB.countNumberOfWords('camiones',function(data){

//});
//setTimeout(function() {
//    DB.orderDictionary(2);
//}, 3000);

function getTweetsGeo(query,DB){
    DB.getTweetsWithGeo(query,function(data){
       console.log(data.result);
    });
}

getTweetsGeo("patata",DB);


//DB.getStreamsCount();
//setTimeout(function() {
    //console.log(DB.numberLinesDic);
//}, 3000);

//getLastTweets("patata",4,DB);

//createDataset('patata',DB);
//saveTweets('patata',DB);
//countNumberOfWords('coches',DB);
//countWords('coches',DB);
//wordPolarity('volcar',DB);
//streamPolarity('coches', DB);



