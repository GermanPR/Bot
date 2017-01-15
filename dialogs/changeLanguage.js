var builder = require('botbuilder'),
    mysql = require('../db/sql_server.js'),
    fs = require('fs'),
    util = require('util'),
    core = require('../core/core');

module.exports = [
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
];