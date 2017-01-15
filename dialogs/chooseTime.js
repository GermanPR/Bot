var builder = require('botbuilder'),
    util = require('util'),
    core = require('../core/core');

module.exports = [
    function (session, args, next) {
        session.send("what_time");
        session.userData.precio_pedido = 0;

        builder.Prompts.choice(session, core.elegirHoraRecogida(session), "12:15 - 13:15|13:15 - 14:15|14:15 - 15:15");
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
];