var restify = require('restify');
var builder = require('botbuilder');
var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=05cc84c9-6d4a-497f-9981-cbcd438efece&subscription-key=71e4270a84a546fe814e1b0f6d4983cf');
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
var sql = require('mssql');
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


var config = {
    user: 'cafeterialiceodefinitivo',
    password: 'cvk,9,qp',
    server: 'cafeterialiceodefinitivo.database.windows.net',
    database: 'botgerbas',

    options: {
        encrypt: true// Use this if you're on Windows Azure 
    }
}
function getPostres(callback) {

    var connection = new sql.Connection(config, function (err) {
        if (err) {
            console.log(err);
        }
        var request = new sql.Request(connection);
        request.query('select * from postres', function (err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log("el producto es un " + results[0].tipo + " que vale " + results[0].precio + "€");
                callback(results);
            }
        })

    });
}
function getBebidas(callback) {

    var connection = new sql.Connection(config, function (err) {
        if (err) {
            console.log(err);
        }
        var request = new sql.Request(connection);
        request.query('select * from Bebidas', function (err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log("el producto es un " + results[0].tipo + " que vale " + results[0].precio + "€");
                callback(results);
            }
        })

    });
}
function getComida(callback) {

    var connection = new sql.Connection(config, function (err) {
        if (err) {
            console.log(err);
        }
        var request = new sql.Request(connection);
        request.query('select * from comida', function (err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log("el producto es un " + results[0].tipo + " que vale " + results[0].precio + "€");
                callback(results);
            }
        })

    });
}
var arrayBebidas = [];

getPostres(function (results) {
    for (var i = 0; i < results.length; i++) {
        arrayBebidas.push(results[i]);
    }
    console.log(arrayBebidas);
})






//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/', intents);

intents.matches('Saludo', [
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            builder.Prompts.choice(session,'Hola '+ session.userData.name + '! Que quieres hacer? \n1.  Pedir\n2.   Cancelar', ["Pedir", "Cancelar"]);
        }
    },
    function (session, results) {
        var selection = result.response;
        switch (selection) {
            case "Pedir":
                return session.beginDialog('/Pedir')
            case "Cancelar":
                return session.beginDialog('/Cancelar')
        }
    }]);



intents.matches('Despedida', function (session, args, next) {
    session.send('Adios, hasta la proxima.');
});


/*intents.matches('Pedir', function (session, args, next) {


});*/

intents.matches('VerInventario', function (session, args, next) {
    getPostres(function (results) {
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

bot.dialog('/Pedir',[
    function(session,args,next){
        builder.Prompts.choice(session,'Perfecto. ¿Que te gustaria pedir?\n1.  Comida\n2.  Bebida\n3.  Postres', ['Comida','Bebida','Postres']);
    },
    function(session,results){
        session.userData.pedido = results.response;
    }

]);