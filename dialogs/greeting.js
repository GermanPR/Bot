var builder = require('botbuilder'),
    util = require('util');

module.exports = [
    function (session, args, next) {
        session.userData.pedido = [];
        var nombre = util.format(session.localizer.gettext(session.preferredLocale(), "greeting"), getName(session));
        builder.Prompts.choice(session, confirmacion(session, nombre), "Si|No");
    },
    function (session, results) {
        switch (results.response.entity) {
            case 'Si':
                session.beginDialog('/SaberHora');
                break;
            case 'No':
                session.endDialog('no_problem');
        }
    }
];