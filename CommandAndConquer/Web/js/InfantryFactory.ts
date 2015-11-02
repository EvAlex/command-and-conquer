
import VisualObject = require('./VisualObject');

class InfantryFactory extends VisualObject {
    types = [];
    loaded: boolean = true;
    infantryDetails = {
        'minigunner': {
            name: 'minigunner',
            label: 'Minigunner',
            speed: 8,
            cost: 100,
            sight: 1,
            hitPoints: 50,
            collisionRadius: 5,
            imagesToLoad: [
                { name: 'stand', count: 1, directionCount: 8 },
                { name: "walk", count: 6, directionCount: 8 },
                { name: "fire", count: 8, directionCount: 8 }
            ]
        }
    };
    preloadCount: number = 0;
    loadedCount: number = 0;

    

    load(name) {
        var details = this.infantryDetails[name];
        var infantryType = {
            defaults: {
                type: 'infantry',
                draw: this.draw,
                drawSelection: drawSelection,
                underPoint: underPoint,
                collision: this.collision,
                move: this.move,
                getLife: getLife,
                status: 'stand',
                animationSpeed: 4,
                health: details.hitPoints,
                pixelOffsetX: -50 / 2,
                pixelOffsetY: -39 / 2,
                pixelWidth: 16,
                pixelHeight: 16,
                pixelTop: 6,
                pixelLeft: 16
            },
            imageArray: []
        };

        //$.extend(infantryType,defaults);
            
        // Load all the images
        infantryType.imageArray = [];
        for (var i = details.imagesToLoad.length - 1; i >= 0; i--) {
            var constructImageCount = details.imagesToLoad[i].count;
            var constructImageDirectionCount = details.imagesToLoad[i].directionCount;
            var constructImageName = details.imagesToLoad[i].name;
            var imgArray = [];
            for (var j = 0; j < constructImageDirectionCount; j++) {
                imgArray[j] = (this.loadImageArray('units/infantry/' + name + '/' + name + '-' + constructImageName + '-' + j, constructImageCount, '.gif'));
            }
            //alert(imgArray)
            infantryType.imageArray[constructImageName] = imgArray;
        }
        // Add all the basic unit details
        $.extend(infantryType, details);
        this.types[name] = infantryType;
    }

    

    add(details): IUnit {
        var newInfantry = {
            moveDirection: 0,
            animationIndex: 0,
            team: game.currentLevel.team
        };
        var name = details.name;

        $.extend(newInfantry, this.types[name].defaults);
        $.extend(newInfantry, this.types[name]);
        $.extend(newInfantry, details);

        return newInfantry;
    }

    

}

export = InfantryFactory;