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
 
mongodb.connect(docDBURL, function (err, db) {
 
    if (err) {
        console.log('mongodb.connect error: %s', err);
    }
    else {
        var collection = db.collection('superheroes');
        
        collection.insertMany([{ name: 'Bocata de Bacon',
                                precio: "4,50€",
                                tipo:'comida',
                                stock:'10' },

                                { name: 'Coca-cola',
                                precio: "1€",
                                tipo:'bebida',
                                stock:'80' },
                                
                                { name: 'Mus de chocolaate',
                                precio: "1,5€",
                                tipo:'postre',
                                stock:'15' }],
                               
                              function (err, results) {
            if (err) {
                console.log('collection.insertMany error: %s', err);
            }
            else{
                console.log(results);
    }
});
//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/', intents);

intents.matches('Saludo', function (session, args, next) {
    session.send('Hola ');
});

intents.matches('Despedida', function (session, args, next) {
    session.send('Adios, hasta la proxima.');
});

intents.matches('VerInventario', function (session, args, next) {
    session.send('tenemos para comer bocatas');

});

intents.matches('Estado', function (session, args, next) {
    session.send('Muy bien, ¿Y tu, que quieres comer?');
});

intents.matches('SaberHoraRecogida', function (session, args, next) {
    session.send('Estara listo a las 13:00, te viene bien?');
    
        intents.matches('ConfirmaciónPositiva', function (session, args, next) {
    session.send('Genial');
});
intents.matches('ConfirmaciónPositiva', function (session, args, next) {
    session.send('Que?');

});




intents.onDefault(function (session) {
    session.send('Lo siento, no lo he entendido.');
});

                
            }
  });



