db=require('./myModule')
DB=new myDB('./data')


console.log(DB)
DB.getLastObjects('cotorras',3,function(data){console.log(data);})
DB.createDataset('motos',{'creator':'yo','about':'vehiculos'})
DB.createDataset('coches',{'creator':'yo','about':'vehiculos'})
DB.createDataset('camiones',{'creator':'yo','about':'vehiculos'})

DB.insertObject('coches',{body:',mi primer coche',creator:'yo'})

setTimeout(function(){
	DB.insertObject('coches',{body:',mi segundo coche',creator:'yo'})
	}, 2000);

DB.insertObject('camiones',{body:',mi primer coche',creator:'yo'})

DB.insertObject('motos',{body:',mi primera moto',creator:'yo'})
DB.insertObject('motos',{body:',mi segunda moto',creator:'yo'})
DB.insertObject('motos',{body:',mi tercera moto',creator:'yo'})
DB.getLastObjects('motos',3,function(data){console.log(data);})

console.log(DB.getDatasets());

setTimeout(function(){DB.deleteDataset('motos'); console.log(DB)},3000)
