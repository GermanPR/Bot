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

// Create chat bot
var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);
// var intents = new builder.IntentDialog();

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', intents);

intents.matches('Saludo', function (session, args, next) {
    session.send('Hola desde la intención Saludo');
});

intents.matches('Despedida', function (session, args, next) {
    session.send('Adios desde la intención despedida');
});

intents.onDefault(function (session) {
    session.send('Lo siento, no lo he entendido.');
});

// intents.matches(/^cambiar nombre/i, [
//     function (session, args, next) {
//         session.beginDialog('/profile');
//     },
//     function (session, results) {
//         session.send('Ok... Ahora te llamas %s', session.userData.name);
//     }
// ]);

// intents.onDefault([
//     function (session, args, next) {
//         if (!session.userData.name) {
//             session.beginDialog('/profile');
//         } else {
//             next();
        // }
//     },
//     function (session, results) {
//         session.send('Hola %s!', session.userData.name);
//     }
// ]);

// bot.dialog('/profile', [
//     function (session) {
//         builder.Prompts.text(session, 'Hola! Como te llamas?');
//     },
//     function (session, results) {
//         session.userData.name = results.response;
//         session.endDialog();
//     }
// ]);