var builder = require('botbuilder'),
    util = require('util'),
    core = require('../core/core');

module.exports = [
    function (session, args, next) {
        session.userData.pedido = [];
        var greeting = util.format(session.localizer.gettext(session.preferredLocale(), "greeting"), core.getName(session));
        var options = session.localizer.gettext(session.preferredLocale(), "yes|no");
        core.selectOptions(session, greeting, options);
        // builder.Prompts.choice(session, core.confirmacion(session, nombre), "Si|No");
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