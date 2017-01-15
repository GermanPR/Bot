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
bot.dialog('/SaberHora', require('./dialogs/chooseTime.js'));/*[
    function (session, args, next) {
        session.send("what_time");
        session.userData.precio_pedido = 0;

        builder.Prompts.choice(session, elegirHoraRecogida(session), "12:15 - 13:15|13:15 - 14:15|14:15 - 15:15");
    },
    function (session, results) {
        session.userData.time = null;
        switch (results.response.entity) {
            case '12:15 - 13:15':
                session.userData.time = '12:';
                session.beginDialog('/pedir');
                break;

            case '13:15 - 14:15':
                session.userData.time = '13:';
                session.beginDialog('/pedir');
                break;
            case '14:15 - 15:15':
                session.userData.time = '14:';
                session.beginDialog('/pedir');
                break

        }
    }
]);*/

bot.dialog('/pedir', [
    function (session, results, next) {
        session.send("what_you_want_to_eat?");
        var options = session.localizer.gettext(session.preferredLocale(), "type_food");
        builder.Prompts.choice(session, elegirTipoAlimento(session, options), options);
    },
    function (session, results) {
        if (results.response) {

            session.send(util.format(session.localizer.gettext(session.preferredLocale(), 'lets_start_with'), results.response.entity));
            switch (results.response.index) {
                case 0:
                    session.userData.Id_tipo = '1';
                    break;
                case 1:
                    session.userData.Id_tipo = '2';
                    break;
                case 2:
                    session.userData.Id_tipo = '3';
                    break;
            }
            //Primero se filtra por categoría de comida (ensalada, bocata, pizza, tortilla, plato del día, wrap)
            mysql.getData(session, 'categoria', 'Id_tipo =' + session.userData.Id_tipo, 'Nombre', function (err, resultados) {
                session.userData.productos =[];
                
                for (var i = 0; i < resultados.length ; i++) {
                    session.userData.productos.push(session.localizer.gettext(session.preferredLocale(),resultados[i],'products'));
                }
                builder.Prompts.choice(session, 'which_type?', session.userData.productos);
            });

        }
    },
    function (session, results) {
        if (results.response) {
            var categoria = results.response.entity;
            session.send(util.format(session.localizer.gettext(session.preferredLocale(), 'you_chose'), categoria));
            switch (results.response.entity) {
                case session.localizer.gettext(session.preferredLocale(),'Ensalada','products'):
                    session.userData.Id_categoria = 1;
                    break;
                case session.localizer.gettext(session.preferredLocale(),'Sopas','products'):
                    session.userData.Id_categoria = 2;
                    break;
                case 'Sandwich':
                    session.userData.Id_categoria = 3;
                    break;
                case 'Pizzas':
                    session.userData.Id_categoria = 4;
                    break;
                case session.localizer.gettext(session.preferredLocale(),'Platos','products'):
                    session.userData.Id_categoria = 5;
                    break;
                case session.localizer.gettext(session.preferredLocale(),'Aguas y Zumos','products'):
                    session.userData.Id_categoria = 6;
                    break;
                case session.localizer.gettext(session.preferredLocale(),'Refrescos','products'):
                    session.userData.Id_categoria = 7;
                    break;
                case session.localizer.gettext(session.preferredLocale(),'Frutas y yogures','products'):
                    session.userData.Id_categoria = 8;
                    break;
                case session.localizer.gettext(session.preferredLocale(),'Bolleria','products'):
                    session.userData.Id_categoria = 9;
                    break;
            }


            //Dentro de esa categoría habría que mostar los productos que hay

            session.userData.productos;
            mysql.getData(session, 'producto', 'Id_categoria=' + session.userData.Id_categoria, 'Nombre', function (err, resultados) {
                session.userData.productos = [];
                session.userData.productos_Es = [];
                for (var i = 0; i < resultados.length ; i++) {
                    session.userData.productos_Es.push(resultados[i]);
                    session.userData.productos.push(session.localizer.gettext(session.preferredLocale(),resultados[i],'products'));
                }
                builder.Prompts.choice(session, 'this_we_have', session.userData.productos);
            });


        }
    },
    function (session, results) {

        if (results.response) {
            session.userData.pedido.push(results.response.entity);
            session.userData.pedido.push(session.userData.productos_Es[results.response.index]);

            mysql.getPrice(session, session.userData.productos_Es[results.response.index], function (err, resultados) {

                session.userData.precio_pedido = session.userData.precio_pedido + parseFloat(resultados);
                session.send(util.format(session.localizer.gettext(session.preferredLocale(), 'perfect,food_ordered'), results.response.entity, resultados));
                // builder.Prompts.choice(session, core.confirmacion(session, 'anything_else?'), "Si|No");
                var options = session.localizer.gettext(session.preferredLocale(), "yes|no");
                core.selectOptions(session, 'anything_else?', options);
            });

        }
    },
    function (session, results) {
        
        var yes = session.localizer.gettext(session.preferredLocale(), 'yes');
        var no = session.localizer.gettext(session.preferredLocale(), 'no');
        
        switch (results.response.entity) {
            case yes:
                session.beginDialog('/pedir');
                break;
            case no:
                session.send("your_request_is")
                for (var i = 1; i < session.userData.pedido.length; i=i+2) {
                    session.send(session.localizer.gettext(session.preferredLocale(),session.userData.pedido[i],'products'));
                }


                mysql.horaPedido(session, session.userData.time, function (err, results) {
                    session.send(util.format(session.localizer.gettext(session.preferredLocale(), 'for_the_price_of'), session.userData.precio_pedido));
                    var tiempo = 15 + (results.length * 1);
                    session.userData.final_time = session.userData.time + tiempo;
                    session.send(util.format(session.localizer.gettext(session.preferredLocale(), "arrival_time"), session.userData.time, tiempo));

                    // builder.Prompts.choice(session, core.confirmacion(session, "is_it_correct?"), 'Si|No');
                    var options = session.localizer.gettext(session.preferredLocale(), "yes|no");
                    core.selectOptions(session, 'is_it_correct', options);
                    session.userData.precio_pedido = 0;
                });

                break;
        }
    },
    function (session, results) {
        var yes = session.localizer.gettext(session.preferredLocale(), 'yes');
        var no = session.localizer.gettext(session.preferredLocale(), 'no');
        switch (results.response.entity) {
            case yes:
                session.endDialog('ok_perfect');
                mysql.insertarPedido(session.message.address.user.name, session.userData.final_time, session.userData.time);
                for (var i = 1; i < session.userData.pedido.length; i=i+2) {
                    mysql.reducirStock(session, session.userData.pedido[i]);
                }
                session.userData.pedido = [];
                break;
            case no:
                session.endDialog('ok_canceled');
                session.userData.pedido = [];
                break;
        }
        session.userData.pedido = [];
        session.userData.precio_pedido = 0;
    }
]);

intents.matches('VerInventario', function (session, args, next) {
    session.beginDialog('/pedir');
});

intents.matches('Estado', [
    function (session, args, next) {
        session.send('very_well');
        var options = session.localizer.gettext(session.preferredLocale(), "yes|no");
        core.selectOptions(session, 'want_to_eat?', options);
        // builder.Prompts.choice(session, core.confirmacion(session, 'want_to_eat?'), "Si|No");
    },
    function (session, results) {
        switch (results.response.entity) {
            case 'Si':
                session.beginDialog('/SaberHora');
                break;
            case 'No':
                session.endDialog("no_problem")
        }
    }
]);


intents.matches('SaberHoraRecogida', function (session, args, next) {
    session.send('Estara listo a las 13:00, te viene bien?');
});
intents.matches('Cambiar idioma', [
    function (session) {
        // Prompt the user to select their preferred locale
        // builder.Prompts.choice(session, "preferred_language?", 'Francés|Español');
        var options = session.localizer.gettext(session.preferredLocale(), "languages");
        core.selectOptions(session, 'preferred_language', options);
    },
    function (session, results) {
        // Update preferred locale
        var locale;
        switch (results.response.index) {
            case 0:
                locale = 'fr';

                break;
            case 1:
                locale = 'es';

                break;

        }
        session.preferredLocale(locale, function (err) {
            if (!err) {
                // Locale files loaded

                session.endDialog(util.format(session.localizer.gettext(session.preferredLocale(), "Your_preffered_language_is"), results.response.entity));
            } else {
                // Problem loading the selected locale
                session.error(err);
            }
        });
    }
]);

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

//FUNCTIONS

//Función para elegir el tipo de alimento que el usuario quiere
function elegirTipoAlimento(session,options) {
     var opts = options.split('|');
     
    var msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments([
        new builder.HeroCard(session)
            .title(opts[0])
            .images([
            builder.CardImage.create(session, "https://botcafeteria.azurewebsites.net/public/images/comida-320px.jpg")
        ])
            .buttons([
            builder.CardAction.imBack(session, opts[0], "Seleccionar")
        ]),
        new builder.HeroCard(session)
            .title(opts[1])
            .images([
            builder.CardImage.create(session, "https://botcafeteria.azurewebsites.net/public/images/bebidas-320px.jpg")
        ])
            .buttons([
            builder.CardAction.imBack(session, opts[1], "Seleccionar")
        ]),
        new builder.HeroCard(session)
            .title(opts[2])
            .images([
            builder.CardImage.create(session, "https://botcafeteria.azurewebsites.net/public/images/postres-320px.jpg")
        ])
            .buttons([
            builder.CardAction.imBack(session, opts[2], "Seleccionar")
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
