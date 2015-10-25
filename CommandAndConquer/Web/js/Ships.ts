
import VisualObject = require('./VisualObject');

class Ships extends VisualObject {
    types = [];

    load(name) {
        var shipType = {
            name: name

        };


    }

    add(newShip) {

        $.extend(newShip, this.types[name]);

    }

}

export = Ships;