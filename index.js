var restify = require('restify'),
    config = require('./config'),
    builder = require('botbuilder'),
    recognizer = new builder.LuisRecognizer(config.LUIS_URL),
    intents = new builder.IntentDialog({ recognizers: [recognizer] }),
    db = require('./db/fakedb'), /* Esto está simulando una base de datos hasta que montemos la definitiva*/
    fs = require('fs');

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
    appId: config.AppId,
    appPassword: config.AppPassword
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

server.get(/\/public\/?.*/, restify.serveStatic({
    directory: __dirname
}));

//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/', intents);

intents.matches('Saludo', function (session, args, next) {
    //Con session.message.address.user.name recuperas el nombre del usuario en la red social. En este caso el nombre de Skype
    // session.send('¡Hola %s! (wave)', session.message.address.user.name)
    //si quieres sólo recuperar el nombre, sin los apellidos puedes hacer lo siguiente
    session.send('¡Hola %s! (wave)\n ¿Qué te gustaría hacer?', getName(session));
    //Mostrar menú con las opciones disponibles *recomendación
});

intents.matches('Despedida', function (session, args, next) {
    session.send('Adios %s, hasta la proxima.', getName(session));
});

function getName(session) {
    var user = session.message.address.user.name;
    console.log(user);
    return user.split(' ')[0];
}


intents.matches('Pedir', '/pedir');

bot.dialog('/pedir', [
    function (session, args, next) {
        // builder.Prompts.choice(session, 'Ok (y) ¿Qué te gustaría pedir?', 'Comida|Bebida|Postre');
        session.send(session, 'Ok (y) ¿Qué te gustaría pedir?');

        //Formato carrusel
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("Comida")
                    .images([
                        builder.CardImage.create(session, "https://botcafeteria.azurewebsites.net/public/images/comida-320px.jpg")
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, "Comida", "Seleccionar")
                    ]),
                new builder.HeroCard(session)
                    .title("Bebida")
                    .images([
                        builder.CardImage.create(session, "https://botcafeteria.azurewebsites.net/public/images/bebidas-320px.jpg")
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, "Bebida", "Seleccionar")
                    ]),
                new builder.HeroCard(session)
                    .title("Postre")
                    .images([
                        builder.CardImage.create(session, "https://botcafeteria.azurewebsites.net/public/images/postres-320px.jpg")
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, "Postre", "Seleccionar")
                    ])
            ]);

        builder.Prompts.choice(session, msg, "Comida|Bebida|Postre");

    },
    function (session, results) {
        if (results.response) {
            session.send('Ok, empecemos con **%s**', results.response.entity);

            //Primero se filtra por categoría de comida (ensalada, bocata, pizza, tortilla, plato del día, wrap)
            var categorias = db.getCategorias(results.response.entity) //la base de datos es de mentira de momento          

            builder.Prompts.choice(session, '¿Qué tipo te apetece?', categorias);

        }
    },
    function (session, results) {
        if (results.response) {
            var categoria = results.response.entity;
            session.send('Has elegido %s', categoria);

            //Dentro de esa categoría habría que mostar los productos que hay
            var productos = db.getProductos(categoria);
            builder.Prompts.choice(session, 'Esto es lo que tenemos hoy', productos);
        }
    },
    function (session, results) {
        console.dir(results);
        if (results.response) {
            session.send('¡Perfecto! Marchando **%s**', results.response.entity);
            var confirmacion = new builder.Message(session)
                .textFormat(builder.TextFormat.markdown)
                .attachmentLayout(builder.AttachmentLayout.carousel)
                .attachments([
                    new builder.HeroCard(session)
                        .title("¿Quieres pedir algo más?")
                        .buttons([
                            builder.CardAction.imBack(session, 'Si','Si'),
                            builder.CardAction.imBack(session, 'No','No')
                        ])
                        
                ]);
            builder.Prompts.choice(session, confirmacion,"Si|No");
        }
    },
    function (session, results) {
        switch (results.response.entity) {
            case 'Si':
                session.beginDialog('/pedir');
                break;
            case 'No':
                session.endDialog('Vale! Hasta la proxima y que aproveche!');
                break;
        }
    }
]);


intents.matches('VerInventario', function (session, args, next) {
    session.beginDialog('/pedir');
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