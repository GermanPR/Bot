var restify = require('restify'),
    config = require('./config'),
    builder = require('botbuilder'),
    setup = require('./core/setup'),
    recognizer_es = new builder.LuisRecognizer(config.LUIS_URL_ES),
    recognizer_fr = new builder.LuisRecognizer(config.LUIS_URL_FR),
    intents = new builder.IntentDialog({
        recognizers: [recognizer_es, recognizer_fr]
    }),
    fs = require('fs'),
    util = require('util'),
    core = require('./core/core'),
    mysql = require('./db/sql_server.js');
    

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

server.get(/\/public\/?.*/, restify.serveStatic({
    directory: __dirname
}));


var bot = setup.init(server);


//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/', intents);
//Si un usuario 
intents.matches('Saludo', '/Saludo');

bot.dialog('/Saludo', require('./dialogs/greeting'));

//En caso de que el usuario quiera hacer un pedido se empieza por preguntarle cuando quiere recogerlo.
intents.matches('Pedir', '/SaberHora');

//Pregunta por la hora a la que el pedido sera recogido a traves de una HeroCard
bot.dialog('/SaberHora', require('./dialogs/chooseTime'));

bot.dialog('/pedir', require('./dialogs/order')); 
intents.matches('VerInventario', function (session, args, next) {
    session.beginDialog('/pedir');
});

intents.matches('Estado', require('./dialogs/formalities'));

intents.matches('SaberHoraRecogida', function (session, args, next) {
    session.send('Estara listo a las 13:00, te viene bien?');
});
intents.matches('Cambiar idioma', require('./dialogs/changeLanguage'));

intents.matches('ConfirmaciónPositiva', function (session, args, next) {
    session.send('Genial');
});

intents.matches('Agradecimiento', function (session, args, next) {
    session.send('De nada');
});

intents.matches('EasterEggFisica', function (session, args, next) {
    session.send('Eh biien ici ee alors ee, alors ouui ');
});

intents.matches('TeamCounter', function (session, args, next) {
    session.send('Eres de TEAM COUNTER?! Carlamente que el proximo pedido te lo hago gratis tío.');
});

intents.onDefault(function (session) {
    session.send('Lo siento, no lo he entendido.');
});

intents.matches('Despedida', function (session, args, next) {
    session.send('Adios %s, hasta la proxima.', core.getName(session));
});

