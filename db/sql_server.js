var mysql = require('mysql'),
        mySQLconnString = process.env.MYSQLCONNSTR_localdb,
        exports = module.exports = {};

exports.test = function() {
 
    console.log('MYSQLCONNSTR_localdb');
    console.log(process.env.MYSQLCONNSTR_localdb);
 
    function getElement(params, key) {
        for (var i = 0; i < params.length; i++) { if (params[i].indexOf(key) > -1) {
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
 
    connection.connect(function(error) {
        if (error){
        console.error(error);
        }
    });
 
    connection.query('DROP TABLE test', function(err, result) {
 
        if (!err) {
            console.log('Result: ', result);
        }
        else {
            console.error(err);
        }
    });
 
    connection.query('CREATE TABLE test (id INT(100) NOT NULL AUTO_INCREMENT, name VARCHAR(50), PRIMARY KEY(id))', function(err, result) {
 
        if (!err) {
            console.log('Result: ', result);
        }
        else {
            console.error(err);
        }
    });
 
    var values = { name: 'Gisela' };
    connection.query('INSERT INTO test SET ?', values, function(err, result) {
        if (err) {
            console.error(err);
        }
    });
 
    connection.query('SELECT * from test', function(err, rows, fields) {
 
        if (!err) {
            console.log('Rows: ', rows);
        }
        else {
            console.log('error:', err);
        }
    });
 
    connection.end();
};

exports.testy = function (session) {

        console.log('MYSQLCONNSTR_localdb');
        console.log(process.env.MYSQLCONNSTR_localdb);

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
      connection.query('SELECT * from tipo where id=1', function (err, results) {

                if (!err) {
                        session.send(results[0].Nombre);
                }
                else {
                        console.log('error:', err);
                }
        });
        

        connection.end();
        
}