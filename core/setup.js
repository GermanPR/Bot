var exports = module.exports = {},
    builder = require('botbuilder'),
    restify = require('restify'),
    config = require('../config');

exports.init = function (server) {

    //Connection with MS Bot Framework
    var connector = new builder.ChatConnector({
        appId: config.AppId,
        appPassword: config.AppPassword
    });

    var bot = new builder.UniversalBot(connector, {
        localizerSettings: {
            botLocalePath: './locale',
            defaultLocale: 'es'
        }
    });

    server.post('/api/messages', connector.listen());

    return bot;
};