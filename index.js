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

  insertDocuments(db, function() {
    updateDocument(db, function() {
      deleteDocument(db, function() {
        findDocuments(db, function() {
          db.close();
        });
      });
    });
  });

});
var insertDocuments = function(db, callback) {
  // Get the documents collection 
  var collection = db.collection('documents');
  // Insert some documents 
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the document collection");
    callback(result);
  });
}
var findDocuments = function(db, callback) {
  // Get the documents collection 
  var collection = db.collection('documents');
  // Find some documents 
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    assert.equal(2, docs.length);
    console.log("Found the following records");
    console.dir(docs);
    callback(docs);
  });
}
var deleteDocument = function(db, callback) {
  // Get the documents collection 
  var collection = db.collection('documents');
  // Insert some documents 
  collection.deleteOne({ a : 3 }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed the document with the field a equal to 3");
    callback(result);
  });
}
var updateDocument = function(db, callback) {
  // Get the documents collection 
  var collection = db.collection('documents');
  // Update document where a is 2, set b equal to 1 
  collection.updateOne({ a : 2 }
    , { $set: { b : 1 } }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Updated the document with the field a equal to 2");
    callback(result);
  });  
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

intents.matches('VerInventario', function (session, args, next) {
    session.send('Tenemos: Bocatas, Bebidas, Menus, Postres.');

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


intents.onDefault(function (session) {
    session.send('Lo siento, no lo he entendido.');
});

  


