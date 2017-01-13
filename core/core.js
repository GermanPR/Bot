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
    } else if (user == 'German Parada' || user == 'Adrian Gabas') {
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

    var ops = [];

    for (var i = 0; i < opts.length; i++) {
        ops.push(builder.CardAction.imBack(session, opts[i], opts[i]));
    }

    var msg = new builder.Message(session)
        .attachments([
            new builder.HeroCard(session)
                .title(text)
                .buttons(ops)
        ]);

    builder.Prompts.choice(session, msg, options);
};

