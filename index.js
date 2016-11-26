var restify = require('restify'),
    config = require('./config'),
    builder = require('botbuilder'),
    recognizer = new builder.LuisRecognizer(config.LUIS_URL),
    intents = new builder.IntentDialog({ recognizers: [recognizer] }),
    db = require('./db/sql_server')
// sql = require('mssql');

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

//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/', intents);

intents.matches('Saludo',
    function (session, args, next) {
        // if (!session.userData.name) {
        //     session.beginDialog('/profile');
        // } else {
        //     session.send('Hola %s!', session.userData.name);
        // }

        session.send('¡Hola %s!', session.message.address.user.name)

    });

intents.matches('Despedida', function (session, args, next) {
    session.send('Adios, hasta la proxima.');
});


intents.matches('Pedir', function (session, args, next) {
    /*var arrayBebidas = [];
    getData(function(results){
    for(var i = 0 ; i < results.length ; i++){
    arrayBebidas.push(results[i].tipo);
    }
})*/
    const postres = ['Fruta preparada', 'Fruta', 'Yogurt', 'Muffin de chocolate', 'Muffin de frutos rojos', 'Cookie'];
    const comida = ['Ensalada Caesar',
        'Ensalada de bacon y queso de cabra ',
        'Ensalada sweet chili noodles',
        'Ensalada de jamon y queso  ',
        'Sopa del dia ',
        'Yatekomo',
        'Yakisoba',
        'Bocata de tortilla ',
        'Bocata de bacon y queso fundido',
        'Bocata de lomo y queso fundido ',
        'Bocata de jamón serran y queso brie',
        'Dandwich vegetariano',
        'Pizza margarita',
        'Pizza de jamón y queso',
        'Pizza de champiñones y jamón ',
        'Pizza peperoni ',
        'Wrap de pollo ',
        'Wrap noruego ',
        'Tortilla ',
        'Plato del día ']
    const bebidas = ['Agua', 'Coca-Cola', 'Coca-Cola zero', 'Coca-cola light', 'Aquarios de Naranja', 'Aquarios de limon', 'Fanta de naranja', 'Fanta de Limon', 'Vitaminweel drink', 'Agua gaseosa', 'Zumo de naranja natura', 'Nestea'];
    var entityComidas = builder.EntityRecognizer.findEntity(args.entities, 'Comidas');
    var entityBebidas = builder.EntityRecognizer.findEntity(args.entities, 'Bebidas');
    /* if(arrayBebidas.length < 2){
         session.send("error");
     }else{*/
    var entityPostres = builder.EntityRecognizer.findEntity(args.entities, 'Postres');
    /*}*/
    var carrito = [];

    if (entityComidas) {
        var matchComidas = builder.EntityRecognizer.findBestMatch(comida, entityComidas.entity);
        carrito.push(matchComidas.entity);
    }
    if (entityBebidas) {
        var matchBebidas = builder.EntityRecognizer.findBestMatch(bebidas, entityBebidas.entity);
        carrito.push(matchBebidas.entity);
    }
    if (entityPostres) {
        var matchPostres = builder.EntityRecognizer.findBestMatch(postres, entityPostres.entity);
        carrito.push(matchPostres.entity);
    }

    if (carrito.length != 0) {
        session.send("Tu pedido es:")
        for (var i = 0; i < carrito.length; i++) {
            session.send(carrito[i])
        }
    } else {
        session.send("No tenemos ninguno de estos elementos, asegurate de pedir cosas que tengamos.")
    }


});

intents.matches('VerInventario', function (session, args, next) {
    db.getPostres(function (results) {
        session.send("Tenemos estos platos: ")
        for (var i = 0; i < results.length; i++) {
            var numero = i + 1;
            session.send(numero + "-" + results[i].nombre + " : " + results[i].precio + "€");
        }
    })
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
intents.matches('CambiarNombre', function (session, args, next) {
    session.beginDialog('/ChangeName');
});


bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hola!¿como te llamas?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);
bot.dialog('/ChangeName', [
    function (session) {
        builder.Prompts.text(session, 'Vale, ¿como quieres que te llame ahora?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);