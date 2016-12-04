var sql = require('mssql'),
    exports = module.exports = {},
    config = {
        user: 'cafeterialiceodefinitivo',
        password: 'cvk,9,qp',
        server: 'cafeterialiceodefinitivo.database.windows.net',
        database: 'botgerbas',

        options: {
            encrypt: true// Use this if you're on Windows Azure 
        }
    };
exports.query = function(cosa, tipo){
    var request = new sql.Request(connection);
     return request.query('select '+ cosa +' from '+tipo, function (err, results) {
            if (err) {
                console.log(err);
            } else {
                return results;
            }
        })
        
}

exports.getInfo = function (cosa, tipo) {
    var connection = new sql.Connection(config, function (err) {
        if (err) {
            console.log(err);
        }else{
        var request = new sql.Request(connection);

        }
    });
    
};

exports.getBbidas = function (callback) {
    var connection = new sql.Connection(config, function (err) {
        if (err) {
            console.log(err);
        }
        var request = new sql.Request(connection);
        request.query('select * from Bebidas', function (err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log("el producto es un " + results[0].tipo + " que vale " + results[0].precio + "€");
                callback(results);
            }
        })

    });
};

exports.getComida = function (callback) {
    var connection = new sql.Connection(config, function (err) {
        if (err) {
            console.log(err);
        }
        var request = new sql.Request(connection);
        request.query('select * from comida', function (err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log("el producto es un " + results[0].tipo + " que vale " + results[0].precio + "€");
                callback(results);
            }
        })

    });
};


exports.getPostres = function (results) {
    var arrayBebidas = [];
    for (var i = 0; i < results.length; i++) {
        arrayBebidas.push(results[i]);
    }
    console.log(arrayBebidas);
};