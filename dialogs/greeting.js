var builder = require('botbuilder'),
    util = require('util'),
    core = require('../core/core');

module.exports = [
    function (session, args, next) {
        session.userData.pedido = [];
        var nombre = util.format(session.localizer.gettext(session.preferredLocale(), "greeting"), core.getName(session));
        builder.Prompts.choice(session, core.confirmacion(session, nombre), "Si|No");
    },
    function (session, results) {
        switch (results.response.entity) {
            case 'yes':
                session.beginDialog('/SaberHora');
                break;
            case 'no':
                session.endDialog('no_problem');
        }
    }
];