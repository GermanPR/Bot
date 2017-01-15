var builder = require('botbuilder'),
    util = require('util'),
    fs = require('fs'),
    core = require('../core/core');

module.exports = [
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
];