var exports = module.exports = {};

exports.getCategorias = function(tipo) {

    switch (tipo) {
        case 'Comida':
            return ['Ensalada', 'Bocata', 'Pizza', 'Tortilla', 'Wrap', 'Plato del día'];
        case 'Bebida':
            return ['Agua', 'Coca-cola', 'Aquarios', 'Fanta', 'Vitaminweel drink', 'Zumo', 'Nestea'];
        case 'Postre':
            return ['Fruta', 'Yogurt', 'Muffin', 'Cookie'];
    }
};

exports.getProductos = function(categoria) {

    switch (categoria) {
        case 'Ensalada':
            return ['Ensalada Caesar', 'Ensalada de bacon y queso de cabra ', 'Ensalada sweet chili noodles', 'Ensalada de jamon y queso'];
        case 'Fruta':
            return ['Plátano', 'Manzana', 'Melón'];
        case 'Bocata':
            return ['Bocata de tortilla', 'Bocata de bacon y queso fundido', 'Bocata de lomo y queso fundido', 'Bocata de jamón serran y queso brie'];
        case 'Pizza':
            return ['Pizza margarita', 'Pizza de jamón y queso', 'Pizza de champiñones y jamón', 'Pizza peperoni'];
        case 'Wrap':
            return ['Wrap de pollo', 'Wrap noruego'];
        case 'Tortilla':
            return ['Tortilla francesa', 'Tortilla con patatas', 'Tortilla con pimientos'];
    }
};