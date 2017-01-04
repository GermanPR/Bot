var mysql = require('mysql'),
        mySQLconnString = process.env.MYSQLCONNSTR_localdb,
        exports = module.exports = {};

exports.changeStock = function (session, tabla, poner, where) {

         function getElement(params, key) {
                        for (var i = 0; i < params.length; i++) {
                        if (params[i].indexOf(key) > -1) {
                                                return params[i].substring(params[i].indexOf('=') + 1);
                                    }
                        }

                        throw "Key doesn't exist!";
            }

            var params = mySQLconnString.split(';'),
                        dbhost = getElement(params, 'Data Source'),
                        dbport = dbhost.substring(dbhost.indexOf(':') + 1),
                        dbhost = dbhost.substring(0, dbhost.indexOf(':')); //host without port    

            var connection = mysql.createConnection({
                        host: dbhost,
                        port: dbport,
                        user: getElement(params, 'User Id'),
                        password: getElement(params, 'Password'),
                        database: getElement(params, 'Database')

            });

            connection.connect(function (error) {
                        if (error) {
                                console.error(error);
                }
            });

        connection.query('Update %s Set %s where %s', tabla, poner, where, function (err, results) {
                if (err) {
                        console.log(err);
                } else {
                        console.log(results);
                }
        });


            connection.end();
}

exports.getData = function (session, tabla,id,field, callback) {

        function getElement(params, key) {
                for (var i = 0; i < params.length; i++) {
                        if (params[i].indexOf(key) > -1) {
                                return params[i].substring(params[i].indexOf('=') + 1);
                        }
                }

                throw "Key doesn't exist!";
        }

        var params = mySQLconnString.split(';'),
                dbhost = getElement(params, 'Data Source'),
                dbport = dbhost.substring(dbhost.indexOf(':') + 1),
                dbhost = dbhost.substring(0, dbhost.indexOf(':')); //host without port    

        var connection = mysql.createConnection({
                host: dbhost,
                port: dbport,
                user: getElement(params, 'User Id'),
                password: getElement(params, 'Password'),
                database: getElement(params, 'Database')

        });

        connection.connect(function (error) {
                if (error) {
                        console.error(error);
                }
        });
        connection.query('SELECT * from ' + tabla + ' where '+id, function (err, results) {
                var resultados = [];
                if (!err) {
                        for (var i = 0; i < results.length; i++) {
                                resultados.push(results[i].Nombre);
                                
                        }
                        callback(null,resultados);
                }
                else {
                        console.log('error:', err);
                }
        });


        connection.end();

}

exports.getPrice = function (session,nombre, callback) {

        function getElement(params, key) {
                for (var i = 0; i < params.length; i++) {
                        if (params[i].indexOf(key) > -1) {
                                return params[i].substring(params[i].indexOf('=') + 1);
                        }
                }

                throw "Key doesn't exist!";
        }

        var params = mySQLconnString.split(';'),
                dbhost = getElement(params, 'Data Source'),
                dbport = dbhost.substring(dbhost.indexOf(':') + 1),
                dbhost = dbhost.substring(0, dbhost.indexOf(':')); //host without port    

        var connection = mysql.createConnection({
                host: dbhost,
                port: dbport,
                user: getElement(params, 'User Id'),
                password: getElement(params, 'Password'),
                database: getElement(params, 'Database')

        });

        connection.connect(function (error) {
                if (error) {
                        console.error(error);
                }
        });
        connection.query('SELECT * from producto where Nombre=\''+nombre+'\'', function (err, results) {
                var resultados = [];
                if (!err) {
                        for (var i = 0; i < results.length; i++) {
                                resultados.push(results[i].Precio);
                                
                        }
                        callback(null,resultados);
                }
                else {
                        console.log('error:', err);
                }
        });


        connection.end();

}
exports.horaPedido = function (session, callback) {

        function getElement(params, key) {
                for (var i = 0; i < params.length; i++) {
                        if (params[i].indexOf(key) > -1) {
                                return params[i].substring(params[i].indexOf('=') + 1);
                        }
                }

                throw "Key doesn't exist!";
        }

        var params = mySQLconnString.split(';'),
                dbhost = getElement(params, 'Data Source'),
                dbport = dbhost.substring(dbhost.indexOf(':') + 1),
                dbhost = dbhost.substring(0, dbhost.indexOf(':')); //host without port    

        var connection = mysql.createConnection({
                host: dbhost,
                port: dbport,
                user: getElement(params, 'User Id'),
                password: getElement(params, 'Password'),
                database: getElement(params, 'Database')

        });

        connection.connect(function (error) {
                if (error) {
                        console.error(error);
                }
        });
        connection.query('Select * from pedidos',function(err,results){
               if(err){
                       console.log(err);
               }else{
                       callback(null,results);
               }
        });

        
}

exports.insertarPedido = function(nombre_usuario , hora_pedido , id_hora){

        function getElement(params, key) {
                for (var i = 0; i < params.length; i++) {
                        if (params[i].indexOf(key) > -1) {
                                return params[i].substring(params[i].indexOf('=') + 1);
                        }
                }

                throw "Key doesn't exist!";
        }

        var params = mySQLconnString.split(';'),
                dbhost = getElement(params, 'Data Source'),
                dbport = dbhost.substring(dbhost.indexOf(':') + 1),
                dbhost = dbhost.substring(0, dbhost.indexOf(':')); //host without port    

        var connection = mysql.createConnection({
                host: dbhost,
                port: dbport,
                user: getElement(params, 'User Id'),
                password: getElement(params, 'Password'),
                database: getElement(params, 'Database')

        });

        connection.connect(function (error) {
                if (error) {
                        console.error(error);
                }
        });

        var busqueda = ('INSERT INTO `pedidos`( `Nombre`, `Hora` , `id_hora` ) VALUES (\''+nombre_usuario+'\',\''+hora_pedido+'\',\''+id_hora+'\')');
        connection.query(busqueda,function(err,results) {
                
                if (err){
                        console.log('error:', err);
                }else{
                        console.log(results);
                }
        });


        connection.end();
}