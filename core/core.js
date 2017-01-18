var builder = require('botbuilder'),
    exports = module.exports = {};

exports.getName = function (session) {
    //Devuelve el Nombre sin apellido del usuario.
    var user = session.message.address.user.name;
    console.log(user);
    if (user == 'Xaquín Fernández') {
        user = 'guapo';
        return user;
    } else if (user == 'PLSY') {
        user = 'chache tu eres mi sielo';
        return user;
    } else if (/*user == 'German Parada' ||*/ user == 'Adrian Gabas') {
        user = 'jefe';
        return user;
    } else {
        return user.split(' ')[0];
    }
};

// exports.confirmacion = function(session, pregunta) {
//     var confirmacion = new builder.Message(session)
//         .textFormat(builder.TextFormat.xml)
//         .attachmentLayout(builder.AttachmentLayout.carousel)
//         .attachments([
//             new builder.HeroCard(session)
//                 .title(pregunta)
//                 .buttons([
//                     builder.CardAction.imBack(session, 'Si', 'Si'),
//                     builder.CardAction.imBack(session, 'No', 'No')
//                 ])

//         ]);
//     return confirmacion;

// };

exports.selectOptions = function(session, text, options) {

    var opts = options.split('|');
    var literal = session.localizer.gettext(session.preferredLocale(),text);   

    var ops = [];

    for (var i = 0; i < opts.length; i++) {
        ops.push(builder.CardAction.imBack(session, opts[i], opts[i]));
    }

    var msg = new builder.Message(session)
        .attachments([
            new builder.HeroCard(session)
                .title(literal)
                .buttons(ops)
        ]);

    builder.Prompts.choice(session, msg, options);
};

exports.elegirHoraRecogida = function(session) {
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

exports.elegirTipoAlimento = function(session,options) {
    var opts = options.split('|');
     
    var msg = new builder.Message(session)
        .textFormat(builder.TextFormat.xml)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments([
        new builder.HeroCard(session)
            .title(opts[0])
            .images([builder.CardImage.create(session, "https://botcafeteria.azurewebsites.net/public/images/comida-320px.jpg")])
            .buttons([builder.CardAction.imBack(session, opts[0], "Seleccionar")]),
        new builder.HeroCard(session)
            .title(opts[1])
            .images([builder.CardImage.create(session, "https://botcafeteria.azurewebsites.net/public/images/bebidas-320px.jpg")])
            .buttons([
            builder.CardAction.imBack(session, opts[1], "Seleccionar")]),
        new builder.HeroCard(session)
            .title(opts[2])
            .images([builder.CardImage.create(session, "https://botcafeteria.azurewebsites.net/public/images/postres-320px.jpg")])
            .buttons([ builder.CardAction.imBack(session, opts[2], "Seleccionar")])
    ]);
    return msg;
}
