var restify = require('restify');
var builder = require('botbuilder');
var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=05cc84c9-6d4a-497f-9981-cbcd438efece&subscription-key=71e4270a84a546fe814e1b0f6d4983cf');
var intents = new builder.IntentDialog({ recognizers: [recognizer] });

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

//Connection with MS Bot Framework
var connector = new builder.ChatConnector({
    appId: '418d8392-0f66-4268-8870-a68ad9f68f44',
    appPassword: 'FnsKJ0JbC7EYA8vddnhFd3u'
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//DocumentDB 

var mongodb = require('mongodb').MongoClient,
    docDBURL = 'mongodb://botcafeteria1:PB34wQAEOMmYRTBxdclLAY1cPN6AZi3enaV6HDOniTMDo3NY6cN7Ql0gpsKscJUridcpQRQqsIB21FWfhZQ8iA==@botcafeteria1.documents.azure.com:10250/?ssl=true';
var assert = require('assert');
 

mongodb.connect(docDBURL, function (err, db) {
     
  assert.equal(null, err);
  console.log("Connected correctly to server");

getBebidas(db,function(results){
    console.log(results[0].name);
});



});

var insertBocatas = function(db, callback) {
  // Get the documents collection 
  var collection = db.collection('Bocatas');
  // Insert some documents 
  if (collection.find({}).count()== 0){
    collection.insertMany([
        { name: 'Bocata de Bacon',
         precio: "4,50€",
         tipo:'comida',
         stock:'10' },
    
        { name: 'Bocata de Jamón',
        precio: '4,5€',
        tipo:'comida',
        stock:'10' },

        { name: 'Bocata de Pollo',
        precio: "4,5€",
        tipo:'comida',
        stock:'15' }],

         function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 Bocatas");
    callback(result);
  });
}else{
    console.log('Bocatas is already filled');
}
}
var insertBebidas = function(db, callback) {
  // Get the documents collection 
  var collection = db.collection('Bebidas');
  // Insert some documents 

if (collection.find({}).count() == 0){
  collection.insertMany([
        { name: 'Coca-Cola',
         precio: "1€",
         tipo:'Bebida',
         stock:'20' },
    
        { name: 'Nestea',
         precio: "1€",
         tipo:'Bebida',
         stock:'20' },

        { name: 'Fanta',
         precio: "1€",
         tipo:'Bebida',
         stock:'20' }],

         function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 Bocatas");
    callback(result);
  });
}else{
    console.log('Bebidas is already filled');
}
}

var getBocatas = function(db, callback) {
  // Get the documents collection 
  var collection = db.collection('Bocatas');
  // Find some documents 
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    assert.equal(3, docs.length);
    console.log("Found the following records");
    console.dir(docs);
    callback(docs);
  });
}
var getBebidas = function(db,name,callback) {
 
   
  // Get the documents collection 
    var collection = db.collection('Bebidas');
    collection.find({name:name}).toArray(function(err,results){
        if(err){
            console.log('Error',err);
        }else{
     
            return results;
            }

    })
   

}


  

//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/', intents);

intents.matches('Saludo', function (session, args, next) {
    session.send('Hola');
});

intents.matches('Despedida', function (session, args, next) {
    session.send('Adios, hasta la proxima.');
});


intents.matches('Pedir',function (session, args, next) {
      const postres = ['Donuts','Manzana','Cookie'];
      const bebidas = ['Cocacola','Fanta de Naranja','Nestea','Aquarius','Fanta de limon','Agua'];
      const bocatas = ['Bocata de jamon','Bocata de bacon','Bocata de pollo'];
      var entityBocatas = builder.EntityRecognizer.findEntity(args.entities, 'Bocatas');
      var entityBebidas = builder.EntityRecognizer.findEntity(args.entities, 'Bebidas');
      var entityPostres = builder.EntityRecognizer.findEntity(args.entities, 'Postres');
      
      var carrito = [];  
  
     if(entityBocatas) {
     var matchBocatas = builder.EntityRecognizer.findBestMatch(bocatas, entityBocatas.entity); 
     carrito.push(matchBocatas.entity);
    }
    if (entityBebidas){
    var matchBebidas = builder.EntityRecognizer.findBestMatch(bebidas, entityBebidas.entity);
     carrito.push(matchBebidas.entity);
    }
    if (entityPostres){
    var matchPostres = builder.EntityRecognizer.findBestMatch(postres, entityPostres.entity);
    carrito.push(matchPostres.entity);
    }

    if(carrito.length!=0){
        session.send("Tu pedido es:")
        for(var i = 0 ; i < carrito.length ; i++){
            session.send(carrito[i])
        }
    }else{
        session.send("No tenemos ninguno de estos elementos, asegurate de pedir cosas que tengamos.")
    }
            

});
intents.matches('VerInventario', function (session, args, next) {
    session.send('tenemos para comer: bocatas, menus, bebidas y postres');
});

intents.matches('Estado', function (session, args, next) {
    session.send('Muy bien, ¿Y tu, que quieres comer?');
});

intents.matches('SaberHoraRecogida', function (session, args, next) {
    session.send('Estara listo a las 13:00, te viene bien?');
    });

     intents.matches('ConfirmaciónPositiva', function (session, args, next) {
    session.send('Genial');
});
 intents.matches('Agradecimiento', function (session, args, next) {
    session.send('De nada');
});
intents.matches('EasterEggFisica', function (session, args, next) {
    session.send('Eh biien ici ee alors ee, alors ouui ');
});


intents.onDefault(function (session) {
    session.send('Lo siento, no lo he entendido.');
});
