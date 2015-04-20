var gb = require('glob');
var fs = require('fs');
var sf = require('slice-file');
var split = require('split');

myDB = function(dataDir){
        this.dataDir=dataDir+"/";
        this.datasets=[];
        this.lastID=0;
        this.inspectDatasets();
        this.polarityDic = {};
        this.numberLinesDic = {};
        this.wordsDic = {};
        this.headers = [];
}

myDB.prototype.inspectDatasets = function(){
     var dataDir=this.dataDir
     files= gb.glob(this.dataDir+'*.json',{sync:true});
     this.datasets=files.map(function(e){
                     return e.trim().replace(dataDir,"").replace(".json","")
                    });
     return true;
}

myDB.prototype.getDatasets = function(){
    return this.datasets
}

myDB.prototype.getNumberOfLines = function(name,callback){
    var readStream = fs.createReadStream("./data/"+name+".json");
    var numberOfLines = 0;
    readStream.pipe(split())
        .on('data', function(){
            numberOfLines++;
        })
        .on('end',function(){
            numberOfLines--;
            callback({value:numberOfLines,key:name});
        })
}


myDB.prototype.getStreamsCount= function() {
    var streams = this.getDatasets();
    var dic = this.numberLinesDic;
    for (stream in streams) {
        this.getNumberOfLines(streams[stream],function(data){
            dic[data.key]=data.value;
        });
    }
}


myDB.prototype.filename = function(name){
	   return this.dataDir+name+".json";
}

myDB.prototype.getTimeStamp = function(){
     var date=new Date().toISOString();
     return date;
}

myDB.prototype.createDataset = function(name,data){
     if (this.datasets.indexOf(name) === -1){
         this.datasets.push(name);
         data.endTime=this.getTimeStamp();
         fs.appendFile(this.filename(name),JSON.stringify(data)+"\n");
         return true;
      }
      else { return false; }
}

myDB.prototype.insertObject = function(last,name,data){
      if (this.datasets.indexOf(name) === -1 ){
        return false;
      }
        data.timestamp = this.getTimeStamp();
        if (last) {
            fs.appendFile(this.filename(name), JSON.stringify(data));

        } else {
            fs.appendFile(this.filename(name), JSON.stringify(data) + "\n");
        }


      return true;
}

myDB.prototype.insertLine = function(name){
    if (this.datasets.indexOf(name) === -1 ){
        return false;
    }
    fs.appendFile(this.filename(name), "\n");
}

myDB.prototype.getLastObjects= function(name,n,callback){
    if (this.datasets.indexOf(name) !== -1 ){
        xs = sf(this.filename(name));
        var lista=[];
        xs.slice(-n)
        .on('data',function(chunk){
            object=JSON.parse(chunk.toString().trim());
            if (!(object.type !== null && object.type === "SearchAction")){
                lista.push(JSON.parse(chunk.toString().trim()))
            } 
        })
        .on('end',function(){
          callback({result: lista})
        });
      }
      else{callback({error:'no valid dataset '+name});}
}

myDB.prototype.orderDictionary = function(name,n,callback) {

    var dict = this.wordsDic[name];
    var items = Object.keys(dict).map(function (key) {
        return [key, dict[key]];
    });

    items.sort(function (first, second) {
        return second[1] - first[1];
    });

    callback({result:items.slice(0,n)});

}

myDB.prototype.getDictionaryWordsDatasets = function(){
    var dic = this.wordsDic;
    var datasets = this.datasets;
    for(i in this.datasets){
        this.countNumberOfWords(datasets[i],function(data){
            dic[data.name]=data.result;
        });
    }
}

myDB.prototype.deleteDataset= function(name){
    if (this.datasets.indexOf(name) !=-1 ){
        fs.unlinkSync(this.filename(name));
        this.datasets.splice(this.datasets.indexOf(name),1);
        return true;
      }
    else {return false; }

}


myDB.prototype.searchDataset = function(keyword){
    result =[];
    for(dataset in this.datasets){
       if(dataset.indexOf(keyword) !=-1){
           result.appendData(dataset);
       }
    }
    return "result:"+result;
}


myDB.prototype.countNumberOfWords = function(name,callback){
    var readStream = fs.createReadStream("./data/"+name+".json");
    var dic = {};
    var result;
    var wordsJSON="";
    readStream.pipe(split())
        .on('data', function(line){
            var data = JSON.parse(line);
            if(data.type != "metadata"){
                wordsJSON +=data.text + " ";
            }
        })
        .on('end', function(){
            wordsJSON=wordsJSON.trim();
            var words = wordsJSON.split(" ");
            for (word in words){
                if(dic[words[word]] > 0){
                    dic[words[word]] += 1 ;
                }else {
                    dic[words[word]] = 1;
                }
            }
            result= JSON.stringify(dic);
            callback({result:dic,name:name});
        });

}


myDB.prototype.wordPolarity = function(){
    var readStream = fs.createReadStream("../polaridades.txt");
    var dic = this.polarityDic;
    readStream.pipe(split())
        .on('data', function(line){
            var data =line.split("	");
            dic[data[0]] = data[1];
        })
        .on('end', function(){

        });
}

myDB.prototype.streamPolarity = function(name,callback){
    var positive = 0;
    var negative = 0;
    var neutral  = 0;
    var DB = this;
    this.countNumberOfWords(name,function(data){
        for(index in data.result){
            if(DB.polarityDic[index]==="-1"){
                negative += data.result[index];
            }else if(DB.wordPolarity(index)==="1"){
                positive += data.result[index];
            }else{
                neutral += data.result[index];
            }
        }
        var total = positive+negative+neutral;
        callback({result:{positive:positive/total,negative:negative/total,neutral:neutral/total}});
    });

}

myDB.prototype.getLastTweets = function(name,count,callback) {
    var tweets = [];
    this.getLastObjects(name,count,function(data){
        for (tweet in data.result) {
            tweets.push(data.result[tweet].id);
        }
        callback({result:tweets});
    });
}


myDB.prototype.getTweetsWithGeo = function(name,callback){
    var dic = {};
    var readStream = fs.createReadStream("./data/"+name+".json");
    readStream.pipe(split())
        .on('data', function(line){
            var parsedData = JSON.parse(line);
            if(parsedData.coordinates != null){
                dic[parsedData.id] = [parsedData.coordinates.coordinates[1],parsedData.coordinates.coordinates[0]];
            }
        })
        .on('end', function(){
            callback({result:dic});
        });

}

myDB.prototype.getDatasetInfo = function(name,callback){
    var data = "";
    var index = this.datasets.indexOf(name);
    if(index != -1) {
        xs = sf(this.filename(name));
        xs.slice(0,1)
            .on('data', function (chunk) {
                callback({result:JSON.parse(chunk.toString().trim())});
            });
    }
}

myDB.prototype.getHeaders = function(){
    var head = this.headers;
    var datasets = this.datasets;
    for(i in datasets){
        this.getDatasetInfo(datasets[i],function(data){
            head.push(data.result);
        });
    }
}


exports.myDB = myDB




















