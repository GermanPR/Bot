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
//Si un usuario 
intents.matches('Saludo', '/Saludo');

bot.dialog('/Saludo', [
    function (session, args, next) {
        //Con session.message.address.user.name recuperas el nombre del usuario en la red social. En este caso el nombre de Skype
        // session.send('¡Hola %s! (wave)', session.message.address.user.name)
        //si quieres sólo recuperar el nombre, sin los apellidos puedes hacer lo siguiente
        session.userData.pedido = [];
        var nombre = '¡Hola ' + getName(session) + '! (wave)\n ¿Quieres pedir?';
        builder.Prompts.choice(session, confirmacion(session, nombre), "Si|No");
        //Mostrar menú con las opciones disponibles *recomendación
    }, function (session, results) {
        switch (results.response.entity) {
            case 'Si':
                session.beginDialog('/SaberHora');
                break;
            case 'No':
                session.endDialog('Sin problema!(y) Cuando quieras dimelo!')
        }
    }
]);

//En caso de que el usuario quiera hacer un pedido se empieza por preguntarle cuando quiere recogerlo.
intents.matches('Pedir', '/SaberHora');

//Pregunta por la hora a la que el pedido sera recogido a traves de una HeroCard
bot.dialog('/SaberHora', [
    function (session, args, next) {
        session.send('Genial! ¿A que hora comes?(o)');

        builder.Prompts.choice(session, elegirHoraRecogida(session), "12:15 - 13:15|13:15 - 14:15|14:15 - 15:15");
    },
    function (session, results) {
        session.userData.time = null;
        switch (results.response.entity) {
            case '12:15 - 13:15':
                session.userData.time = results.response.entity;
                session.beginDialog('/pedir');
                break;

            case '13:15 - 14:15':
                session.userData.time = results.response.entity;
                session.beginDialog('/pedir');
                break;
            case '14:15 - 15:15':
                session.userData.time = results.response.entity;
                session.beginDialog('/pedir');
                break

        }
    }
]);

bot.dialog('/pedir', [
    function (session, results, next) {
        session.send('Ok (y) ¿Qué te gustaría pedir?');
        builder.Prompts.choice(session, elegirTipoAlimento(session), "Comida|Bebida|Postre");
    },
    function (session, results) {
        if (results.response) {
            session.send('Ok, empecemos con **%s**', results.response.entity);

            //Primero se filtra por categoría de comida (ensalada, bocata, pizza, tortilla, plato del día, wrap)
            var categorias = db.getCategorias(results.response.entity) //la base de datos es de mentira de momento          
            builder.Prompts.choice(session, '¿Qué tipo te apetece?:P', categorias);
        }
    },
    function (session, results) {
        if (results.response) {
            var categoria = results.response.entity;
            session.send('Has elegido **%s**(cool)', categoria);

            //Dentro de esa categoría habría que mostar los productos que hay
            var productos = db.getProductos(categoria);
            builder.Prompts.choice(session, 'Esto es lo que tenemos hoy', productos);
        }
    },
    function (session, results) {
        console.dir(results);
        if (results.response) {
            session.send('¡Perfecto! Marchando **%s**', results.response.entity);
            session.userData.pedido.push(results.response.entity);
            builder.Prompts.choice(session, confirmacion(session, '¿Quieres pedir algo más?'), "Si|No");
        }
    },
    function (session, results) {
        switch (results.response.entity) {
            case 'Si':
                session.beginDialog('/pedir');
                break;
            case 'No':
                session.send("Tu pedido es:")
                for (var i = 0; i < session.userData.pedido.length; i++) {
                    session.send(session.userData.pedido[i]);
                }
                session.send("Y llegará a las **%s**", session.userData.time)
                session.userData.pedido = [];

                builder.Prompts.choice(session, confirmacion(session, "¿Es correcto?"), 'Si|No');
                break;
        }
    },
    function (session, results) {
        switch (results.response.entity) {
            case 'Si':
                session.endDialog('Vale, Perfecto! El pago se realizará en la cafetería en el momento de la recogida.');
                break;
            case 'No':
                session.endDialog('Vale, pedido cancelado');
                break;
        }
    }
]);

intents.matches('VerInventario', function (session, args, next) {
    session.beginDialog('/pedir');
});

intents.matches('Estado', [
    function(session,args,next){
    session.send('Muy bien!!')
    builder.Prompts.choice(session, confirmacion(session, '¿Quieres comer?'), "Si|No");
        //Mostrar menú con las opciones disponibles *recomendación
    }, function (session, results) {
        switch (results.response.entity) {
            case 'Si':
                session.beginDialog('/SaberHora');
                break;
            case 'No':
                session.endDialog('Sin problema!(y) Cuando quieras dimelo!')
        }
    }
]);


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

intents.matches('TeamCounter', function (session, args, next) {
    session.send('Eres de TEAM COUNTER?! Carlamente que el proximo pedido te lo hago gratis tío.');
});

intents.onDefault(function (session) {
    session.send('Lo siento, no lo he entendido.');
});

intents.matches('Despedida', function (session, args, next) {
    session.send('Adios %s, hasta la proxima.', getName(session));
});

//FUNCTIONS

//Devuelve el Nombre sin apellido del usuario.
function getName(session) {
    var user = session.message.address.user.name;
    console.log(user);
    if( user == 'Xaquín Fernández'){
        user = 'guapo';
        return user;
    }else if( user == 'Paola Boudouresques'){
        user = 'pringada';
        return user;
    }else if( user == 'Aitana López'){
        user = 'sisster';
        return user;
    }else if( user == 'PLSY'){
        user = 'chache tu eres mi sielo';
        return user;
    }else if(user == 'German Parada' || user == 'Adrian Gabas'){
        user = 'jefe';
        return user;
    }else{
        return user.split(' ')[0];
    }
}

//Te permite crear una HeroCard con una pregunta cualquiera y que tenga por respuesta Si y No
function confirmacion(session, pregunta) {
    var confirmacion = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments([
            new builder.HeroCard(session)
                .title(pregunta)
                .buttons([
                    builder.CardAction.imBack(session, 'Si', 'Si'),
                    builder.CardAction.imBack(session, 'No', 'No')
                ])

        ]);
    return confirmacion;

}

//Función para elegir el tipo de alimento que el usuario quiere
function elegirTipoAlimento(session) {
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
    return msg;
}

//Función que permite preguntar a traves de una HeroCard en que intervalo de tiempo el usuario quiere recoger el pedido.
function elegirHoraRecogida(session) {
    var msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments([
            new builder.HeroCard(session)
                .title("12:15 - 13:15")
                .buttons([
                    builder.CardAction.imBack(session, "12:15 - 13:15", "Seleccionar")
                ]),
            new builder.HeroCard(session)
                .title("13:15 - 14:15")
                .buttons([
                    builder.CardAction.imBack(session, "13:15 - 14:15", "Seleccionar")
                ]),
            new builder.HeroCard(session)
                .title("14:15 - 15:15")
                .buttons([
                    builder.CardAction.imBack(session, "14:15 - 15:15", "Seleccionar")
                ]),
        ]);
        return msg;
}

/*var mysql = require('./db/sql_server.js');
mysql.test();*/
