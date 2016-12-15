var mysql = require('mysql'),
        mySQLconnString = process.env.MYSQLCONNSTR_localdb,
        exports = module.exports = {};

exports.changeStock = function() {
 
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
    
    connection.query('Update %s Set %s where %s',tabla,set,where,function(err,results){
            if(err){
                    console.log(err);
            }else{
                    console.log(results);
            }
    }
 
 
    connection.end();
}

exports.getData = function (session, tabla, id , field) {

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
      connection.query('SELECT * from '+ tabla +' where id=' + id, function (err, results) {

                if (!err) {
                        session.send(results[0].field);
                }
                else {
                        console.log('error:', err);
                }
        });
        

        connection.end();
        
}
