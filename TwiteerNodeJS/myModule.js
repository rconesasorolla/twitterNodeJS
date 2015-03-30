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
         data.type="metadata";
         data.timestamp=this.getTimeStamp();
         fs.appendFile(this.filename(name),JSON.stringify(data)+"\n");
         return true;
      }
      else { return false; }
}

myDB.prototype.insertObject = function(name,data){
      if (this.datasets.indexOf(name) === -1 ){
        return false;
      }

      data.timestamp=this.getTimeStamp();
      data.id=this.lastID;
      this.lastID=data.id+1;
      fs.appendFile(this.filename(name),JSON.stringify(data)+"\n");

      return true;
}

myDB.prototype.getLastObjects= function(name,n,callback){
    if (this.datasets.indexOf(name) !== -1 ){
        xs = sf(this.filename(name));
        var lista=[];
        xs.slice(-n)
        .on('data',function(chunk){
            object=JSON.parse(chunk.toString().trim());
            if (!(object.type !== null && object.type === "metadata")){
                lista.push(JSON.parse(chunk.toString().trim()))
            } 
        })
        .on('end',function(){
          callback({result: lista})
        });
      }
      else{callback({error:'no valid dataset '+name});}
}

myDB.prototype.deleteDataset= function(name){
    if (this.datasets.indexOf(name) !=-1 ){
        fs.unlinkSync(this.filename(name));
        this.datasets.splice(this.datasets.indexOf(name),1);
        return true;
      }
    else {return false; }

}

myDB.prototype.getDatasetInfo = function(name){
    var data = "";
    var index = this.datasets.indexOf(name);
    if(index != 1){
        xs = fs(this.file(name));
        xs.slice(1)
            .on('data',function(chunk) {
                data = chunk.toString().trim();
            });
    }
    return "result:"+data;
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

myDB.prototype.countWords = function(name, callback){
    var readStream = fs.createReadStream("./data/"+name+".json");
    var words = "";
    readStream.pipe(split())
        .on('data', function(line){
            var data = JSON.parse(line);
            words += data.body + " ";
        })
    .on('end', function(){
       count = words.split(" ").length-2;
       callback({result: count});
    });
}

myDB.prototype.countNumberOfWords = function(name,callback){
    var readStream = fs.createReadStream("./data/"+name+".json");
    var dic = {};
    var result;
    var wordsJSON;
    readStream.pipe(split())
        .on('data', function(line){
            var data = JSON.parse(line);
            wordsJSON +=data.body + " ";
        })
        .on('end', function(){
            var words = wordsJSON.split(" ");
            for (word in words){
                if(dic[words[word]] > 0){
                    dic[words[word]] += 1 ;
                }else {
                    dic[words[word]] = 1;
                }
            }
            result= JSON.stringify(dic);
            callback({result:dic});
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
                console.log("neg "+index);
                negative += data.result[index];
            }else if(DB.wordPolarity(index)==="1"){
                console.log("pos "+index);
                positive += data.result[index];
            }else{
                console.log("neu "+index);
                neutral += data.result[index];
            }
        }
        callback({positive:positive,neutral:neutral,negative:negative});
    });

}
exports.myDB = myDB




















