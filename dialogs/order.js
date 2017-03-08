var builder = require('botbuilder'),
    mysql = require('../db/sql_server.js'),
    fs = require('fs'),
    util = require('util'),
    core = require('../core/core');

module.exports = [
    function (session, results, next) {
        session.send("what_you_want_to_eat?");
        var options = session.localizer.gettext(session.preferredLocale(), "type_food");
        builder.Prompts.choice(session, core.elegirTipoAlimento(session, options), options);
    },
    function (session, results) {
        if (results.response) {

            session.send(util.format(session.localizer.gettext(session.preferredLocale(), 'lets_start_with'), results.response.entity));
            switch (results.response.index) {
                case 0:
                    session.userData.Id_tipo = '1';
                    break;
                case 1:
                    session.userData.Id_tipo = '2';
                    break;
                case 2:
                    session.userData.Id_tipo = '3';
                    break;
            }
            //Primero se filtra por categoría de comida (ensalada, bocata, pizza, tortilla, plato del día, wrap)
            mysql.getData(session, 'categoria', 'Id_tipo =' + session.userData.Id_tipo, 'Nombre', function (err, resultados) {
                session.userData.productos = [];

                for (var i = 0; i < resultados.length; i++) {
                    session.userData.productos.push(session.localizer.gettext(session.preferredLocale(), resultados[i], 'products'));
                }
                builder.Prompts.choice(session, 'which_type?', session.userData.productos);
            });

        }
    },
    function (session, results) {
        if (results.response) {
            var categoria = results.response.entity;
            session.send(util.format(session.localizer.gettext(session.preferredLocale(), 'you_chose'), categoria));
            switch (results.response.entity) {
                case session.localizer.gettext(session.preferredLocale(), 'Ensalada', 'products'):
                    session.userData.Id_categoria = 1;
                    break;
                case session.localizer.gettext(session.preferredLocale(), 'Sopas', 'products'):
                    session.userData.Id_categoria = 2;
                    break;
                case 'Sandwich':
                    session.userData.Id_categoria = 3;
                    break;
                case 'Pizzas':
                    session.userData.Id_categoria = 4;
                    break;
                case session.localizer.gettext(session.preferredLocale(), 'Platos', 'products'):
                    session.userData.Id_categoria = 5;
                    break;
                case session.localizer.gettext(session.preferredLocale(), 'Aguas y Zumos', 'products'):
                    session.userData.Id_categoria = 6;
                    break;
                case session.localizer.gettext(session.preferredLocale(), 'Refrescos', 'products'):
                    session.userData.Id_categoria = 7;
                    break;
                case session.localizer.gettext(session.preferredLocale(), 'Frutas y yogures', 'products'):
                    session.userData.Id_categoria = 8;
                    break;
                case session.localizer.gettext(session.preferredLocale(), 'Bolleria', 'products'):
                    session.userData.Id_categoria = 9;
                    break;
            }


            //Dentro de esa categoría habría que mostar los productos que hay

            session.userData.productos;
            mysql.getData(session, 'producto', 'Id_categoria=' + session.userData.Id_categoria + ' AND Stock<>0', 'Nombre', function (err, resultados) {
                session.userData.productos = [];
                session.userData.productos_Es = [];
                for (var i = 0; i < resultados.length; i++) {
                    session.userData.productos_Es.push(resultados[i]);
                    session.userData.productos.push(session.localizer.gettext(session.preferredLocale(), resultados[i], 'products'));
                }
                builder.Prompts.choice(session, 'this_we_have', session.userData.productos);
            });


        }
    },
    function (session, results) {

        if (results.response) {
            session.userData.pedido.push(results.response.entity);
            session.userData.pedido.push(session.userData.productos_Es[results.response.index]);

            mysql.getPrice(session, session.userData.productos_Es[results.response.index], function (err, resultados) {

                session.userData.precio_pedido = session.userData.precio_pedido + parseFloat(resultados);
                session.send(util.format(session.localizer.gettext(session.preferredLocale(), 'perfect,food_ordered'), results.response.entity, resultados));
                // builder.Prompts.choice(session, core.confirmacion(session, 'anything_else?'), "Si|No");
                var options = session.localizer.gettext(session.preferredLocale(), "yes|no");
                core.selectOptions(session, 'anything_else?', options);
            });

        }
    },
    function (session, results) {

        var yes = session.localizer.gettext(session.preferredLocale(), 'yes');
        var no = session.localizer.gettext(session.preferredLocale(), 'no');

        switch (results.response.entity) {
            case yes:
                session.beginDialog('/pedir');
                break;
            case no:
                session.send("your_request_is")
                for (var i = 1; i < session.userData.pedido.length; i = i + 2) {
                    session.send(session.localizer.gettext(session.preferredLocale(), session.userData.pedido[i], 'products'));
                }


                mysql.horaPedido(session, session.userData.time, function (err, results) {
                    session.send(util.format(session.localizer.gettext(session.preferredLocale(), 'for_the_price_of'), session.userData.precio_pedido));
                    var tiempo = 15 + (results.length * 1);
                    session.userData.final_time = session.userData.time + tiempo;
                    session.send(util.format(session.localizer.gettext(session.preferredLocale(), "arrival_time"), session.userData.time, tiempo));

                    // builder.Prompts.choice(session, core.confirmacion(session, "is_it_correct?"), 'Si|No');
                    var options = session.localizer.gettext(session.preferredLocale(), "yes|no");
                    core.selectOptions(session, 'is_it_correct', options);
                    
                });

                break;
        }
    },
    function (session, results) {
        var yes = session.localizer.gettext(session.preferredLocale(), 'yes');
        var no = session.localizer.gettext(session.preferredLocale(), 'no');
        switch (results.response.entity) {
            case yes:

                for (var i = 1; i < session.userData.pedido.length; i = i + 2) {
                    session.userData.elementos = session.userData.elementos + ' ' + session.userData.pedido[i];
                }
                
                mysql.insertarPedido(session.message.address.user.name, session.userData.final_time, session.userData.time, session.userData.elementos, session.userData.precio_pedido);
                for (var i = 1; i < session.userData.pedido.length; i = i + 2) {
                    mysql.reducirStock(session, session.userData.pedido[i]);
                }
                session.userData.pedido = [];
                session.userData.elementos = '';
                session.endDialog('ok_perfect');
                break;
            case no:
                session.endDialog('ok_canceled');
                session.userData.pedido = [];
                break;
        }
        session.userData.pedido = [];
        session.userData.precio_pedido = 0;
    }
]