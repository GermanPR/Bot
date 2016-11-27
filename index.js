var restify = require('restify'),
    config = require('./config'),
    builder = require('botbuilder'),
    recognizer = new builder.LuisRecognizer(config.LUIS_URL),
    intents = new builder.IntentDialog({ recognizers: [recognizer] }),
    // db = require('./db/sql_server');
    db = require('./db/fakedb');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
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
    function(session, args, next) {
        //Con session.message.address.user.name recuperas el nombre del usuario en la red social. En este caso el nombre de Skype
        // session.send('¡Hola %s! (wave)', session.message.address.user.name)
        //si quieres sólo recuperar el nombre, sin los apellidos puedes hacer lo siguiente
        session.send('¡Hola %s! (wave)\n ¿Qué te gustaría hacer?', getName(session));

        //Mostrar menú con las opciones disponibles*


    });

intents.matches('Despedida', function(session, args, next) {
    session.send('Adios %s, hasta la proxima.', getName(session));
});

function getName(session) {
    var user = session.message.address.user.name;
    console.log(user);
    return user.split(' ')[0];
}

intents.matches('Pedir', '/pedir');

bot.dialog('/pedir', [
    function(session, args, next) {
        builder.Prompts.choice(session, 'Ok (y) ¿Qué te gustaría pedir?', 'Comida|Bebida|Postre');
    },
    function(session, results) {
        if (results.response) {
            session.send('Ok, empecemos con **%s**', results.response.entity);

            //Primero se filtra por categoría de comida (ensalada, bocata, pizza, tortilla, plato del día, wrap)
            var categorias = db.getCategorias(results.response.entity) //la base de datos es de mentira de momento          

            builder.Prompts.choice(session, '¿Qué tipo te apetece?', categorias);

        }
<<<<<<< HEAD
    },
    function(session, results) {
        if (results.response) {
            var categoria = results.response.entity;
            session.send('Has elegido %s', categoria);

            //Dentro de esa categoría habría que mostar los productos que hay
            var productos = db.getProductos(categoria);
            builder.Prompts.choice(session, 'Esto es lo que tenemos hoy', productos);
        }
    },
    function(session, results) {
        console.dir(results);
        if (results.response) {
            session.send('¡Perfecto! Marchando **%s**', results.response.entity);
=======
     });        

intents.matches('Despedida', function (session, args, next) {
    session.send('Adios, hasta la proxima.');
});


intents.matches('Pedir', function (session, args, next) {
    builder.Prompts.choice( session,

                'Que quieres comer?',

                [Ensalada, Pasta]);
    /*var arrayBebidas = [];
    getData(function(results){
    for(var i = 0 ; i < results.length ; i++){
    arrayBebidas.push(esults[i].tipo);
    } 
})*/
    /*const postres = ['Fruta preparada', 'Fruta', 'Yogurt','Muffin de chocolate','Muffin de frutos rojos','Cookie'];
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
    const bebidas = ['Agua', 'Coca-Cola','Coca-Cola zero','Coca-cola light','Aquarios de Naranja','Aquarios de limon','Fanta de naranja','Fanta de Limon','Vitaminweel drink','Agua gaseosa','Zumo de naranja natura', 'Nestea'];
    var entityComidas = builder.EntityRecognizer.findEntity(args.entities, 'Comidas');
    var entityBebidas = builder.EntityRecognizer.findEntity(args.entities, 'Bebidas');
    /* if(arrayBebidas.length < 2){
         session.sen("error");
     }else{*/
   /* var entityPostres = builder.EntityRecognizer.findEntity(args.entities, 'Postres');
    
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
>>>>>>> 3fdb833a1bb98fc6de59ec099f77e16168ae24c6

            builder.Prompts.confirm(session, '¿Quieres pedir algo más? (yes o no)');
            //Y aquí en vez de eso sería algo como ¿Algo más? O... ¿Y bebida? ¿Y postre?
        }
    },
    function(session, results) {
        if (results.response) {
            session.replaceDialog('/pedir');
        } else {
            session.send('Aquí iria el resumen del pedido');
        }
<<<<<<< HEAD
    }
]);

// intents.matches('Pedir', function (session, args, next) {
//     /*var arrayBebidas = [];
//     getData(function(results){
//     for(var i = 0 ; i < results.length ; i++){
//     arrayBebidas.push(results[i].tipo);
//     }
// })*/
//     const postres = ['Fruta preparada', 'Fruta', 'Yogurt', 'Muffin de chocolate', 'Muffin de frutos rojos', 'Cookie'];
//     const comida = ['Ensalada Caesar',
//         'Ensalada de bacon y queso de cabra ',
//         'Ensalada sweet chili noodles',
//         'Ensalada de jamon y queso  ',
//         'Sopa del dia ',
//         'Yatekomo',
//         'Yakisoba',
//         'Bocata de tortilla ',
//         'Bocata de bacon y queso fundido',
//         'Bocata de lomo y queso fundido',
//         'Bocata de jamón serran y queso brie',
//         'Dandwich vegetariano',
//         'Pizza margarita',
//         'Pizza de jamón y queso',
//         'Pizza de champiñones y jamón ',
//         'Pizza peperoni ',
//         'Wrap de pollo ',
//         'Wrap noruego ',
//         'Tortilla ',
//         'Plato del día ']
//     const bebidas = ['Agua', 'Coca-Cola', 'Coca-Cola zero', 'Coca-cola light', 'Aquarios de Naranja', 'Aquarios de limon', 'Fanta de naranja', 'Fanta de Limon', 'Vitaminweel drink', 'Agua gaseosa', 'Zumo de naranja natura', 'Nestea'];
//     var entityComidas = builder.EntityRecognizer.findEntity(args.entities, 'Comidas');
//     var entityBebidas = builder.EntityRecognizer.findEntity(args.entities, 'Bebidas');
//     /* if(arrayBebidas.length < 2){
//          session.send("error");
//      }else{*/
//     var entityPostres = builder.EntityRecognizer.findEntity(args.entities, 'Postres');
//     /*}*/
//     var carrito = [];

//     if (entityComidas) {
//         var matchComidas = builder.EntityRecognizer.findBestMatch(comida, entityComidas.entity);
//         carrito.push(matchComidas.entity);
//     }
//     if (entityBebidas) {
//         var matchBebidas = builder.EntityRecognizer.findBestMatch(bebidas, entityBebidas.entity);
//         carrito.push(matchBebidas.entity);
//     }
//     if (entityPostres) {
//         var matchPostres = builder.EntityRecognizer.findBestMatch(postres, entityPostres.entity);
//         carrito.push(matchPostres.entity);
//     }

//     if (carrito.length != 0) {
//         session.send("Tu pedido es:")
//         for (var i = 0; i < carrito.length; i++) {
//             session.send(carrito[i])
//         }
//     } else {
//         session.send("No tenemos ninguno de estos elementos, asegurate de pedir cosas que tengamos.")
//     }
// });

intents.matches('VerInventario', function(session, args, next) {
    db.getPostres(function(results) {
=======
    } else {
        session.send("No tenemos ninguno de estos elementos, asegurate de pedir cosas que tengamos.")
    }*/
    

});

intents.matches('VerInventario', function (session, args, next) {
    getPostres(function (results) {
>>>>>>> 3fdb833a1bb98fc6de59ec099f77e16168ae24c6
        session.send("Tenemos estos platos: ")
        for (var i = 0; i < results.length; i++) {
            var numero = i + 1;
            session.send(numero + "-" + results[i].nombre + " : " + results[i].precio + "€");
        }
    })
});

intents.matches('Estado', function(session, args, next) {
    session.send('Muy bien, ¿Y tu, que quieres comer?');
});

intents.matches('SaberHoraRecogida', function(session, args, next) {
    session.send('Estara listo a las 13:00, te viene bien?');
});

intents.matches('ConfirmaciónPositiva', function(session, args, next) {
    session.send('Genial');
});
intents.matches('Agradecimiento', function(session, args, next) {
    session.send('De nada');
});
intents.matches('EasterEggFisica', function(session, args, next) {
    session.send('Eh biien ici ee alors ee, alors ouui ');
});


intents.onDefault(function(session) {
    session.send('Lo siento, no lo he entendido.');
});
intents.matches('CambiarNombre', function(session, args, next) {
    session.beginDialog('/ChangeName');
});


bot.dialog('/profile', [
    function(session) {
        builder.Prompts.text(session, 'Hola!¿como te llamas?');
    },
    function(session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);
bot.dialog('/ChangeName', [
    function(session) {
        builder.Prompts.text(session, 'Vale, ¿como quieres que te llame ahora?');
    },
    function(session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);